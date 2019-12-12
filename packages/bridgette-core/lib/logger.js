const winston = require('winston');
var Elasticsearch = require('winston-elasticsearch');
const path = require('path');

var esTransportOpts = {
	level: 'debug',
        label: module.filename.split('/').slice(-2).join('/'),
        port: 9200,
        host: '172.16.0.144'
};

// Configure custom app-wide logger
module.exports = winston.createLogger({
  transports: [
    new Elasticsearch(esTransportOpts),
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
    })
  ]
});
