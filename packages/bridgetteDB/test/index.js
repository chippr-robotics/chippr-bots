//* unit tests *//

const assert = require('assert');
const { expect } = require('chai');

//* unit under test *//
var BDB = require('../bridgetteDB');

/* Description:
 *  tests the formatting of the env vars
 */

var nullConfig = {},
    goodConfig = {};



module.exports =

describe('Global Env Tests', () => {

    describe('bad config tests', () => {
        it('if nothing is sent default values should be used', (done) => {
            var bdb = new BDB(nullConfig);
            console.log(bdb);
            expect(process.env.WEB3_URL).not.to.exist;
            done();
          });
    });
  });
