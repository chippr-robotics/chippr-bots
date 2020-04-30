var { log } = require('@chippr-bots/common');

/* this module should find all tweets based on a key word and clean them up for processing 
*/

module.exports = (tweetstack, category, model) => {
    console.log(tweetstack.length);
    model.exampleCount += tweetstack.length;
    for(tweet in tweetstack){
        log.info(`[bridgette-twitter/lib/train] tweet number: ${tweet}`);
        console.log(tweetstack[tweet]);
        for( i in tweetstack[tweet]){ 
            let word = tweetstack[tweet][i];
            console.log(word);
            console.log(model.wordlist[word]);
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
    console.log(model);
    return model;
}