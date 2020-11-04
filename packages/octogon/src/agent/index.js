const Resurrect = require('resurrect-js');
const WebSocket = require('ws');

const ws = new WebSocket("ws://localhost:8080");
const necro = new Resurrect()

//modules
var orient = require('./orient');
var decide  = require('./decide');
var sendAction  = require('./action');
var Agent = require('./goals/basic');
var Memory = require('./memory');

//connect to the world
ws.onopen = function open(message) {
};

//global
var world = null;
var playerBodyId = null;
var smartagent = null;

//constant observations from the world
ws.onmessage = function incoming(incomingMessage) {
  const deserializedMessage = necro.resurrect(incomingMessage.data);
  if (deserializedMessage.type === 'world') {
    world = deserializedMessage.data;
  } else if (deserializedMessage.type === 'connection') {
    playerBodyId = deserializedMessage.data.bodyId;
    smartagent = new Agent(playerBodyId);
    workingMemory = new Memory(smartagent.lifeSpan);
  }
};

var counter = 0;
//agent ooda loop
var lifeLoop = setInterval(()=>{
   if(world != undefined && playerBodyId != undefined){
       //observation
            //observe the world
        // orient
            // any goals or strategies or information to apply to the world before the decide
        
        //add possible actions
        world = orient(world, smartagent);

        // decision
        let key = decide(world, smartagent);

        // action
        sendAction(world.actionList[key], ws);

        //learn
        workingMemory.addSample({world, smartagent, key});

        //die and train
        if(!smartagent.isAlive) {
            let lifeFlash = workingMemory.sample(Math.floor(Math.random()*smartagent.lifeSpan));
            console.log(lifeFlash);
            ws.terminate();
            clearInterval(lifeLoop);
        }
    }
},500)




