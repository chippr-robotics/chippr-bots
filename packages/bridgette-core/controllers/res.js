const { log } = require('../lib');

log.info('[dflow/controllers/res.js] res loaded');

//provide a random response

function getResponse(){
    var responses = [
        "response 1",
        "response 2"
    ]
    log.debug('[dflow/controllers/res.js] possible responses: ' + responses); 
    return responses[Math.floor(Math.random() * responses.length)]; 
}

module.exports = () =>{
    let response = getResponse(); 
    log.debug('[dflow/controllers/res.js] getResponse(): ' + response);
    return{
        message : response
    }
} 