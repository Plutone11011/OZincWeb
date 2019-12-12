const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { exec } = require('child_process');
const MiniZnResults = require('./ResultParser');
const ChangeTarget = require('./ChangeTarget');
const fs = require('fs');
//const dotenv = require('dotenv').config();
const path = require('path');
const basicAuth = require('express-basic-auth');

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
    exec(`${__dirname}/../MiniZincIDE-2.3.2-bundle-linux/bin/minizinc --solver cbc ${__dirname}/oils.mzn ${__dirname}/oils-data.dzn`, (err, stdout, stderr)=>{
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

app.get('/getMinizincResults',(req, res)=>{
    //launch minizinc and expect results
    try {
        launch_minizinc(res);    
    } catch (error) {
        console.log(error);
    }
    
    
});

app.put('/changeTarget', (req, res)=>{
    let changeTarget = new ChangeTarget(req.body.previousTarget, req.body.nextTarget);
    changeTarget.updateFiledata();
    fs.writeFile('oils-data.dzn',changeTarget.datafile_getter, (err)=>{
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
app.listen(port, () => console.log('LISTENING ON PORT 8000'));
