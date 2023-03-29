require('dotenv').config();

const { neo4j,zcash } = require( "./lib" );

zcash.getblockchaininfo().then(res => {
    console.log(res);
});
