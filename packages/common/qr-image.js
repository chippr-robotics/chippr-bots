const qr = require('qr-image');
const fs = require("fs");
const uuidv1 = require("uuid/v1");

module.exports = (data) => {
    let fileName = uuidv1() + '.png';
    fs.writeFile( `./tempImage/${fileName}`, qr.imageSync(data) , err =>{
        if (err) console.error(err);
    });
    return fileName;
}