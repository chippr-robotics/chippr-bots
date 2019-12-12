// calls an external api defined in the env var TICKERPRICE with a ticker symbol

const axios = require('axios');
const { log, qr } = require('../lib');

async function getInvoice( payload ) {
    console.log(process.env.BS_SAT_API + `/order?bid=${payload.length * 1000}&message=${payload}`)
    let res = await axios.post( process.env.BS_SAT_API + `/order?bid=${payload.length * 1000}&message=${payload}`);
    log.debug('[dflow/controllers/blockstreamSat.js] getInvoice');
    log.debug(res.data.lightning_invoice);
    return res.data;
}

async function getResponse( ticker ){
    //get the balance
    var responses = [
        `The latest price for ${ticker.data.name} is ${formatter.format(ticker.data.market_data.price_usd)}`,
        `${formatter.format(ticker.data.market_data.price_usd)}`,
        `${ticker.data.name} is ${(ticker.data.market_data.percent_change_usd_last_24_hours > 0)? "up":"down"} ${parseFloat(ticker.data.market_data.percent_change_usd_last_24_hours).toFixed(2)+"%"} since yesterday. The current price is ${formatter.format(ticker.data.market_data.price_usd)}` 
    ]
    log.debug('[dflow/controllers/getPrice.js] possible responses: ' + responses); 
    return responses[Math.floor(Math.random() * responses.length)]; 
}


module.exports = async ( payload ) => {
    
    log.debug('calls getInvoice: '+ payload);
    let ticket = await getInvoice( payload );
    //make a qrcode image
    log.debug('[dflow/controllers/blockstreamSat.js] send qr(): ');
    log.debug(ticket);
    let qr_img = qr(ticket.lightning_invoice.payreq);
    return(
        {
            message : `Ok, Scanning this will send the following message: ${payload}`,
            payReq : ticket.lightning_invoice.payreq,
            qr_image: qr_img
        }
    )
}