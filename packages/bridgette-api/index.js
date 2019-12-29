
require('dotenv').config();
const fs = require('fs');
var express = require('express');
var initialize = require('/tmp/data.json');
const { log, web3, forks, blkState, T, prime } = require('@chippr-bots/common');


//* Get functions from library *//

const { getBlockNumber, getBalance, getTransaction, getTXR, sendSignedTransaction, getGasPrice, getBlock, version, error, forkName, forkit } = require( "./funcs" );

// dapps

const { statebot, multi, etcmail, atlantis } = require( "./dapps" );

// help files

const { bridgette, donatehelp, etcmailhelp, tipperError } = require( "./help" );


// twitter files

const { quadPrime, twinPrime } = require("./twitter");


const app = express();

app.get('/', (req, res) => {
  return res.send('Received a GET HTTP method');
});
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
