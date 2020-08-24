require('dotenv').config()

var config = require('./config.js');

var fs = require('fs'),
    path = require('path'),
    Twitter = require('twitter'),
    list = require("./lister"),
    request = require('request');
var T = new Twitter(config);

// Set up your search parameters
var params = {
  q: '#christmaslights',
  count: 10,
  result_type: 'recent',
  lang: 'en'
}

//T.post('statuses/update', { status: '10 Days until Christmas!' }, 
//  function(err, data, response) { 
//  console.log(data) // If there is no error, proceed
//});

function download(uri, filename, callback){
console.log("ggg "+uri);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
};

function getter(){ 
T.get('search/tweets', params, function(err, data, response) {
if(!err){
// Loop through the returned tweets
    for(let i = 0; i < data.statuses.length; i++){
      let id = { id: data.statuses[i].id_str }; 
       let photo = data.statuses[i];
//    console.log(photo.entities.media);
      if(photo.entities.media != undefined) {
     console.log(photo.entities.media[0].media_url);
     var onList = list({ url: photo.entities.media[0].media_url, owners:['me'],threshold: 0.6});
    try{
      download(photo.entities.media[0].media_url, "/img/"+ Math.random().toString(36).substring(2, 15) + ".jpg", function(){
  console.log('done'); 
      });
}
catch(err) {console.error(err)};
}
      // Try to Favorite the selected Tweet
      /* T.post('favorites/create', id, function(err, response){
        // If the favorite fails, log the error message
        if(err){
          console.log(err[0].message);
        }
        // If the favorite is successful, log the url of the tweet
        else{
          let username = response.user.screen_name;
          let tweetId = response.id_str;
          console.log('Favorited: ', `https://twitter.com/${username}/status/${tweetId}`)
        }
      });*/
    }
  } else {
    console.log(err);
  }
})

};

setInterval(()=>{
getter();}
,3000);
