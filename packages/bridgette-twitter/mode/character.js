var { log } = require('@chippr-bots/common');

var { bayes, seeker, markov, filter } = require('../lib');
var fs = require('fs');



/* narative loop 
*   the  module should
*     - say something positive
*     - pull the naughty and nice list
*     - use seeker to pull some tweets
*     - 
*
*/


function getModel( category ){
    //if the file cant be opened then open the model template
    let filePath = `./models/${category}.json`;
    try {
        let rmodel = require(filePath);
        return rmodel;
    } catch (error) {
        let rmodel = defaultModel;
        return rmodel;
    }
}

// send tweet

function sendTweet(T, tweetBody){
    try {
        T.post('statuses/update', { 
            status: tweetBody },         
            function(err, data, response) { 
                log.debug(`[mode/character.js] returned data: ${data}`);
                log.error(`[mode/character.js] returned error:${err}`);
        });
    } catch (error) {
        log.error(`[mode/character.js] returned error: ${error}`);
    }
   
}

function buildTweetlist(wordlist){
    for(word in wordlist){
        let tweetstack = [];
        await seeker(T, wordlist[word], tweetstack);
        //console.log(tweetstack);
    };
    return tweetstack;
}

function retweet(T, clean){
 
}

function favorite(T, tweetstack){

}

module.exports = async (T, state) => {
    //tweet a wakeup phrase
    //sendTweet(T, state.goodTweets[Math.floor(Math.random() * state.goodTweets.length)]);
    //scan for tweets
    //filter out the bad
    //retweet or like the winners
    //tweet something 

    await T.get( 'search/tweets', {q: state.nice})
    .then( (tweets) => {
      //avoid naughty words
      var clean = [];
      for(tweet in tweets.statuses){
        let status = tweets.statuses[tweet];
//      console.log(status);
        if(status.text != undefined ){
          let words = status.text.toLowerCase().split(" ");
          let isGood = true;
          let rt = {
            "id"    : 0,
            "score" : 0,
            }
          for(bw in state.naughty){
//            console.log(naughty[bw]);
            if(words.includes(state.naughty[bw])){
               isGood = false;
//          log.debug('found word ' + naughty[bw] );
            }
          }
          //if everything is good add it to the list
          if(isGood){
//          console.log(words);
            rt.score = status.favorite_count + status.retweet_count;
            rt.id = status.id_str;
            clean.push(rt);
//          log.debug(clean);
          };
        }
      }; //end for(tweet in tweets)
   
// find the "best tweet"
      let win = [];
      for(t in clean){
        //like a tweet if it is over the like th
        let id = clean[t].id;
        if(clean[t].score > state.likeTH){
          T.post('favorites/create', {id:id}, function(error, response) {
            if (error) console.log(error);
          });
        };
        //like a tweet if it is over the like th
        //If the favorite is successful, log the url of the tweet 
        if(clean[t].score > state.rtTH){
          T.post('statuses/retweet/', {id:id}, function(error, tweet, response) {
            if (error) console.log(error);
          });
        };
      }; //end for(t in clean)

    });
};
    
}
