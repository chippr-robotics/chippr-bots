var { log } = require('@chippr-bots/common');
var naughty = require('./naughty');

module.exports = async  (T, _q, likeTH, rtTH) => {
  log.info("[bridgette-twitter/lib/seeker] seeker is running");
  await T.get( 'search/tweets', {q: _q})
    .then( (tweets) => {
      //avoid naughty words
      var clean = [];
      for(tweet in tweets.statuses){
        let status = tweets.statuses[tweet];
//      console.log(status);
        if(status.text != undefined ){
          let words = status.text.split(" ");
          let isGood = true;
          let rt = {
            "id"    : 0,
            "score" : 0,
            }
          for(bw in naughty){
            if(words.includes(naughty[bw].toLowerCase())) isGood = false;
//          log.debug('found word ' + naughty[bw] );
          }
          //if everything is good add it to the list
          if(isGood){
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
        if(clean[t].score > likeTH){
          T.post('favorites/create', {id:id}, function(error, response) {
            if (error) console.log(error);
          });
        };
        //like a tweet if it is over the like th
        //If the favorite is successful, log the url of the tweet 
        if(clean[t].score > rtTH){
          T.post('statuses/retweet/', {id:id}, function(error, tweet, response) {
            if (error) console.log(error);
          });
        };
      }; //end for(t in clean)

    });
};
