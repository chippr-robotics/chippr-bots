const { log, btc, etc, zec, kotti } = require('../lib');

log.info('[dflow/controllers/getBlockNumber.js] getBlockNumber loaded');

//provide a random response

function getResponse(res){
    //get the words 
        var responses = [
            `The current block height is ${ res }`,
            `We are at block ${ res }`,
            `The latest one I see is ${ res }`,
            `The last one I saw was ${ res }`
        ];

        log.debug('[dflow/controllers/getBlockNumber.js] possible responses: ' + responses); 
        log.debug('[dflow/controllers/getBlockNumber.js] getBlockNumber(): ' + res);
        return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = async (blockchain) => {
    log.debug('calls getblocknumber: '+ blockchain);
    let bn;
    let fullbn;
    switch (blockchain.toLowerCase()) {
        case "zec":
            log.debug('case zcash');
            fullbn = await zec.getinfo();
            bn = fullbn.blocks;
            log.debug(bn);
            break;
        case "btc":
            log.debug('case bitcoin');
            fullbn = await btc.getinfo(); 
            bn = fullbn.blocks;
            break;
        case "etc":
            log.debug('case etc');
            console.log(etc);
            fullbn = await etc.eth_blockNumber();
            bn = parseInt(fullbn,16);
            break;
        case "kotti":
            log.debug('case kotti');
            console.log(kotti);
            fullbn = await kotti.eth_blockNumber();
            bn = parseInt(fullbn,16);
            break;
        
        default:
            log.debug('case default(bitcoin)');
            bn = await btc.getinfo(); 
            break;
    };

    let res = getResponse(bn);
    log.debug('[dflow/controllers/getBlockNumber.js] getResponse(): ' + res);
    return{
            message : res    
        };
}; 
