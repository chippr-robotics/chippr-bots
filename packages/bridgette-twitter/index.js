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
     b.get(process.env.DBKEY + "likeTH").then(res => {log.debug(`o likeTH: ${res}`);b.likeTH = parseInt(res,10)});
     b.get(process.env.DBKEY + "rtTH").then(res => {log.debug(`o rtTH: ${res}` ); b.rtTH = parseInt(res, 10)});
     b.get(process.env.DBKEY + "nice").then(res => {log.debug(`o Nice: ${res}` ); b.hashtags = res.split(",")});
     b.get(process.env.DBKEY + "naughty").then(res => {log.debug(`o Naughty: ${res}` ); b.naughty = res.split(",")});
}, 6000);



function main(){
  for(tag in b.hashtags){
    log.info(`o likeTH: ${b.likeTH} | rtTH: ${b.rtTH} | Nice ${hashtags} | Naughty ${b.naughty}` ); 
    let res = seeker(T, b.hashtags[tag], b.naughty, b.likeTH, b.rtTH);
   }
}

main();

setInterval(() => {main()}, 600000);