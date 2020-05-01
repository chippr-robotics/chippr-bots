var { log } = require('@chippr-bots/common');

/* this module should find all tweets based on a key word and clean them up for processing 
*/

module.exports = (tweetstack, category, model) => {
    //console.log(tweetstack.length);
    model.exampleCount += tweetstack.length;
    for(tweet in tweetstack){
        log.info(`[bridgette-twitter/lib/train] training on tweet number: ${tweet} out of  ${tweetstack.length}`);
        //console.log(tweetstack[tweet]);
        for( i in tweetstack[tweet]){ 
            let word = tweetstack[tweet][i];
            //console.log(word);
            //console.log(model.wordlist[word]);
            if(model.wordlist[word] == undefined){
                model.wordlist[word] = 1;
                model.wordCount += 1;
                model.vocabCount += 1;
            } else {
                model.wordlist[word] += 1;
                model.wordCount += 1;
            }
        }
    }
    //remove all low occurence words: occurs less than 3 times or has a length of 1 to elimanante  
    for (key in model.wordlist){
        let modelKeys = Object.keys(model.wordlist);
        console.log(modelKeys[key]);
        if( model.wordlist[key] != undefined && (model.wordlist[key] <= 3 || modelKeys[key].length == 1)) {
            delete model.wordlist[key];
            model.wordCount -= 1;
            model.vocabCount -= 1
        }
    }
    //console.log(model);
    return model;
}