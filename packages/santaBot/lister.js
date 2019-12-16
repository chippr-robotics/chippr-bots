require('dotenv').config();

const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const { IamAuthenticator } = require('ibm-watson/auth'); 
const visualRecognition = new VisualRecognitionV3({
  version: process.env.IBMVER || '2018-03-19',
  authenticator: new IamAuthenticator({
    apikey: process.env.IBMAPI,
  }),
  url: process.env.IBMURL,
});

const classifyParams = {
  url: 'https://watson-developer-cloud.github.io/doc-tutorial-downloads/visual-recognition/fruitbowl.jpg',
  owners: ['DefaultCustomModel_435682538'],
  threshold: 0.6,
};

module.exports = (param) => visualRecognition.classify(param)
  .then(response => {
    const classifiedImages = response.result.images[0].classifiers;
   for(let i=0; i < classifiedImages.length; i++){
    console.log(JSON.stringify(classifiedImages[i], null, 2));
     }
   })
  .catch(err => {
    console.log('error:', err);
  });
