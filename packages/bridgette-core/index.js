const env = process.env.NODE_ENV;
if ( env !== 'production') {
	require("dotenv").config();
}

const express = require('express');


const path = 'path';
const bodyParser = require('body-parser');
const https = require('https');

var fs = require('fs');

const server = express();

//const assistant = dialogflow();
const { log } = require('@chippr-bots/common');

//active controllers
const { 
	getBlockNumber, 
	getPrice,
	blockstreamSat,
	version } = require( "./controllers" );

// plugins

const apis = require('./api');




//express server
server.set('port', process.env.PORT || 3400);
server.use(bodyParser.json({limit: '10mb', extended: true}))
server.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

/*
server.post('/webhook', function (req, res) {
	WebhookProcessing(req, res);
});
*/

server.get('/', (req, res) => {
        console.log(req);
        res.send('Hello World!');
	log.debug('hello world log', {'file': 'bridgette-core/index.js'});
});

console.log('starting server');

server.listen(server.get('port'), function () {
	console.log('Express server started on port', server.get('port'));
});

/*https.createServer({
   key: fs.readFileSync(process.env.VAULT_KEY),
   cert: fs.readFileSync(process.env.VAULT_CERT)
}, server).listen(server.get('port'), function () {
	console.log('Express server started on port', server.get('port'));
});
*/