const { log } = require('../lib');

log.info('[dflow/controllers/getBlock.js] getBlock loaded');

//provide a random response

async function getResponse(num){
    //get the block number
    var rawBlk = await web3.eth.getBlockNumber(num);
    var responses = [
        "```"
        + "Block number :" + rawBlk.number + "\n"
        + "hash : " + rawBlk.hash + "\n"
        + "parentHash : " + rawBlk.parentHash + "\n"
        + "nonce : " + rawBlk.nonce + "\n"
        + "sha3Uncles : " + rawBlk.sha3Uncles + "\n"
        + "logsBloom : " + rawBlk.logsBloom + "\n"
        + "transactionsRoot : " + rawBlk.transactionsRoot + "\n"
        + "stateRoot : " + rawBlk.stateRoot + "\n"
        + "miner : " + rawBlk.miner + "\n"
        + "difficulty : " + rawBlk.difficulty + "\n"
        + "totalDifficulty : " + rawBlk.totalDifficulty + "\n"
        + "size : " + rawBlk.size + "\n"
        + "extraData : " + web3.utils.toAscii(rawBlk.extraData) + "\n"
        + "gasLimit : " + rawBlk.gasLimit + "\n"
        + "gasUsed : " + rawBlk.gasUsed + "\n"
        + "timestamp : " + rawBlk.timestamp + "\n"
        + "Number of Transactions : " + rawBlk.transactions.length+ "\n"
        + "Number of Uncles : " + rawBlk.uncles.length
        + "```"
    ]
    log.debug('[dflow/controllers/getBlock.js] possible responses: ' + responses); 
    return responses[Math.floor(Math.random() * responses.length)]; 
}

module.exports = async (num) =>{
    let response = getResponse(num); 
    log.debug('[dflow/controllers/getBlock.js] getResponse(): ' + response);
    return{
        message : response
    }
} 