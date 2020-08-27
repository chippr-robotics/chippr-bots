const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const path = require('path');
const { Client } = require('@elastic/elasticsearch')

var client =  new Client({ node: process.env.ESEARCH_HOST || 'http://172.16.0.234:9200'});

// Configure custom app-wide logger
module.exports = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new (winston.transports.Console)({
	level:process.env.LOG_LEVEL
	}),
    new (winston.transports.File)({
      name: 'info-file',
      filename: path.resolve(__dirname, '../info.log'),
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: path.resolve(__dirname, '../error.log'),
      level: 'error'
    }),
    new Elasticsearch({
      name: 'elasticsearch',
      client: client,
      level: 'debug'
    })
  ]
});
