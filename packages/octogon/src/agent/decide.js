//libs
const Resurrect = require('resurrect-js');
const necro = new Resurrect()

//functions
//this is a random bot
//make a decision based on the world

function decide(world){
    return Math.floor(Math.random() * world.actionList.length);
}

//export
module.exports = (world) => {
    return decide(world);
}