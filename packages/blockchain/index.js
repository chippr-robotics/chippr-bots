require('dotenv').config();
var { DPT } = require('ethereumjs-devp2p');
var { randomBytes } = require('crypto');
var { log } = require('@chippr-bots/common');

//vars
var chainFile = require(process.env.CHAIN_FILE);

const bootstrapNodes = chainFile.bootstrapNodes;

const PRIVATE_KEY = process.env.PRIVATE_KEY || randomBytes(32);


const BOOTNODES = bootstrapNodes.map((node) => {
  return {
    address: node.ip,
    udpPort: node.port,
    tcpPort: node.port,
  };
});

const dpt = new DPT(Buffer.from(PRIVATE_KEY, 'hex'), {
  endpoint: {
    address: '0.0.0.0',
    udpPort: null,
    tcpPort: null,
  },
});

//processes
dpt.on('error', err => {
  log.error({
    hound : process.env.HOUNDID,
    error : err.stack || err
  });
});

dpt.on('peer:added', peer => {
  let logData = {
      hound     : process.env.HOUNDID,
      type      : "peerAdd",
      peerID    : `${peer.id.toString('hex')}`,
      peerAddr  : `${peer.address}`,
      peerUDP   : `${peer.udpPort}`,
      peerTCP   : `${peer.tcpPort}`,
      totalPeer : `${dpt.getPeers().length}`,
      network   :  `${chainFile.name}`
  };

  log.info('peer added',logData);
});
dpt.on('peer:removed', peer => {
    let logData = {
        hound     : process.env.HOUNDID,
        type      : "peerDrop",
        peerID    : `${peer.id.toString('hex')}`,
        peerAddr  : `${peer.address}`,
        peerUDP   : `${peer.udpPort}`,
        peerTCP   : `${peer.tcpPort}`,
        totalPeer : `${dpt.getPeers().length}`,
        network   :  `${chainFile.name}`
    };
    log.info('peerDrop',logData);  
});

if( process.env.ALLOW_BINDING === true){
    dpt.bind( process.env.BIND_PORT, process.env.BIND_ADDR);
}

for (let bootnode of BOOTNODES) {
  dpt.bootstrap(bootnode).catch(err => {
    log.error({
      hound : process.env.HOUNDID,
      error : err.stack || err
    });
  });
}