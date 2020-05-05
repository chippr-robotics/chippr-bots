var { log } = require('@chippr-bots/common');

/* this module should find all tweets based on a key word and clean them up for processing 
*/

module.exports = async  (T, nice, tweetstack) => {
  log.info(`[bridgette-twitter/lib/seeker] seeker is running for word ${nice}`);
  try{
    await T.get( 'search/tweets', {q: nice})
      .then( (tweets) => {
        for(tweet in tweets.statuses){
          let status = tweets.statuses[tweet];
          log.debug(`[bridgette-twitter/lib/seeker] ${status}`);
          if(status.text != undefined ){
            //cleanup and normalize text
            let words = status.text.toLowerCase().split(" ");
            for(word in words){
              var url = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
              var chk2 = new RegExp(url);
              if( words[word].match(chk2) ){
                delete words[word];
              }
            }
            tweetstack.push(words);
          }
        }; 
        //end for(tweet in tweets)
        //return the tweetstack
        log.debug(`[bridgette-twitter/lib/seeker] ${tweetstack}`)
      });
    }
    catch(error){
      console.log(error);
    }
};