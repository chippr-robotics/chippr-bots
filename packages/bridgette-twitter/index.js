var { log, T } =require("@chippr-bots/common");
var bdb = require("@chippr-bots/bridgettedb");

var {
  tags,
  seeker
  } = require("./lib");

log.info("🤖  bridgette-twitter loaded with DBKEY: " + process.env.BDB_DBKEY);


var b = new bdb({
  "nodeAddr": process.env.BDB_NODE_URL,
  "accountAddress": process.env.BDB_ACCOUNT_ADDR,
  "accountPasswd" : process.env.BDB_ACCOUNT_PASSWD,
  "kvsAddr" : process.env.BDB_CONTRACT_ADDR,
  "DBKEY": process.env.BDB_DBKEY
  })

setInterval(() => {
  try {
    b.get("likeTH").then(res => {log.debug(`o likeTH: ${res}`);b.likeTH = parseInt(res,10)});
    b.get("rtTH").then(res => {log.debug(`o rtTH: ${res}` ); b.rtTH = parseInt(res, 10)});
    b.get("nice").then(res => {log.debug(`o Nice: ${res}` ); b.hashtags = res.split(",")});
    b.get("naughty").then(res => {log.debug(`o Naughty: ${res}` ); b.naughty = res.split(",")});
  } catch (error) {
    log.error(`[bridgette-twitter/index] error getting variables: ${error}`)
  }
}, 6000);

function main(){
  log.info(`o likeTH: ${b.likeTH} | rtTH: ${b.rtTH} | Nice ${hashtags} | Naughty ${b.naughty}` );
  for(tag in b.hashtags){ 
    let res = seeker(T, b.hashtags[tag], b.naughty, b.likeTH, b.rtTH);
   }
}

main();

setInterval(() => {main()}, process.env.MAIN_LOOP_TIMER);