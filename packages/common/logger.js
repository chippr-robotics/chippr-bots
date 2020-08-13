const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');
const path = require('path');

var client =  new elasticsearch.Client({process.env.ESEARCH_HOST:9200});

// Configure custom app-wide logger
module.exports = winston.createLogger({
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
