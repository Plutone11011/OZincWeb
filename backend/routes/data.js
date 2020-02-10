var router = require('express').Router();
const fs = require('fs');
const path = require('path');
const utils = require('../utils');

router.get('/',(req, res)=>{
    res.sendFile(path.join(__dirname, '../../ozinc/build/index.html'));
});

function getOilsNames(data){
    let model_variable_name = 'Oils';
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

    model_variable_name = 'Target_name';
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data);
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('"',';',model_variable_index, model_variable_target_index, data);
    
    oils_names_array.push(data.slice(begin_variable_array, end_variable_array).replace(/_/g,' ').replace(/"/g,''));

    return oils_names_array;
}
//read from json
function getVOCs(data, prop){
    
    const obj = JSON.parse(data);
    let voc_names = Object.keys(obj).map(model_name => obj[model_name][prop]);

    return voc_names;

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

function getArray(data, name){
    const model_variable_name = name ;
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

function getSingleVariable(data, model_variable_name){

    let model_variable_index;
    model_variable_index = data.indexOf(model_variable_name);
    

    return data.slice(data.indexOf('=',model_variable_index)+1, data.indexOf(';', model_variable_index)).trim();
}


router.get('/concentrations',(req,res)=>{

    fs.readFile(path.join(__dirname,'../oils-data.dzn'),'utf-8',(error, data)=>{

        let data_file_content = data ;
        let result = {};

        result['costs'] = getCosts(data_file_content);
        result['oils'] = getOilsNames(data_file_content);
        result['concentrations'] = getConcentrations(data_file_content);
        result['thresholds'] = getArray(data_file_content, 'thresholds');
        result['sensitivity'] = getArray(data_file_content, 'sensitivity');
        result['distance_factor'] = getSingleVariable(data_file_content, 'distance_factor');
        result['cost_factor'] = getSingleVariable(data_file_content, 'cost_factor');
        result['max_cost'] = getSingleVariable(data_file_content,'MAX_COST');
        result['max_distance'] = getSingleVariable(data_file_content, 'MAX_DIST');
        fs.readFile(path.join(__dirname,'../name_map.json'), (err,data)=>{
            if (err) throw err ;
            result['voc'] = getVOCs(data, "showed_name");
            result['cas'] = getVOCs(data, "CAS");
            res.json(result);
        });
        //console.log(result);

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

    let model_variable_name = 'costs';
    let model_variable_index, begin_variable_array, end_variable_array, model_variable_target_index,
        cost_target;
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data_file_content);
    
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data_file_content);

    cost_target = cost_array.pop();
    data_file_content = data_file_content.replace(data_file_content.slice(begin_variable_array,end_variable_array+1)
        , `[${cost_array.join()}]`);
    

    const equal_index = data_file_content.indexOf('=',model_variable_target_index);
    
    const comma_index = data_file_content.indexOf(';',equal_index);

    let sliced_string = data_file_content.slice(equal_index+1,comma_index);
    sliced_string = sliced_string.replace(sliced_string, cost_target);

    data_file_content = data_file_content.slice(0,equal_index+1) + sliced_string + data_file_content.slice(comma_index);
    
    return data_file_content;
}

function changeArray(data_file_content, arr, name){
    const model_variable_name = name;
    let model_variable_index, begin_variable_array, end_variable_array, model_variable_target_index;
    [model_variable_index, model_variable_target_index] = utils
        .findVariableModelIndexes(model_variable_name, data_file_content);
    
    [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils
        .findArrayIndexes('[',']',model_variable_index, model_variable_target_index, data_file_content);
    
    //ignore targets, will yield -1
    data_file_content = data_file_content.replace(data_file_content.slice(begin_variable_array,end_variable_array+1)
        , `[${arr.join()}]`);
    return data_file_content;
}

function changeFactors(data_file_content, model_variable_name, factor){

    let model_variable_index;
    model_variable_index = data_file_content.indexOf(model_variable_name);
    //console.log(data_file_content.slice(data_file_content.indexOf('=',model_variable_index)+1, data_file_content.indexOf(';', model_variable_index)).trim());
    const equal_index = data_file_content.indexOf('=',model_variable_index);
    
    const comma_index = data_file_content.indexOf(';',equal_index);
    //perform replace on sliced string because 
    let sliced_string = data_file_content.slice(equal_index+1, comma_index);
    sliced_string = sliced_string.replace(sliced_string, factor);
    data_file_content = data_file_content.slice(0,equal_index+1) + sliced_string + data_file_content.slice(comma_index);
    
    return data_file_content ;
}

function changeJSONobjectContent(data, vocNames, cas){
    let obj = JSON.parse(data);

    let i = 0;
    for (let [model_name, val] of Object.entries(obj)){
        val["showed_name"] = vocNames[i];
        val["CAS"] = cas[i];
        i++;
    }

    return JSON.stringify(obj);
}

router.put('/changeData',(req,res,next)=>{
    
    fs.readFile(path.join(__dirname,'../oils-data.dzn'),'utf-8',(error, data)=>{
        
        let concentration_target_array = [], thresholds = [], sensitivity = [] ;
        let data_file_content = data;
        
        let cost_array = req.body.newCnc.shift();
        cost_array.splice(-1,1); //eliminate last two useless elements
        cost_array.splice(-1,1);
        //removes last elements to form, in order, sensitivity, thresholds and target
        req.body.newCnc.forEach((val, index)=>{
            sensitivity.push(parseFloat(val.splice(-1,1).join()));
            thresholds.push(parseFloat(val.splice(-1,1).join()));
            concentration_target_array.push(parseFloat(val.splice(-1,1).join()));
        });
        let concentration_matrix_string = req.body.newCnc.join();
        let concentration_target_string = concentration_target_array.join();

        //voc e cas, primi elementi inutili
        req.body.vocNames.splice(0,1);
        req.body.cas.splice(0,1);
        
        data_file_content = changeConcentrations(data_file_content, concentration_matrix_string, concentration_target_string);
        data_file_content = changeCosts(data_file_content, cost_array);
        data_file_content = changeArray(data_file_content, thresholds, 'thresholds');
        data_file_content = changeArray(data_file_content, sensitivity, 'sensitivity');
        data_file_content = changeFactors(data_file_content,'distance_factor', req.body.newFactors.distance);
        data_file_content = changeFactors(data_file_content,'cost_factor', req.body.newFactors.cost);
        data_file_content = changeFactors(data_file_content,'MAX_COST', req.body.maxCost);
        data_file_content = changeFactors(data_file_content, 'MAX_DIST', req.body.maxDist);

        fs.readFile(path.join(__dirname, '../name_map.json'), (err, data)=>{
            if (err) throw err;
            
            //stringified and modified json file
            let obj = changeJSONobjectContent(data, req.body.vocNames, req.body.cas);
            fs.writeFile(path.join(__dirname, '../name_map.json'), obj, (err)=>{
                if (err) throw err;

                fs.writeFile(path.join(__dirname,'../oils-data.dzn'),data_file_content, (err)=>{
                    if (err){
                        throw err ;
                    }
                    res.sendStatus(200);
                });
            })
        } );
        //console.log(data_file_content);
        //now costs
        

    });
});

module.exports = router ;
