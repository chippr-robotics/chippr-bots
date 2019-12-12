const { log } = require('../lib');

log.info('[dflow/controllers/version.js] version loaded');

//provide a random response

function getResponse(){
    var pkg = require('../package.json');
    var responses = [
        `I am running on version ${pkg.version}`
    ]
    log.debug('[dflow/controllers/version.js] possible responses: ' + responses); 
    return responses[Math.floor(Math.random() * responses.length)]; 
}

module.exports = () =>{
    let response = getResponse(); 
    log.debug('[dflow/controllers/version.js] getResponse(): ' + response);
    return {
        message: response
    };
} 