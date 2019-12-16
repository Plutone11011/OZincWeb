

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

module.exports = {
    findArrayIndexes: findArrayIndexes,
    findVariableModelIndexes: findVariableModelIndexes
}