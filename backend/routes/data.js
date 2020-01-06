var router = require('express').Router();
const fs = require('fs');
const path = require('path');
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

function getCosts(data){

    const model_variable_name = 'costs';
    let model_variable_index, begin_variable_array, end_variable_array, model_variable_target_index,
        cost_array, cost_target;
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data);
    

    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data);
    //ignore target index values
    cost_array = JSON.parse(data.slice(begin_variable_array,end_variable_array + 1));
    cost_target = parseFloat(data.slice(model_variable_target_index, data.indexOf(';',model_variable_target_index))
        .match(/((0(\.\d+)?)|([1-9]\d*(\.\d+)?))/g)[0]);

    //again target cost last element
    cost_array.push(cost_target);
    return cost_array;

}

function getThresholds(data){
    const model_variable_name = 'threshold';
    let model_variable_index, begin_variable_array, end_variable_array, model_variable_target_index,
        thresholds ;
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data);
    

    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data);
    //ignore target index values
    thresholds = JSON.parse(data.slice(begin_variable_array,end_variable_array + 1));
    return thresholds ; 
}

router.get('/concentrations',(req,res)=>{

    RedisHandler.getRedisInstance().lrange(RedisHandler.getDataKey(),0,-1,(error, items)=>{

        let data = utils.recombineRedisString(items);
        let result = {};

        result['costs'] = getCosts(data);
        result['oils'] = getOilorVOCsNames(data, 'Oils');
        result['voc'] = getOilorVOCsNames(data, 'VOCs');
        result['concentrations'] = getConcentrations(data);
        result['thresholds'] = getThresholds(data);
        console.log(result['thresholds']);
        res.json(result);
    });
        
});

function changeConcentrations(data_file_content, concentration_matrix_string, concentration_target_string){
    const model_variable_name = 'concentrations';
    let model_variable_index, model_variable_target_index, begin_variable_array,
            end_variable_array, end_variable_target_array, begin_variable_target_array ;
    
    //concentrations
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
    return data_file_content ;
}

function changeCosts(data_file_content, cost_array){

    const model_variable_name = 'costs';
    let model_variable_index, begin_variable_array, end_variable_array, model_variable_target_index,
        cost_target;
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data_file_content);
    
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data_file_content);

    cost_target = cost_array.pop();
    data_file_content = data_file_content.replace(data_file_content.slice(begin_variable_array,end_variable_array+1)
        , `[${cost_array.join()}]`);
    
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data_file_content);
    data_file_content = data_file_content.replace(data_file_content.slice(data_file_content.indexOf('=',model_variable_target_index) + 1, 
        data_file_content.indexOf(';',model_variable_target_index)), cost_target);
    //target?
    return data_file_content;
}

function changeThresholds(data_file_content, thresholds){
    const model_variable_name = 'threshold';
    let model_variable_index, begin_variable_array, end_variable_array, model_variable_target_index;
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data_file_content);
    
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data_file_content);
    
    //ignore targets, will yield -1
    data_file_content = data_file_content.replace(data_file_content.slice(begin_variable_array,end_variable_array+1)
        , `[${thresholds.join()}]`);
    return data_file_content;
}

function redisTransaction(req, res){
    RedisHandler.getRedisInstance().lrange(RedisHandler.getDataKey(),0,-1,(error, items)=>{
        
        
        let concentration_target_array = [], thresholds = [] ;

        data_file_content = utils.recombineRedisString(items);
        
        let cost_array = req.body.newCnc.shift();
        cost_array.splice(-1,1); //eliminate last void character
        //removes last element of each subarray to form target (except first array of costs)
        req.body.newCnc.forEach((val, index)=>{
            thresholds.push(parseFloat(val.splice(-1,1).join()));
            concentration_target_array.push(parseFloat(val.splice(-1,1).join()));
        });
        let concentration_matrix_string = req.body.newCnc.join();
        let concentration_target_string = concentration_target_array.join();
        
        data_file_content = changeConcentrations(data_file_content, concentration_matrix_string, concentration_target_string);
        data_file_content = changeCosts(data_file_content, cost_array);
        data_file_content = changeThresholds(data_file_content, thresholds);
        //now costs
        let lines = data_file_content.split(/\r?\n/);
            
        RedisHandler.getRedisInstance().multi()
            .del(RedisHandler.getDataKey())
            .rpush(RedisHandler.getDataKey(), ...lines)
            .exec((e, results)=>{
                
                if (e){
                    throw e ;
                }
                if (!results){
                    redisTransaction(req, res);
                }
                else {
                    res.sendStatus(200);
                }
                
            });        
    });    

}

router.put('/changeData',(req,res,next)=>{
    
    var data_file_content ;
    RedisHandler.getRedisInstance().watch(RedisHandler.getDataKey(), (err)=>{
        if (err) {
            throw err ;
        }
        redisTransaction(req, res);
    });


});

module.exports = router ;