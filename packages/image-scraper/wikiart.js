
const fetch = require('node-fetch');
const request = require('request');
const fs = require('fs');
var bodyParser = require('body-parser');

// --- Env variables ---
require("dotenv").config();
/*
 MAX_PICTURES | NUMBER |  HOW MANY PICTURES DO YOU WANT (MAX 100)
 OUTPUT_DIR   | STRING |  
 SUBREDDIT    | STRING |
 SORT_BY      | STRING |  {top, controversial, hot, rising}
 TIME         | STRING |  {hour,day,week,month,year,all}
*/
var genre_list = ['portrait', 'landscape', 'genre-painting', 'abstract', 'religious-painting',
              'cityscape', 'sketch-and-study', 'figurative', 'illustration', 'still-life',
              'design', 'nude-painting-nu', 'mythological-painting', 'marina', 'animal-painting',
              'flower-painting', 'self-portrait', 'installation', 'photo', 'allegorical-painting',
              'history-painting', 'interior', 'literary-painting', 'poster', 'caricature',
              'battle-painting', 'wildlife-painting', 'cloudscape', 'miniature', 'veduta',
              'yakusha-e', 'calligraphy', 'graffiti', 'tessellation', 'capriccio', 'advertisement',
              'bird-and-flower-painting', 'performance', 'bijinga', 'pastorale', 'trompe-loeil',
              'vanitas', 'shan-shui', 'tapestry', 'mosaic', 'quadratura', 'panorama', 'architecture']

// --- Function declarations ---
async function get_painting_list(count, type, searchword){
    try{ 
        const url = "http://www.wikiart.org/en/paintings-by-" + type + "/" + searchword + "/" + count;
        
        var images;
        var soup = await request(url, function(
            error, response, body) {
                let re = 'https?://uploads[0-9]+[^/\s]+/\S+\.jpg';
                console.error('error:', error);
                let soup= new JSSoup(body);
                
                console.log(images.length);
            });        
    } catch(e){
        console.log(e)
    }

}
var Scraper = require('images-scraper');

const google = new Scraper({
  puppeteer: {
    headless: false,
  },
});

(async () => {
  const results = await google.scrape('banana', 200);
  console.log('results', results);
})();
//get_painting_list(50, 'genre', 'landscape');