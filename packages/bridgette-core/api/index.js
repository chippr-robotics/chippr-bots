const express = require('express');
const apiRouter = express.Router();

const getBalance = require('./getBalance');

// API routes for get balances
apiRouter.use('/getbalance', getBalance);