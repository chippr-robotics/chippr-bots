const fs = require("fs");
const myArgs = process.argv.slice(2);
const { createCanvas, loadImage } = require("canvas");
const { layers, width, height } = require("./input/config.js");
const console = require("console");
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");
const edition = myArgs.length > 0 ? Number(myArgs[0]) : 1;
const project = "ETC_ARMY";
var metadata = [];
var attributes = [];
const dir = __dirname;
var CID = "";

//IPFS client and functions setup
const { create } = require('ipfs-http-client');
const IPFSclient = create('http://192.168.1.30:5001');

// call Core API methods
async function pushFile(_edition){
  CID = await IPFSclient.add(fs.readFileSync(`./output/img/${_edition}.png`))
};

const saveLayer = (_canvas, _edition) => {
  fs.writeFileSync(`./output/img/${_edition}.png`, _canvas.toBuffer("image/png"));
};

function writeMetadata(_metadata) {
  fs.writeFileSync(`./output/meta/${_metadata.name}.json`, JSON.stringify(_metadata));
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function addMetadata(_index, _attributes) {
  let dateTime = Date.now();  
  await sleep(1000);
  let _CID = await IPFSclient.add(fs.readFileSync(`./output/img/${_index}.png`))
  let tempMetadata = {
    name: project + "_#" + Math.floor(Math.random() * dateTime),
    date: dateTime,
    image: "https://ipfs.io/ipfs/" + _CID.path,
    attributes: _attributes,
  };
  //metadata.push(tempMetadata);
  writeMetadata(tempMetadata);
  console.log("Creating nft #" + _index);

};

const addAttributes = (_element, _layer) => {
  let tempAttr = {
    trait_type: _layer.trait_type,
    value: _element.name,
  };
  attributes.push(tempAttr);
};

async function drawLayer(_layer, _edition) {
  let element =
    _layer.value[Math.floor(Math.random() * _layer.value.length)];
  addAttributes(element, _layer);
  const image = await loadImage(`${_layer.location}${element.fileName}`);
  ctx.drawImage(
    image,
    _layer.position.x,
    _layer.position.y,
    _layer.size.width,
    _layer.size.height
  );
  saveLayer(canvas, _edition);
};


//Draw the nft
function main(){
  for (let i = 1; i <= edition; i++) {
    layers.forEach((layer) => {
      drawLayer(layer, i);
    });
    
    addMetadata(i, attributes);
    //write metadata json
    
    attributes = [];
  }
 
  
}

//run functions
//make the images and metadata
main();

//send metadata to ipfs


//mint tokens




