var router = require('express').Router();
const { exec } = require('child_process');
const fs = require('fs');
const fsPromises = fs.promises ;
const path = require('path');
//local modules
const RedisHandler = require('../RedisHandler');
const MiniZnResults = require('../ResultParser');
const ChangeTarget = require('../ChangeTarget');
const utils = require('../utils');

router.get('/' ,(req, res)=>{
    res.sendFile(path.join(__dirname, '../../ozinc/build/index.html'))
});


function launch_minizinc(response){
    fsPromises.chmod(path.join(process.env.HOME,'tmp/oils.mzn'),0o666)
        .then(()=>{
            console.log("Access to all");
            exec(`${path.join(process.env.HOME,'MiniZincIDE-2.3.2-bundle-linux/bin/minizinc')} --solver cbc ${path.join(process.env.HOME,'tmp/oils.mzn')} ${path.join(process.env.HOME,'tmp/oils-data.dzn')}`, (err, stdout, stderr)=>{
            //console.log(stdout);
            if (!stderr){
                let minizinc_results = new MiniZnResults();
                minizinc_results.parse_results(stdout);
                response.send(minizinc_results.get_result_object);
            }
            else {
                console.log(stderr);
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
        
        fs.writeFile(path.join(process.env.HOME,`tmp/${filename}`),recombined_string, (err)=>{
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


router.put('/changeTarget', (req, res, next)=>{
    console.log(req.body);
    new ChangeTarget(req.body.previousTarget, req.body.nextTarget, next, res);
});

router.put('/changeTarget', (req, res)=>{
    RedisHandler.getRedisInstance().del(RedisHandler.getDataKey());
    let changeTarget = res.locals.changeTarget ;
    
    const lines = changeTarget.datafile_getter.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++){
        RedisHandler.getRedisInstance().rpush(RedisHandler.getDataKey(), lines[i]);
    }

    fs.writeFile(path.join(process.env.HOME,'tmp/oils-data.dzn'),changeTarget.datafile_getter, (err)=>{
        if (err){
            throw err ;
        }
        res.sendStatus(200);
        //launch_minizinc(res);
    });
});

module.exports = router ;