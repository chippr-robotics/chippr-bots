
require('dotenv').config();
const fs = require('fs');
var express = require('express');
var uuid = require("uuid/v4");

var initialize = require('/tmp/data.json');
const { log, web3, forks, blkState, T, prime } = require('@chippr-bots/common');


//* Get functions from library *//

const { 
  getBlockNumber, 
  getBalance, 
  getTransaction, 
  getTXR, 
  sendSignedTransaction, getGasPrice, getBlock, version, error, forkName, forkit } = require( "./funcs" );

// dapps

const { statebot, multi, etcmail, atlantis } = require( "./dapps" );

// help files

const { bridgette, donatehelp, etcmailhelp, tipperError } = require( "./help" );


// twitter files

const { quadPrime, twinPrime } = require("./twitter");


const app = express();

app.get('/help', (req, res) => { bridgette(req, res);});
app.get('/help/donate', (req, res) => { return res.send(donatehelp);});
app.get('/help/etcmail', (req, res) => { return res.send(etcmailhelp);});
app.get('/help/tipper', (req, res) => { return res.send(tipperError);});


app.post('/', (req, res) => {
  return res.send('Received a POST HTTP method');
});
app.put('/', (req, res) => {
  return res.send('Received a PUT HTTP method');
});
app.delete('/', (req, res) => {
  return res.send('Received a DELETE HTTP method');
});

app.listen(process.env.PORT || 3000 , () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
