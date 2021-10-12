const { log } = require('@chippr-bots/common');

log.info('[../controllers/getBalance.js] getBalance loaded');

//provide a random response

async function getResponse(account){
    //get the balance
    var bal = await  web3.eth.getBalance(account);
    var responses = [
        `The balance for the account starting with ${account.substring(0,10)} is ${bal * .000000000000000001}`,
        `${bal * .000000000000000001}`
    ]
    log.debug('[dflow/controllers/getBalance.js] possible responses: ' + responses); 
    return responses[Math.floor(Math.random() * responses.length)]; 
}

module.exports = async (body) =>{
    let response = getResponse(body.account); 
    log.debug('[dflow/controllers/getBalance.js] getResponse(): ' + response);
    return{
        message : response
    }
} 
