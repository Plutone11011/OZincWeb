const fs = require('fs');
var RedisHandler = require('./RedisHandler');
const utils = require('./utils');

class changeTarget{

    constructor(previous_target, next_target, next, res){
        //dzn file content
        RedisHandler.getRedisInstance().lrange(RedisHandler.getDataKey(),0,-1,(error, items)=>{
            this.data_file_content = '';
            for (let item of items){
                this.data_file_content += `${item}\n`;
            }
            //need to put _ between spaces as is in the data file
            this.previous_target_underscored = previous_target.replace(/\s/g,'_') ;
            this.next_target_underscored = next_target.replace(/\s/g,'_') ;
            //this index corresponds to the column index to swap in the matrix 
            [this.index_to_swap, this.numberOfNonTarget] = this.next_target_index() ;
            this.updateFiledata();
            res.locals.changeTarget = this ;
            next();//calls so that next operations are done after this
        });

    }
    get datafile_getter(){
        return this.data_file_content;
    }

    set datafile_setter(data){
        this.data_file_content = data ;
    }

    next_target_index(){
        let index_oil_names = this.data_file_content.search("%OilsNamesPlaceholder");
        //start from this position so we have a way to count indexes
        let lines = this.data_file_content.slice(index_oil_names).split(/\r?\n/);
        lines.shift();
        let target_index ;

        for (var i = 0; i < lines.length; i++){
            if (lines[i].includes(this.next_target_underscored)){
                target_index = i ; //first line is the placeholder
            }
            if (lines[i] == ''){
                break ;
            }
        }
        return [target_index, i];
    }
    //swap new and old target names
    updateName(){
        
        
        this.data_file_content = this.data_file_content.replace(this.previous_target_underscored, 'TAG');
        this.data_file_content = this.data_file_content.replace(this.next_target_underscored, this.previous_target_underscored);
        this.data_file_content = this.data_file_content.replace('TAG', this.next_target_underscored);
        //console.log(this.data_file_content);
    }


    //swap target array with the corresponding column
    updateMatrix(model_variable_name){
        let model_variable_index, model_variable_target_index;
        [model_variable_index, model_variable_target_index] = utils.findVariableModelIndexes(model_variable_name, this.data_file_content);

        //console.log(this.data_file_content.slice(model_variable_target_index));

        //find the indexes to slice the matrix and the target array
        let begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array ;
        [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils.findArrayIndexes('[',']',model_variable_index, model_variable_target_index, this.data_file_content);
        
        let model_variable_matrix = JSON.parse(this.data_file_content.slice(begin_variable_array, end_variable_array+1).replace(/\|/g,''));
        let model_target_array = JSON.parse(this.data_file_content.slice(begin_variable_target_array, end_variable_target_array+1));

        //swap target array with the index_to_swap-th column
        var target_index = 0 ;
        for (let i = 0; i < model_variable_matrix.length; i++){
            if ((i % this.numberOfNonTarget) == this.index_to_swap){
                [model_variable_matrix[i], model_target_array[target_index]] = [model_target_array[target_index], model_variable_matrix[i]] ;
                target_index++ ;
            }
        }

        

        model_variable_matrix = '[|' + model_variable_matrix.map(n => n.toString()).join() + '|]';//separator defaults to comma
        model_target_array = '[' + model_target_array.map(n => n.toString()).join() + ']';

        //iterate to refill with | separators for minizinc
        let comma_counter = 0 ;
        var model_variable_matrix_minizinc = '';
        for (let i = 0; i < model_variable_matrix.length; i++){
            model_variable_matrix_minizinc += model_variable_matrix[i];
            if (model_variable_matrix[i] == ','){
                comma_counter++ ;
            }
            if (comma_counter == 10){
                comma_counter = 0 ;
                model_variable_matrix_minizinc += '|';

            }
        }
        
        

        this.data_file_content = this.data_file_content.replace(this.data_file_content
            .slice(model_variable_index, end_variable_array+1),model_variable_name + ' = ' + model_variable_matrix_minizinc);
        //recomputes indexes since the string has been modified and so are the variables position in it
        [model_variable_index, model_variable_target_index] = utils.findVariableModelIndexes(model_variable_name,this.data_file_content);
        [begin_variable_array, end_variable_array, begin_variable_target_array, end_variable_target_array] = utils.findArrayIndexes('[',']',model_variable_index, model_variable_target_index,this.data_file_content);
        this.data_file_content = this.data_file_content.replace(this.data_file_content
            .slice(model_variable_target_index, end_variable_target_array+1),`${model_variable_name}_target = ${model_target_array}`);
    }

    //here method that calls both updates and writes to file
    updateFiledata(){
        this.updateName();
        this.updateMatrix("concentrations");
        this.updateMatrix("costs");
    }
} 

module.exports = changeTarget ;