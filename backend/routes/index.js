var router = require('express').Router();
const { exec } = require('child_process');
const fs = require('fs');
const fsPromises = fs.promises ;
const path = require('path');
//local modules
const RedisHandler = require('../RedisHandler');
const MiniZnResults = require('../ResultParser');
const utils = require('../utils');

//only in dev
const minizinc_executable = process.platform == 'win32' ? 'minizinc.exe' : 'minizinc' ;

router.get('/' ,(req, res)=>{
    res.sendFile(path.join(__dirname, '../../ozinc/build/index.html'))
});


function launch_minizinc(response){
    fsPromises.chmod(path.join(process.env.HOME,'/tmp/oils.mzn'),0o666)
        .then(()=>{
            console.log("Access to all");
            exec(`${path.join(process.env.HOME,`/MiniZincIDE-2.3.2-bundle-linux/bin/${minizinc_executable}`)} --solver cbc ${path.join(process.env.HOME,'/tmp/oils.mzn')} ${path.join(process.env.HOME,'/tmp/oils-data.dzn')}`, (err, stdout, stderr)=>{
            //console.log(stdout);
            if (!stderr){
                if (stdout.includes('UNSATISFIABLE') ){
                    response.json("No results");
                }
                else {
                    let minizinc_results = new MiniZnResults();
                    minizinc_results.parse_results(stdout);
                    response.send(minizinc_results.get_result_object);
                }
                
            }
            else {
                console.log("Error"+stderr);
                //send back standard response?
            }
            });
        })
        .catch(()=>{
            console.log("Couldn't change permissions");
        })
    
}

function createTempFileWithRedisData(key, filename, next){
    RedisHandler.getRedisInstance().lrange(key,0,-1,(error, items)=>{

        let recombined_string = utils.recombineRedisString(items);
        
        fs.writeFile(path.join(process.env.HOME,`/tmp/${filename}`),recombined_string, (err)=>{
            if (err){
                throw err ;
            }
            next();
        });
    });

}

//first rewrites temp model, then temp data, then launches minizinc
router.get('/getMinizincResults',(req, res, next)=>{
    createTempFileWithRedisData(RedisHandler.getModelKey(),'oils.mzn',next);
});

router.get('/getMinizincResults',(req, res,next)=>{
    createTempFileWithRedisData(RedisHandler.getDataKey(), 'oils-data.dzn', next);
});

router.get('/getMinizincResults',(req, res)=>{
    try {
        launch_minizinc(res);    
    } catch (error) {
        console.log(error);
    }
})

function updateName(data_file_content, previous_target_underscored, next_target_underscored){
    
    
    data_file_content = data_file_content.replace(previous_target_underscored, 'TAG');
    data_file_content = data_file_content.replace(next_target_underscored, previous_target_underscored);
    data_file_content = data_file_content.replace('TAG', next_target_underscored);
    //console.log(data_file_content);
    return data_file_content;
}

function next_target_index(data_file_content, next_target_underscored){
    let index_oil_names = data_file_content.search("%OilsNamesPlaceholder");
    //start from this position so we have a way to count indexes
    let lines = data_file_content.slice(index_oil_names).split(/\r?\n/);
    lines.shift();
    let target_index ;

    for (var i = 0; i < lines.length; i++){
        if (lines[i].includes(next_target_underscored)){
            target_index = i ; //first line is the placeholder
        }
        if (lines[i] == ''){
            break ;
        }
    }
    return [target_index, i];
}
//swap target array with the corresponding column
function updateMatrix(model_variable_name, data_file_content, index_to_swap, numberOfNonTarget){
    let model_variable_index, model_variable_target_index;
    [model_variable_index, model_variable_target_index] = utils.findVariableModelIndexes(model_variable_name, data_file_content);

    //console.log(data_file_content.slice(model_variable_target_index));

    //find the indexes to slice the matrix and the target array
    let begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array ;
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils.findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data_file_content);
    let model_variable_matrix = JSON.parse(data_file_content.slice(begin_variable_array, end_variable_array+1).replace(/\|/g,'').replace(/\s/g,''));
    let model_target_array = JSON.parse(data_file_content.slice(begin_variable_target_array, end_variable_target_array+1));
    //swap target array with the index_to_swap-th column
    var target_index = 0 ;
    for (let i = 0; i < model_variable_matrix.length; i++){
        if ((i % numberOfNonTarget) == index_to_swap){
            [model_variable_matrix[i], model_target_array[target_index]] = [model_target_array[target_index], model_variable_matrix[i]] ;
            target_index++ ;
        }
    }
    //console.log(model_variable_matrix.slice(599));

    model_variable_matrix = '[|' + model_variable_matrix.map(n => n.toString()).join() + '|]';//separator defaults to comma
    model_target_array = '[' + model_target_array.map(n => n.toString()).join() + ']';

    
    let model_variable_matrix_minizinc = utils.fillWithSeparators(model_variable_matrix,10);
    

    data_file_content = data_file_content.replace(data_file_content
        .slice(model_variable_index, end_variable_array+1),model_variable_name + ' = ' + model_variable_matrix_minizinc);
    //recomputes indexes since the string has been modified and so are the variables position in it
    [model_variable_index, model_variable_target_index] = utils.findVariableModelIndexes(model_variable_name,data_file_content);
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils.findArrayIndexes('[',']',model_variable_index, model_variable_target_index,data_file_content);
    data_file_content = data_file_content.replace(data_file_content
        .slice(model_variable_target_index, end_variable_target_array+1),`${model_variable_name}_target = ${model_target_array}`);
    return data_file_content;
}

//reads from redis, updates data and uses a multi transaction
//to delete and recreate the key with the updated data
//the watch (optimistic lock) allows to retry in case there's race condition
function redisTransaction(req, res){
    RedisHandler.getRedisInstance().lrange(RedisHandler.getDataKey(),0,-1,(error, items)=>{
        let data_file_content = utils.recombineRedisString(items);
        let index_to_swap, numberOfNonTarget ;
        //need to put _ between spaces as is in the data file
        let previous_target_underscored = req.body.previousTarget.replace(/\s/g,'_') ;
        let next_target_underscored = req.body.nextTarget.replace(/\s/g,'_') ;
        //this index corresponds to the column index to swap in the matrix 
        [index_to_swap, numberOfNonTarget] = next_target_index(data_file_content, next_target_underscored) ;
        
        data_file_content = updateName(data_file_content, previous_target_underscored, next_target_underscored);
        data_file_content = updateMatrix("concentrations", data_file_content, index_to_swap, numberOfNonTarget);

        let lines = data_file_content.split(/\r?\n/);
        
        RedisHandler.getRedisInstance().multi()
            .del(RedisHandler.getDataKey())
            .rpush(RedisHandler.getDataKey(), ...lines)
            .exec((e, results)=>{
                
                if (e){
                    throw e ;
                }

                if (!results){
                    console.log('recursion..');
                    redisTransaction(req, res);
                }
                else {
                    res.sendStatus(200);
                }

                
            });
        
    
    });
}

router.put('/changeTarget', (req, res, next)=>{
    RedisHandler.getRedisInstance().watch(RedisHandler.getDataKey(), (err)=>{
        if (err) {
            throw err ;
        }

        redisTransaction(req, res);
    });
});

module.exports = router ;