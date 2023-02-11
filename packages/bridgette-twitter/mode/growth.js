var { log } = require('@chippr-bots/common');

var { bayes, seeker, markov, filter } = require('../lib');

function sleep(ms){
    setTimeout(()=>{},ms)
}

module.exports = async (T, state) => {
    /* 
    seek
    find tweets with phrase 
    check if phrase is over like th
        add user to follow queue for follow loop
    
    follow loop
    check if following 
        follow if followers > 1000 & following > 1000 & ratio > .6 
        add name to bot followed list
             username & date
    
    unfollow loop
    if date >5 days 
        if != follows you, unfollow
    if date >30 days unfollow
    
    reqs
    bot cant retweet
    bot cant unfollow human selected accounts
    eventually use gpt trained on tweets to schedule tweets?
    
  var state = {
    "activeState"   // set the bot to which mode it should be in
    tweetstack :    // working memory
    likeTH :        // how many tweets equals a possible 'good' tweet
    rtTH :          // how many tweets equals a possible 'retweetable' tweet
    hashtags:       // what are we searching for
    naughty:        // red flag words
    followersFloor: // how many followers someone needs before we follow
    followingFloor: // how many followers someone needs before we follow
    ratio:          // percent that following vs followers to use before following
    noScrubs:       // bool on if we drop people that dont follow back
    coolOff:        // how long to wait to avoid triggering 
  }
    */

    log.debug(state.hashtags);
    try {
    //seek loop
      for(word in state.hashtags){    
        //serach for tweets with the hashtag
        await T.get( 'search/tweets', {q: word})
         .then( (tweets) => {
            //avoid naughty words
            var candidates = [];
            for(tweet in tweets.statuses){
                //look at tweet n out of the list
                let status = tweets.statuses[tweet];
                log.debug(status);
                //make sure the tweet is real
                if(status.text != undefined ){
                    //change everything to lowercase
                    let words = status.text.toLowerCase().split(" ");
                    //default is honest people....
                    let isGood = true;
                    //try to avoid the bad words
                    for(bw in state.naughty){
                        log.debug(state.naughty[bw]);
                        if(words.includes(state.naughty[bw])){
                            isGood = false;
                            log.debug('found word ' + state.naughty[bw] );
                        }
                    }  
                    //if everything is good add the tweeter to the list to the list
                    if(isGood){
                        log.debug(status.user.id);
                    //calc if they are worthy of a follow: follower count high enough, follows back, good ratio
                        if (
                            status.user.followers_count > state.followersFloor && 
                            status.user.friends_count > state.followingFloor && 
                            status.user.friends_count / status.user.followers_count > state.ratio
                        ){
                            //if the candidate isnt in the list add them
                            if (!candidates.includes(status.user.id)) candidates.push(status.user.id); 
                            log.debug(candidates);
                        }  
                    };
                } //end (status.text != undefined tweeter should have been added to the candidate list if they meet the criteria
             }; //end for(tweet in tweets) should have a list of candidates 
            //follow logic 
            for (account in candidates){
                //dont be sus
                if(account % 30 == 0 ) sleep();             
                await T.post( 'friendship/create', {q: candidates[account]})              
            }

     });
    }
    //dont be sus
    sleep(state.coolOff);
        
} catch (error) {
    log.error(error);        
}

};