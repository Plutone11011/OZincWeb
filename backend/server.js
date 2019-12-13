const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');
//development
const dotenv = require('dotenv').config();
//custom modules
const MiniZnResults = require('./ResultParser');
const ChangeTarget = require('./ChangeTarget');
var RedisHandler = require('./RedisHandler');

const app = express();


app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.use(express.static(path.join(__dirname, '../ozinc/build')));

app.use(basicAuth({
    challenge: true,
    users: {
        admin: process.env.PASSWORD
    }        
}));


app.get('/' ,(req, res)=>{
    res.sendFile(path.join(__dirname, '../ozinc/build/index.html'))
});

function launch_minizinc(response){
    exec(`${__dirname}/../MiniZincIDE-2.3.2-bundle-linux/bin/minizinc --solver cbc ${__dirname}/../tmp/oils.mzn ${__dirname}/../tmp/oils-data.dzn`, (err, stdout, stderr)=>{
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
}

function createTempFileWithRedisData(key, filename, next){
    RedisHandler.getRedisInstance().lrange(key,0,-1,(error, items)=>{
        let recombined_string = '';
        for (let item of items){
            recombined_string += `${item}\n`;
        }
        fs.writeFile(`${__dirname}/../tmp/${filename}`,recombined_string, (err)=>{
            if (err){
                throw err ;
            }
            next();
        });
    });
}

//first rewrites temp model, then temp data, then launches minizinc
app.get('/getMinizincResults',(req, res, next)=>{
    createTempFileWithRedisData(RedisHandler.getModelKey(),'oils.mzn',next);
});

app.get('/getMinizincResults',(req, res,next)=>{
    createTempFileWithRedisData(RedisHandler.getDataKey(), 'oils-data.dzn', next);
});

app.get('/getMinizincResults',(req, res)=>{
    try {
        launch_minizinc(res);    
    } catch (error) {
        console.log(error);
    }
})


app.put('/changeTarget', (req, res, next)=>{
    new ChangeTarget(req.body.previousTarget, req.body.nextTarget, next, res);
});

app.put('/changeTarget', (req, res)=>{
    RedisHandler.getRedisInstance().del(RedisHandler.getDataKey());
    let changeTarget = res.locals.changeTarget ;
    
    const lines = changeTarget.datafile_getter.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++){
        RedisHandler.getRedisInstance().rpush(RedisHandler.getDataKey(), lines[i]);
    }

    fs.writeFile(`${__dirname}/../tmp/oils-data.dzn`,changeTarget.datafile_getter, (err)=>{
        if (err){
            throw err ;
        }
        launch_minizinc(res);
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
// launch our backend into a port
app.listen(port, function(){
    console.log(`Listening on port ${process.env.PORT}`);
    let data = fs.readFileSync(`${__dirname}/oils-data.dzn`,'utf-8');
    let model = fs.readFileSync(`${__dirname}/oils.mzn`,'utf-8');

    RedisHandler.populateRedis(RedisHandler.getModelKey(),model);
    RedisHandler.populateRedis(RedisHandler.getDataKey(),data);
});
