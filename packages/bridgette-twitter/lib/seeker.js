var { log } = require('@chippr-bots/common');

module.exports = async  (T, nice, naughty, likeTH, rtTH, ) => {
  log.info("[bridgette-twitter/lib/seeker] seeker is running");
  
  await T.get( 'search/tweets', {q: _q})
    .then( (tweets) => {
      //avoid naughty words
      var clean = [];
      for(tweet in tweets.statuses){
        let status = tweets.statuses[tweet];
        log.debug(`[bridgette-twitter/lib/seeker] ${status}`);
        if(status.text != undefined ){
          let words = status.text.toLowerCase().split(" ");
          let isGood = true;
          let rt = {
            "id"    : 0,
            "score" : 0,
            }
          for(bw in naughty){
            log.debug(`[bridgette-twitter/lib/seeker] ${naughty[bw]}`);
            if(words.includes(naughty[bw])){
               isGood = false;
          log.debug(`[bridgette-twitter/lib/seeker] found word ${naughty[bw]}`);
            }
          }
          //if everything is good add it to the list
          if(isGood){
            log.debug(`[bridgette-twitter/lib/seeker] ${words}`);
            rt.score = status.favorite_count + status.retweet_count;
            rt.id = status.id_str;
            clean.push(rt);
            log.debug(`[bridgette-twitter/lib/seeker] ${clean}`);
          };
        }
      }; //end for(tweet in tweets)
   
// find the "best tweet"
      let win = [];
      for(t in clean){
        //like a tweet if it is over the like th
        let id = clean[t].id;
        if(clean[t].score > likeTH){
          T.post('favorites/create', {id:id}, function(error, response) {
            if (error) log.error(`[bridgette-twitter/lib/seeker] ${error}`);
          });
        };
        //like a tweet if it is over the like th
        //If the favorite is successful, log the url of the tweet 
        if(clean[t].score > rtTH){
          T.post('statuses/retweet/', {id:id}, function(error, tweet, response) {
            if (error) log.error(`[bridgette-twitter/lib/seeker] ${error}`);
          });
        };
      }; //end for(t in clean)

    });
};