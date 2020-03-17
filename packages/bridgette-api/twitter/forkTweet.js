const { log, canRes } = require('@chippr-bots/common');

function postResponse(T, blockNumber, forks) {
    log.debug(forks);
    var now = new Date().getTime();
    var timeRemains = (forkBlk - blocknumber) * blkTime;
    var countDownDate = ( timeRemains * 1000 ) + 604800 + new Date().getTime();
    var distance = countDownDate - now;
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor( distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor( ( distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000); if(distance > 0){
    var response = [
      "The " + forkName +" update will happen in " + (forkBlk - blocknumber) + " blocks or ~" + days + " days.",
      "The " + forkName + " fork will be in ~" + days + " days," + hours +" hours.",
      "The " + forkName + " update goes live on block " + forkBlk + "; in ~" + days + " days," + hours +" hours.",
     return response[Math.floor(Math.random() * response.length)]; }
   else {
        return true;
 }
}

response[Math.floor(Math.random() * response.length)]; } else {
        return ""+ forkName + " is here!!!!"; var response = [
}           " Reminder, the ${fn} " + block,
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
    postResponse(T, block);
    return true;
}
