const { log, canRes } = require('@chippr-bots/common');

function postResponse(T, block) {
    log.debug(block);
    var response = [
        ` TWIN PRIME ALERT! $ETC just passed a twin prime on block number ` + block,
        ` ${block} was a twin prime. Those are unique.`,
        ` If you look at ${block}, it was a twin prime.`
    ];
    log.debug('[twitter/twinPrime.js] possible responses: ' + response);
    T.post('statuses/update', { 
        status: response[Math.floor(Math.random() * response.length)] },
        function(err, data, response) { 
            log.debug('[dflow/controllers/quadPrime.js] returned data: ' + data);
    });
}


module.exports = (T, block) => {
    log.debug("[twitter/twinPrime] running: " + block);
    postResponse(T, block);
    return true;
}
