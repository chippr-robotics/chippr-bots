require("dotenv").config();
var { log, T, realState } =require("@chippr-bots/common");


var {
  tags,
  seeker
  } = require("./lib");

log.info("🤖  bridgette-twitter loaded");



var b = new realState();

setInterval(() => {
     b.get("likeTH").then(res => {b.likeTH = parseInt(res,10)});
     b.get("rtTH").then(res => {b.rtTH = parseInt(res, 10)});
     b.get("hashtags").then(res => {b.hashtags = res.split(",")});
     b.get("naughty").then(res => {b.naughty = res.split(",")});
}, 6000);



function main(){
  for(tag in b.hashtags){
    let res = seeker(T, b.hashtags[tag], b.naughty, b.likeTH, b.rtTH);
   }
}

main();

setInterval(() => {main()}, 600000);


