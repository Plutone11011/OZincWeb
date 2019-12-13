const redis = require('redis');

var redis_handler = (function(){

    const redisInstance = redis.createClient(process.env.REDIS_URL);
    //redis keys
    const model_key = 'model',
        data_key = 'data';


    function populateRedis(key, data){
        //assume data is from minizinc static files
        //multiline string for redis is a no
        //memorize each line in a list and then recombine them later
        redisInstance.keys('*',(error, items)=>{
            if (error){
                throw error;
            }
            if (!items.length){
                console.log("No keys here");
                const lines = data.split(/\r?\n/);
                for (let i = 0; i < lines.length; i++){
                    redisInstance.rpush(key, lines[i]);
                }
            }
        });
        
    }

    function getRedisInstance(){
        return redisInstance ;
    }

    function getModelKey(){
        return model_key;
    }

    function getDataKey(){
        return data_key;
    }
    return {
        populateRedis: populateRedis,
        getRedisInstance: getRedisInstance,
        getModelKey: getModelKey,
        getDataKey: getDataKey
    }
})();

module.exports = redis_handler ;