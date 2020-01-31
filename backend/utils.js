
//utility functions to find indexes in data file string
function findVariableModelIndexes(model_variable_name, data_file_content){
    let model_variable_index = data_file_content.search('\\b'+model_variable_name+'\\b');
    let model_variable_target_index = data_file_content.search(`\\b${model_variable_name}_target\\b`);

    return [model_variable_index, model_variable_target_index];
}

function findArrayIndexes(character_start, character_end, model_variable_index, model_variable_target_index, data_file_content){
    let begin_variable_array = data_file_content.indexOf(character_start,model_variable_index);
    let end_variable_array = data_file_content.indexOf(character_end,begin_variable_array);
    let begin_variable_target_array = data_file_content.indexOf(character_start, model_variable_target_index);
    let end_variable_target_array = data_file_content.indexOf(character_end,begin_variable_target_array);

    return [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array];
}
/*creates a single string out of the array in redis
function recombineRedisString(items){
    let data = '';
    for (let item of items){
        data += `${item}\n`;
    }
    return data ;
}*/
//utility function to format a matrix-like string for minizinc, with |
function fillWithSeparators(matrix, column_length){

    let comma_counter = 0 ;
    let model_variable_matrix_minizinc = '';
    for (let i = 0; i < matrix.length; i++){
        model_variable_matrix_minizinc += matrix[i];
        if (matrix[i] == ','){
            comma_counter++ ;
        }
        if (comma_counter == column_length){
            comma_counter = 0 ;
            model_variable_matrix_minizinc += '|';

        }
    }
    return model_variable_matrix_minizinc;
}

module.exports = {
    findArrayIndexes: findArrayIndexes,
    findVariableModelIndexes: findVariableModelIndexes,
    fillWithSeparators: fillWithSeparators
}