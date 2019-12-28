require("dotenv").config();
var { log, T } =require("@chippr-bots/common");


var {
  tags,
  seeker
  } = require("./lib");

log.info("🤖  bridgette-twitter loaded");


function main(){
for(tag in tags){
  let res = seeker(T, tags[tag], 5, 25);
 }
}
main();
setInterval(() => {main()}, 600000);
