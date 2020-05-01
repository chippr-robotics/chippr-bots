var { log } = require('@chippr-bots/common');

/* 
* this module should add to the bots markov chain from a series of tweets 
*/

module.exports = (tweetstack, markovModel) => {
    for(tweet in tweetstack){
        markovModel.train(tweetstack[tweet].join(' '));
    }
    console.log(markovModel.words(39));
}