const { log, canRes } = require('@chippr-bots/common');

function postResponse(T, block) {
    log.debug(block);
    let quadSet = block + ", " + (block - 2) + ", " + (block - 4) + ", " + (block - 6)
    var response = [
        ` #ethereumclassic just passed another quad prime! Block numbers ${quadSet}`,
        ` ${quadSet} was a quad prime set. Those are pretty rare. #ethereumclassic is on the move!`,
        ` If you look at ${quadSet}, it was part of a quad prime. #ethereumclassic`
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
