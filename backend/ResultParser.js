class MiniZnResults{

    constructor(){

        this.result_object = {
            'Oils Composition:': {},
            'VOC Concentrations:': [],
            'Target name:': 'Commercial extra virgin olive oils Central Italy',
            'Target difference:': {},
            'Distance from target:': -1,
            'Total price:':0
        };
    }

    get get_result_object(){
        return this.result_object;
    }

    set set_result_object(obj){
        this.result_object = obj ; 
    }

    split_property(line, current_key){
        let [name, rate] = line.split(':');
        name = name.replace(/_/g,' ').replace(/["\\]/g,'');
        rate = rate.replace(/_/g,' ').replace(/["\\]/g,'');
        this.result_object[current_key][name] = rate ;
    }

    parse_results(mnzn_result){

        //console.log(mnzn_result);
        const lines = mnzn_result.split(/\r?\n/);
        const result_object_keys = Object.keys(this.result_object);
        let current_key = null ;
        for (let line of lines){
            if (result_object_keys.includes(line)){
                current_key = line ;
            }
            else {
                switch(current_key){
                    case 'Oils Composition:':
                        try{
                            this.split_property(line, current_key);
                        }
                        catch(e){
                            //console.log(e);
                            current_key = null ;
                        }
                        
                        break ;
                    case 'VOC Concentrations:':
                        this.result_object[current_key] = line ;
                        current_key = null ;
                        break ;
                    case 'Target name:':
                        this.result_object[current_key] = line.replace(/_/g,' ');
                        current_key = null ;
                        break ;
                    case 'Target difference:':
                        try{
                            this.split_property(line, current_key);
                        }
                        catch(e){
                            //console.log(e);
                            current_key = null ;
                        }
                        break ;
                    case 'Distance from target:':
                        this.result_object[current_key] = line ;
                        current_key = null ;
                        break ;
                    case 'Total price:':
                        this.result_object[current_key] = line ;
                        current_key = null ;
                        break ;
                    default:
                        //e.g. empty lines or other characters
                        break ;
                }
            }
        }
    }
    
}

module.exports = MiniZnResults ;