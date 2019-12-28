var router = require('express').Router();
const fs = require('fs');

const RedisHandler = require('../RedisHandler');
const utils = require('../utils');

router.get('/',(req, res)=>{
    res.json('Data page');
});

function getOilorVOCsNames(data, name){
    let model_variable_name = name;
    let model_variable_index, model_variable_target_index, begin_variable_array,
            end_variable_array, end_variable_target_array, begin_variable_target_array ;

    //find indexes
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data);
    //target doesn't exist, will be -1
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('{','}',model_variable_index, model_variable_target_index, data);
    
    //slice the interesting part of the string
    let oils_names = data.slice(begin_variable_array, end_variable_array+1)
        .replace(/_/g,' ').replace(/\n/g,'');
    
    //form an array out of the enum type in minizinc
    let oils_names_array = [], tmp = '';
    for (let ch of oils_names){
        if (ch == ','){
            oils_names_array.push(tmp.trim());
            tmp = '';
        }
        else {
            if (ch != '{' && ch != '}'){
                tmp += ch ;
            }
        }
    }
    oils_names_array.push(tmp.trim());

    if (name === 'Oils'){
        model_variable_name = 'Target_name';
        [model_variable_index, model_variable_target_index] = utils
            .findVariableModelIndexes(model_variable_name, data);
        [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
            .findArrayIndexes('"',';',model_variable_index, model_variable_target_index, data);
        
        oils_names_array.push(data.slice(begin_variable_array, end_variable_array).replace(/_/g,' ').replace(/"/g,''));
    
    }
    return oils_names_array;
}

function getConcentrations(data){

    const model_variable_name = 'concentrations';
    let model_variable_index, model_variable_target_index, begin_variable_array,
        end_variable_array, end_variable_target_array, begin_variable_target_array ;

    //indexes
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data);
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data);
    
    
    let concentration_target = JSON.parse(data.slice(begin_variable_target_array,end_variable_target_array + 1));
    //need to first replace |
    let concentration_str = data.slice(begin_variable_array,end_variable_array + 1).replace(/\|/g,'');
    //convert to js array and, every 10 elements, push to the matrix
    let temparray = JSON.parse(concentration_str);
    let i, concentration_matrix = [], column = 10 ;

    for (i = 0; i < temparray.length; i += column){
        concentration_matrix.push(temparray.slice(i, i+column));
    }
    //add target array as the last column
    concentration_matrix.forEach((val, index)=>{
        val.push(concentration_target[index]);
    });
    return concentration_matrix;
}

router.get('/concentrations',(req,res)=>{

    RedisHandler.getRedisInstance().lrange(RedisHandler.getDataKey(),0,-1,(error, items)=>{

        let data = utils.recombineRedisString(items);
        let result = {};

        
        result['oils'] = getOilorVOCsNames(data, 'Oils');
        result['voc'] = getOilorVOCsNames(data, 'VOCs');
        result['concentrations'] = getConcentrations(data);
        res.json(result);
    });
        
});

router.put('/changeConcentrations',(req,res,next)=>{
    
    var data_file_content ;

    RedisHandler.getRedisInstance().lrange(RedisHandler.getDataKey(),0,-1,(error, items)=>{
        
        const model_variable_name = 'concentrations';
        let concentration_target_array = [] ;

        data_file_content = utils.recombineRedisString(items);
        req.body.newCnc.forEach((val, index)=>{
            concentration_target_array.push(parseFloat(val.splice(-1,1).join()));
        });
        let concentration_matrix_string = req.body.newCnc.join();
        let concentration_target_string = concentration_target_array.join();
    
        
        let model_variable_index, model_variable_target_index, begin_variable_array,
            end_variable_array, end_variable_target_array, begin_variable_target_array ;
    
        //indexes
        [model_variable_index, model_variable_target_index] = utils
            .findVariableModelIndexes(model_variable_name, data_file_content);
        [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
            .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data_file_content);
        
        concentration_matrix_string = `[| ${concentration_matrix_string} |]`;
        concentration_target_string = `[${concentration_target_string}]`;

        concentration_matrix_string = utils.fillWithSeparators(concentration_matrix_string,10);
        data_file_content = data_file_content.replace(data_file_content
            .slice(begin_variable_array,end_variable_array+1), concentration_matrix_string);
        
        //repeat bc might have changed size
        [model_variable_index, model_variable_target_index] = utils
            .findVariableModelIndexes(model_variable_name, data_file_content);
        [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
            .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data_file_content);
        
        data_file_content = data_file_content.replace(data_file_content
            .slice(begin_variable_target_array,end_variable_target_array+1), concentration_target_string);

        res.locals.data_file_content = data_file_content ;
        next();
    });

});

router.put('/changeConcentrations',(req,res)=>{
    RedisHandler.getRedisInstance().del(RedisHandler.getDataKey());

    let data_file_content = res.locals.data_file_content;
    const lines = data_file_content.split(/\r?\n/);
    for (let line of lines){
        RedisHandler.getRedisInstance().rpush(RedisHandler.getDataKey(),line);        
    }

    fs.writeFile(path.join(__dirname,'../../tmp/oils-data.dzn'),data_file_content,(err)=>{
        if (err) {
            throw err;
        }
        res.sendStatus(200);
    });
})

module.exports = router ;