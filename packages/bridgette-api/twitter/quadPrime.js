const { log, canRes } = require('@chippr-bots/common');

function postResponse(T, block) {
    log.debug(block);
    var response = [
        " $ETC just passed another quad prime! Block number " + block,
        ` ${block} was a quad prime. Those are pretty rare.$ETC is on the move!`,
        ` If you look at ${block}, it was part of a quad prime.`
    ];
    let winScore = 0;
    log.debug(canRes.excited);
    for(let i = 0; i < canRes.excited.length; i++){
        let score = Math.floor(Math.random() * 100 * canRes.excited[i].score);
        if(score > winScore){
            winScore = score; //set the winscore to the current score
            var intro = canRes.excited[i].word;
        }
    }
    
    log.debug('[dflow/controllers/quadPrime.js] possible responses: ' + response);
    T.post('statuses/update', { 
        status: intro + response[Math.floor(Math.random() * response.length)] },         
        function(err, data, response) { 
            log.debug('[dflow/controllers/quadPrime.js] returned data: ' + data);
    });
}


module.exports = (T, block) => {
   console.log("ran quadprime");
    postResponse(T, block);
    return true;
}
