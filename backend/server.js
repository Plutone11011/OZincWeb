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

//orribile workaround, su gocker non vedo le variabili d'ambiente in .env
//la repo github è privata almeno
const PORT = 8000;
const PASSWORD = 'Rancid_oil';
const USERNAME = 'admin';

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('common', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'}),
    immediate: true
}));

app.use(express.static(path.join(__dirname, '../ozinc/build')));

app.use(basicAuth({
    challenge: true,
    users: {
        [USERNAME]: PASSWORD
    }        
}));
app.use('/',require(`${__dirname}/routes/index`));
app.use('/data',require(`${__dirname}/routes/data`));

const port = PORT || 8000;  
// launch our backend into a port
app.listen(port, function(){
    console.log("Listening on port "+port);
});
