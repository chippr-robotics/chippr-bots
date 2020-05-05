var { log } = require('@chippr-bots/common');

var { bayes, seeker, markov, filter } = require('../lib');

/* narative loop 
*   the  module should
*     - say something positive
*     - pull the naughty and nice list
*     - use seeker to pull some tweets
*     - 
*
*/

function sleep(ms){
    setTimeout(()=>{},ms)
}

module.exports = async (T, state) => {
    //tweet a wakeup phrase
    //sendTweet(T, state.goodTweets[Math.floor(Math.random() * state.goodTweets.length)]);
    //scan for tweets
    //filter out the bad
    //retweet or like the winners
    //tweet something 
    log.debug(state.hashtags);
    try {
    for(word in state.hashtags){    
        sleep(5000);
        await T.get( 'search/tweets', {q: word})
         .then( (tweets) => {
        
      //avoid naughty words
      var clean = [];
      for(tweet in tweets.statuses){
        let status = tweets.statuses[tweet];
        log.debug(status);
        if(status.text != undefined ){
          let words = status.text.toLowerCase().split(" ");
          let isGood = true;
           let rt = {
             "id"    : 0,
             "score" : 0,
             }
           for(bw in state.naughty){
             console.log(state.naughty[bw]);
             if(words.includes(state.naughty[bw])){
                isGood = false;
           log.debug('found word ' + state.naughty[bw] );
             }
           }
           //if everything is good add it to the list
           if(isGood){
           log.debug(words);
             rt.score = status.favorite_count + status.retweet_count;
             rt.id = status.id_str;
             clean.push(rt);
           log.debug(clean);
           };
         }
       }; //end for(tweet in tweets)
      
//  find the "best tweet"
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
    }
 
} catch (error) {
console.log(error);        
}

};