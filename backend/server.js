const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');
//development
const dotenv = require('dotenv');
dotenv.config();
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
app.use('/',require(`${__dirname}/routes/index`));
app.use('/data',require(`${__dirname}/routes/data`));


const port = process.env.PORT || 8000;  
// launch our backend into a port
app.listen(port, function(){
    console.log(process.env);
    console.log(`Listening on port ${process.env.PORT}`);
    let data = fs.readFileSync(`${__dirname}/oils-data.dzn`,'utf-8');
    let model = fs.readFileSync(`${__dirname}/oils.mzn`,'utf-8');

});
