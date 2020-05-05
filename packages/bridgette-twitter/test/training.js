require("dotenv").config();
var { log, T } =require("@chippr-bots/common");

var { training } = require("./mode")

training(T, ["giveaway"])