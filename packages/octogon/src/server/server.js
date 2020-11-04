require('dotenv').config()
const WebSocket = require('ws');
const _ = require('lodash');
const Resurrect = require('resurrect-js');
const Matter = require('matter-js');
const express = require('express');
const Player = require('../core/player');

global.HTMLElement = () => {};
const { world, playerObject } = require('../core/physics');
const PORT = process.env.PORT;

const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const wss = new WebSocket.Server({server});
const necro = new Resurrect();
var clients = [];

wss.on('connection', function connection(ws) {
  
    //create a new player when something is connected
    const newClient = { 
        ws, 
        isAlive: true, 
        body: Player.createNewPlayer(
            world, 
            {
                x: 100, 
                y: 100
            })
        }
  
  ws.on('pong', () => { newClient.isAlive = true });

  clients = clients.concat(newClient);
//send the bodyid to the new connection
  ws.send(necro.stringify({ type: 'connection', data: { bodyId: newClient.body.id }}));
  
  ws.on('message', (serializedMessage) => {
    var message = {};
    try {
      message = necro.resurrect(serializedMessage);
    } catch (e) {
      console.log(`unable to parse client message: ${serializedMessage}`);
    }
    if (message.type === 'keyup') {
      const magnitude = 0.025;
      const forceMapping = {
        d: { x: magnitude, y: 0 },
        a: { x: -1 * magnitude, y: 0 },
        w: { x: 0, y: -1 * magnitude },
        s: { x: 0, y: magnitude },
      }

      const force = forceMapping[message.data.key];
      if (force) {
        Matter.Body.applyForce(newClient.body, newClient.body.position, force)
      }
    }
  });
});

const broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(necro.stringify(data));
    }
  });     
};

setInterval(function() {
        broadcast({ type: 'world', data: world });
}, 1000 / 30);

const resetPlayerObject = () => {
  console.log("reset");
  Matter.Body.setPosition(playerObject, { x: 400, y: 200 });
}


const interval = setInterval(function ping() {
  const deadClients = _.remove(clients, client => {!client.isAlive});
  deadClients.forEach(client => {
    client.ws.terminate()
    Matter.Composite.remove(world, client.body);
  });
  clients.forEach(client => {
    client.isAlive = false;
    client.ws.ping('', false, true);
  });
}, 2000);