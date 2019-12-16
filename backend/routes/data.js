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
    
    console.log(oils_names);
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

        let data = '';
        for (let item of items){
            data += `${item}\n`;
        }
        let result = {};

        
        result['oils'] = getOilorVOCsNames(data, 'Oils');
        result['voc'] = getOilorVOCsNames(data, 'VOCs');
        result['concentrations'] = getConcentrations(data);
        console.log(result);
        res.json(result);
    });
        
});

module.exports = router ;