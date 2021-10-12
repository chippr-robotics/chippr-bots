const { dialogflow, SimpleResponse } = require('actions-on-google');
const { WebhookClient, Image } = require('dialogflow-fulfillment');

/*
* intent flows
*
*/

function WebhookProcessing(req, res) {
    const agent = new WebhookClient({request: req, response: res});
	let intentMap = new Map();
	intentMap.set('etc_getBlockNumber', etc_getBlockNumber);
	intentMap.set('blockstreamSat', dapp_bs_sat);
	intentMap.set('getPrice', int_getPrice);
	intentMap.set('version', etc_version);
	agent.handleRequest(intentMap);
}

async function etc_getBlockNumber(agent){
	log.debug('[index.js] etc_getBlockNumber: ');
	log.debug(agent.parameters);
	let res = await getBlockNumber(agent.parameters.Blockchain)
	log.debug('[index.js] etc_getBlockNumber: req: ' + agent +' res: ' + res.message);
	agent.add( res.message );
};

async function int_getPrice(agent){
	log.debug('[index.js] int_getPrice: ');
	log.debug(agent.parameters);
	let res = await getPrice(agent.parameters.Blockchain)
	log.debug('[index.js] int_getPrice: req: ' + agent +' res: ' + res.message);
	agent.add( res.message );
};

//admin functions
async function etc_version(agent) {
	let res = await version();
	log.debug('[index.js] etc_version: req: ' + agent +' res: ' + res);
	agent.add( res.message );
};

//error handeling
function fallback(agent) {
	log.debug(agent);
	agent.ask(`I'm having a little trouble with my node right now, ask again in a little bit.`);
  };

/*  assistant.catch((agent, error) => {
	console.error(error);
	agent.ask('I encountered a glitch. Can you say that again?');
  });
*/
//endflows
/*
assistant.intent('etc_getBalance', agent => {
	getBalance(agent.parameters.account)
	.then( (res) => {
		log.debug('[index.js] etc_getBalance: req: ' + agent +' res: ' + res);
		agent.ask( res.message );
	})
	.catch((err) => {
		log.error('[index.js] etc_getBalance: ' + err);
	});
});
assistant.intent('etc_getTransaction', agent => {
	getTransaction(agent.parameters.transaction)
	.then( (res) => {
		log.debug('[index.js] etc_getTransaction: req: ' + agent +' res: ' + res);
		agent.ask( res.message );
	})
	.catch((err) => {
		log.error('[index.js] etc_getTransaction: ' + err);
	});
});
assistant.intent('etc_sendSignedTransaction', agent => {
	sendSignedTransaction(agent.parameters.signedTX)
	.then( (res) => {
		log.debug('[index.js] etc_sendSignedTransaction: req: ' + agent +' res: ' + res);
		agent.ask( res.message );
	})
	.catch((err) => {
		log.error('[index.js] etc_sendSignedTransaction: ' + err);
	});
});
assistant.intent('etc_getGasPrice', agent => {
	getGasPrice()
	.then( (res) => {
		log.debug('[index.js] etc_getGasPrice: req: ' + agent +' res: ' + res);
		agent.ask( res.message );
	})
	.catch((err) => {
		log.error('[index.js] etc_getGasPrice: ' + err);
	});
});
assistant.intent('etc_getBlock', agent => {
	getBlock(agent.parameters.blockNumber)
	.then( (res) => {
		log.debug('[index.js] etc_getBlock: req: ' + agent +' res: ' + res);
		agent.ask( res.message );
	})
	.catch((err) => {
		log.error('[index.js] etc_getBlock: ' + err);
	});
});
*/
