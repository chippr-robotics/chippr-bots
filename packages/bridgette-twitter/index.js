const IpfsClient = require('ipfs-http-client');
const OrbitDB = require('orbit-db');
const ipfs = IpfsClient('localhost', '5001');

console.log(ipfs);

async function dbConnect(){
  const orbitdb = await OrbitDB.createInstance(ipfs);
  const db = await orbitdb.log('hello');
}
dbConnect().then(()=>{
   console.log(db);
});
