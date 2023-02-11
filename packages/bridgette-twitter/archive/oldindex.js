var { log, T } =require("@chippr-bots/common");
var bdb = require("@chippr-bots/bridgettedb");
const path = require('path')

var {training, character} = require("../mode");

var {
  tags,
  seeker
  } = require("../lib");

log.info("🤖  bridgette-twitter loaded with DBKEY: " + process.env.BDB_DBKEY);

var b = new bdb({
  "nodeAddr": process.env.BDB_NODE_URL,
  "accountAddress": process.env.BDB_ACCOUNT_ADDR,
  "accountPasswd" : process.env.BDB_ACCOUNT_PASSWD,
  "kvsAddr" : process.env.BDB_CONTRACT_ADDR,
  "DBKEY": process.env.BDB_DBKEY
  })

var state = {
  "activeState" : "training",
  tweetstack : [],
  likeTH : 9999999,
  rtTH : 9999999,
  hashtags: [],
  naughty: [],
}


//keep refreshing lists
setInterval(() => {
  try {
    b.get("likeTH").then(res => {log.debug(`o likeTH: ${res}`); state.likeTH = parseInt(res,10)});
    b.get("rtTH").then(res => {log.debug(`o rtTH: ${res}` ); state.rtTH = parseInt(res, 10)});
    b.get("nice").then(res => {log.debug(`o Nice: ${res}` ); state.hashtags = res.split(",")});
    b.get("naughty").then(res => {log.debug(`o Naughty: ${res}` ); state.naughty = res.split(",")});
    b.get("activeState").then(res => {log.debug(`o State: ${res}` ); state.activeState = res});
  } catch (error) {
    log.error(`[bridgette-twitter/index] error getting variables: ${error}`)
  }
}, process.env.SYNC_LOOP_TIMER);

function main(){
  log.info(`o likeTH: ${state.likeTH} | rtTH: ${state.rtTH} | Nice ${state.hashtags} | Naughty ${state.naughty}` );
  switch (state.activeState) {
    case "training":
        let tl = state.hashtags.concat(state.naughty);
        log.info( `training on: ${tl}`);
        training(T, tl);
      break;
    case "character":
      //log mode 
      log.info( `Tweeting on: ${state.hashtags}`);
      //Run loop
      character(T, state);      
      break;
    default:
      break;
    }
}

setInterval(() => {
  main()
}, process.env.MAIN_LOOP_TIMER);
