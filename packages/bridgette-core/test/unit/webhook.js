const assert = require('assert');
const { expect } = require('chai');
var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);


//* unit under test *//

const app = require('../../index.js');

/* Description:
 *  tests the webhooks for basic response
 */

//* data *//

var getBlockNumber = {"queryResult": {"intent": {"name": "","displayName": "etc_getBlockNumber"},"intentDetectionConfidence": 0.97,"languageCode": "en"}};
var getBalance = {"queryResult": {"intent": {"name": "","displayName": "etc_getBalance"},"intentDetectionConfidence": 0.97,"languageCode": "en"}};
var getTransaction= {"queryResult": {"intent": {"name": "","displayName": "etc_getTransaction"},"intentDetectionConfidence": 0.97,"languageCode": "en"}};
var sendSignedTransaction = {"queryResult": {"intent": {"name": "","displayName": "etc_sendSignedTransaction"},"intentDetectionConfidence": 0.97,"languageCode": "en"}};
var getGasPrice = {"queryResult": {"intent": {"name": "","displayName": "etc_getGasPrice"},"intentDetectionConfidence": 0.97,"languageCode": "en"}};
var getBlock = {"queryResult": {"intent": {"name": "","displayName": "etc_getBlock"},"intentDetectionConfidence": 0.97,"languageCode": "en"}};
var version = {"queryResult": {"intent": {"name": "","displayName": "etc_version"},"intentDetectionConfidence": 0.97,"languageCode": "en"}};

module.exports =

describe('Webhook Basic Tests', () => {
    
    describe('Test getblocknumber', () => {
        it('returns status 200 with a payload', (done) => {
        chai.request(app)
        .post('/webhook')
        .send(getBlockNumber)
        .end(function(err, res) {
            if (err) done(err);
            expect(res).to.have.status(200);
        });
        done();
        });
    });
    
    describe('Test getbalance', () => {
        it('returns status 200 with a payload', (done) => {
        chai.request(app)
        .post('/webhook')
        .send(getBalance)
        .end(function(err, res) {
            if (err) done(err);
            expect(res).to.have.status(200);
        });
        done();
        });
    });
    
    describe('Test getTransaction', () => {
        it('returns status 200 with a payload', (done) => {
        chai.request(app)
        .post('/webhook')
        .send(getTransaction)
        .end(function(err, res) {
            if (err) done(err);
            expect(res).to.have.status(200);
        });
        done();
        });
    });
    
    describe('Test sendSigned transaction', () => {
        it('returns status 200 with a payload', (done) => {
        chai.request(app)
        .post('/webhook')
        .send(sendSignedTransaction)
        .end(function(err, res) {
            if (err) done(err);
            expect(res).to.have.status(200);
        });
        done();
        });
    });
    
    describe('Test getgasprice', () => {
        it('returns status 200 with a payload', (done) => {
        chai.request(app)
        .post('/webhook')
        .send(getGasPrice)
        .end(function(err, res) {
            if (err) done(err);
            expect(res).to.have.status(200);
        });
        done();
        });
    });
    
    describe('Test getblock', () => {
        it('returns status 200 with a payload', (done) => {
        chai.request(app)
        .post('/webhook')
        .send(getBlock)
        .end(function(err, res) {
            if (err) done(err);
            expect(res).to.have.status(200);
        });
        done();
        });
    });
    
    describe('Test version', () => {
        it('returns status 200 with a payload', (done) => {
        chai.request(app)
        .post('/webhook')
        .send(version)
        .end(function(err, res) {
            if (err) done(err);
            expect(res).to.have.status(200);
        });
        done();
        });
    });
});