const dir = __dirname;
const fs = require("fs");
//IPFS client and functions setup
const { create } = require('ipfs-http-client');
const IPFSclient = create('http://192.168.1.30:5001');


async function mintCID(){
    let cidlist = [];
    //get the filelist
    
    let filelist = fs.readdirSync(`${dir}/output/meta`)
    filelist = filelist.filter((item) => item.endsWith('json'))
    filelist.sort();
    console.log(`storing cids count:`+ filelist.length);
    for (let i = 0; i <= filelist.length -1 ; i++) {
      
        console.log(`storing:`+ filelist[i]);
      let CIDs =  await IPFSclient.add(fs.readFileSync(`./output/meta/${filelist[i]}`))
      cidlist.push(CIDs.path);
  }
    setTimeout(() => {
    console.log("waiting to store cidlist")
    }, 5000);
    console.log("Writing CID data...");
    fs.writeFileSync(`./output/cidList.json`, JSON.stringify(cidlist));
  }
  

mintCID();