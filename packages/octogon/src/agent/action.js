//libs
const Resurrect = require('resurrect-js');
const necro = new Resurrect()

//functions
//generic message send
function sendAction(key, ws){
    ws.send(necro.stringify({ type: 'keyup', data:  {key}   }));
}


//export
module.exports = (key, ws) => {
    sendAction(key, ws);
    return true;
}