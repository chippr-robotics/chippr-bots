// common functions
const { log } = require('@chippr-bots/common');

const express = require('express');
const apiRouter = express.Router();

const getBalance = require('./getBalance');

// API routes for get balances
apiRouter.use('/getBalance', getBalance);


log.info('api/index.js] controllers loaded');