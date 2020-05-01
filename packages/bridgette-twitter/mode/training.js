var { log } = require('@chippr-bots/common');

var { bayes, seeker } = require('../lib');
var fs = require('fs');

const defaultModel = require('../models/default.json');

/* training loop 
*   the training module should
*     - pull the nice list
*     - check the model folder to see if a model exists
*     - seek out new posts for each word on the nice list and naughty list
*     - train on the returned posts
*     - save the model
*     - repeat this every 5 minutes(to let twitter generate more content)
*     - continue until another mode is selected
*/

function saveModel(category, model){
    let filePath = `./models/${category}.json`;
    fs.writeFile( filePath , JSON.stringify(model), function (err) {
        if (err) throw err;
        log.info(`Saved a model for ${category}`);
     });
}

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


module.exports = async (T, wordlist) => {
    for(word in wordlist){
        let workingModel = getModel( wordlist[word] );
        //console.log(workingModel);
        let tweetstack = [];
        await seeker(T, wordlist[word], tweetstack);
        //console.log(tweetstack);
        bayes(tweetstack, wordlist[word], workingModel)
        //console.log(workingModel);
        saveModel(wordlist[word], workingModel);
    }
}
    