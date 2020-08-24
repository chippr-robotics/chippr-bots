require("dotenv").config()
var options = {
  apiVersion: 'v1', // default
  endpoint: process.env.DB_VAULT_ADDRESS, // default
  token: process.env.VAULT_TOKEN // optional client token; can be fetched after valid initialization of the server
};

var vault = require("node-vault")(options);
const dialogflow = require('@google-cloud/dialogflow').v2beta1;


const { log } = require('@chippr-bots/common');
//const uuid = require('uuid');
var config;
vault.read('secret/dialogFlow').then( res =>{
 config = {
       credentials: {
          private_key: res.data.private_key,
          client_email: res.data.client_email
         }
    }
const dialogflowClient = new dialogflow.SessionsClient(config);

//console.log(config);


// Instantiate a DialogFlow client.
log.info('dialog flow session starting');


log.info("Discord bridge starting....");

// Define session path


const Discord = require('discord.js');
const discordClient = new Discord.Client();

discordClient.on('ready', () => {
  log.info(`${discordClient.user.id} is Ready!`);
});

discordClient.on('message', m => {
  //console.log("This should be false:")
  //console.log(!shouldBeInvoked(m));
  if (!shouldBeInvoked(m)) {
    console.log('call not invoked')
    return;
  }
  //console.log("clear");
  // session path (project, environment, user, session);
  var sessionPath = dialogflowClient.projectAgentSessionPath(process.env.PROJECT_ID, discordClient.user.id);

  log.info(m);
  // remove the user name from the message befor sendining it to dialogflow
  const message = remove(discordClient.user.username, m.cleanContent);

  if (message === 'help') {
    return m.channel.send(process.env.DISCORD_HELP_MESSAGE);
  }
  let dialogflowRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US'
      }
    }
  };

  log.info("sending to dialogflow")
  dialogflowClient.detectIntent(dialogflowRequest).then(responses => {
  //  log.info(responses);
    m.channel.send(responses[0].queryResult.fulfillmentText);
  });
});

function shouldBeInvoked(message) {
return (message.content.startsWith(process.env.DISCORD_PREFIX) ||
          message.content.startsWith('@!' + discordClient.user.id) ||
          message.channel.type === 'dm') &&
          discordClient.user.id !== message.author.id;
}

function remove(username, text) {
  return text.replace('@' + username + ' ', '').replace(process.env.DISCORD_PREFIX + " ", '');
}

discordClient.login(process.env.DISCORD_TOKEN);
});
