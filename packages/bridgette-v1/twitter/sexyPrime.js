const { log, canRes } = require('@chippr-bots/common');

function postResponse(T, block, fate) {
    log.debug(block);
    let blockSet = block + " and " + block - 6;
    var response = [
        ` Cover your eyes! #ethereumclassic just passed a sexy prime pair on block numbers ` + blockSet,
        ` Ooh la la #ethereumclassic, blocks ${blockSet} were a sexy prime..`,
        ` Sexy prime time at between blocks ${blockSet} meow, #ethereumclassic `
    ];
    log.debug('[twitter/sexyPrime.js] possible responses: ' + response);
    if(Math.floor(Math.random() * 100) < fate){
      T.post('statuses/update', { 
          status: response[Math.floor(Math.random() * response.length)] },
          function(err, data, response) { 
              log.debug('[dflow/controllers/sexyPrime.js] returned data: ' + data);
      });
    }
}


module.exports = (T, block, fate) => {
    log.debug("[twitter/sexyPrime] running: " + block);
    postResponse(T, block, fate);
    return true;
}
