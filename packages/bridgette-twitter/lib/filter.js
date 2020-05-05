var { log } = require('@chippr-bots/common');

/* this module should find all tweets based on a key word and clean them up for processing 
*/

module.exports = (filters, tweetstack) => {
  log.info(`[bridgette-twitter/lib/filter] filter is running for current tweetstack`);
    //get the total number of examples
    let tp = 0;
    for (filter in filters){
        tp = tp + (filters[filter].exampleCount);
        log.info(`[bridgette-twitter/lib/filter] running total of examples ${tp}`);
    }

    //look at each tweet one by one
     for(tweet in tweetstack){
        log.info(`[bridgette-twitter/lib/filter] tweet number: ${tweet}`);
        let catRank = [];
        let rawtweets = tweetstack[0][tweet];
        //rank against each category
        for(cats in filters){
            //get p out of total categories
            var p = (filters[cats].exampleCount) / tp ;
            log.info(`[bridgette-twitter/lib/filter] total categories: ${p}`);
            //for each word in the tweet, get a score
            let score = 0;
            for(word in rawtweets){
                log.info(`[bridgette-twitter/lib/filter] should not be null: ${filters[cats].wordlist[rawtweets[word]]}`);
                if(filters[cats].wordlist[rawtweets[word]] != null){
                    // count of word j in class c / counts of words in class c
                    score = score * (filters[cats].wordlist[rawtweets[word]] / filters[cats].wordCount + 1);
                  } else { 
                      //keep from having zeros
                      score = score * (1 / filters[cats].wordCount + 1);
                  };
                  log.info(`[bridgette-twitter/lib/filter] running score ${score}`);
            }
            let cat = filters[cats].category;
            catRank.push = { cat : (score * p) }  
        }
        console.log(catRank);
     }
    //should return a categorized ranked tweetstack
}; 