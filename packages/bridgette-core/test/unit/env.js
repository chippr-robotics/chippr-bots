const assert = require('assert');
const { expect } = require('chai');

//* unit under test *//

const app = require('../../index.js');

/* Description:
 *  tests the formatting of the env vars
 */

module.exports =

describe('Global Env Tests', () => {

    describe('Web3 tests', () => {
        //web3 shoud not be undefined
        it('web3_url should not be null', (done) => {
            expect(process.env.WEB3_URL).to.exist;
            done();
          });
    });
    describe('Winston tests', () => {
        //loglevel should not be null
        it('log level should not be null', (done) => {
            expect(process.env.LOG_LEVEL).to.exist;
            done();
          });
        //log level shoud be info or debug  
        it('log level is debug or info', (done) => {
            expect(process.env.LOG_LEVEL).to.be.oneOf( ['debug', 'info'] );
            done();
        });
    });
  });