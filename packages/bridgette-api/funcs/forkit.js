const { log } = require('@chippr-bots/common');
log.info('[dflow/controllers/forkit.js] forkit loaded');

Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};



//provide a random response

function getResponse(year, month, day, bn, blkTime, blkTimeV){
    var t1 = new Date();
    var t2 = new Date(year, month-1, day, 14, 0, 0, 0);
    var dif = t2.getTime() - t1.getTime();
    if(dif < 0){
      return "I need a future date for this trick....";
    };
    console.log(t1); 
    console.log(t2);
    console.log(dif);
    var Seconds_from_T1_to_T2 = dif / 1000;
    var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
    log.info('[dflow/controllers/forkit.js] inputs:'+ year + " " + month +" "+ day)
    log.info('[dflow/controllers/forkit.js] seconds: ' + Seconds_Between_Dates);

    var FAST_BLOCK = Math.floor(bn + (Seconds_Between_Dates / (blkTime - blkTimeV))); // fast blocks mean the number will be higher on that date
    var POINT_BLOCK = Math.floor(bn + (Seconds_Between_Dates / blkTime)); // point is if blocks are on average time
    var SLOW_BLOCK = Math.floor(bn + (Seconds_Between_Dates / (blkTime + blkTimeV))); // slow blocks mean the number will be lower on the day

    var PRIME = nextPrime(POINT_BLOCK);

    var BLOCKRANGE = FAST_BLOCK-SLOW_BLOCK;
    var TWIN_PRIME = nextPrimeTwin(PRIME != NaN) ? "   Twin Prime near mean block: "  + nextPrimeTwin(PRIME) + "\n" : "" ;
    var QUAD_PRIME = nextPrimeQuad(PRIME != NaN) ? "   A Quad Prime near that range: "  + nextPrimeQuad(SLOW_BLOCK) + "\n" : "" ;
    var BIGRANGE = BLOCKRANGE > 24*60*60/blkTime  ? "Warning! This range is larger than one human day, Try back later when the range will be tighter. \n": "";

    var responses =  "\`\`\` \n" +
        " Based on the last 50,000 blocks: \n" +
        " \n "+
        "                   " + bn + "\n "+
        "             Current Block Height \n"+ 
        "      " + blkTime.toFixedDown(3) + "                       " + blkTimeV.toFixedDown(3) + "\n" +
        " Average BlockTime               Std. Div \n" +
        "                     " + BLOCKRANGE + "\n"+
        "                  Block range \n" +
        "   \n" +
        "                  Mean Block \n" +
        "                   " + POINT_BLOCK + "\n" +
        "                      | \n" +
        "   |-----------------------------------------|" + "\n" +
        "   |                                         |" + "\n" +
        " "+SLOW_BLOCK+"                                " + FAST_BLOCK + "\n" +
        "Low Block number                     High Block \n" +
        " (1 stdv dwn)                       (1 stdv up) \n" +
        "   \n" +
        "   Prime number near mean block: " + PRIME + "\n" +
        TWIN_PRIME + QUAD_PRIME + BIGRANGE +
        " \`\`\`"
    

    log.debug('[dflow/controllers/forkit.js] possible responses: ' + responses);
    return responses;
}

module.exports = (channelID, year, month, day, bn, blkTime, blkTimeV) =>{
    return {
      to: channelID,
      message: getResponse(year, month, day, bn, blkTime, blkTimeV)
    };
};



// Copyright (c) 2011 Alexei Kourbatov, www.JavaScripter.net

// function leastFactor(n) returns:
// * the smallest prime that divides n
// * NaN if n is NaN or Infinity
// *  0  if n is 0
// *  1  if n=1, n=-1, or n is not an integer

leastFactor = function(n) {
 if (isNaN(n) || !isFinite(n)) return NaN;  
 if (n==0) return 0;  
 if (n%1 || n*n<2) return 1;
 if (n%2==0) return 2;  
 if (n%3==0) return 3;  
 if (n%5==0) return 5;  
 var m = Math.sqrt(n);
 for (var i=7;i<=m;i+=30) {
  if (n%i==0)      return i;
  if (n%(i+4)==0)  return i+4;
  if (n%(i+6)==0)  return i+6;
  if (n%(i+10)==0) return i+10;
  if (n%(i+12)==0) return i+12;
  if (n%(i+16)==0) return i+16;
  if (n%(i+22)==0) return i+22;
  if (n%(i+24)==0) return i+24;
 }
 return n;
}

// Optimized version of leastFactor for Opera, Chrome, Firefox.
// In these browsers, "i divides n" is much faster as
// (q=n/i)==Math.floor(q)  than  n%i==0
leastFactor = function(n) {
  if (isNaN(n) || !isFinite(n)) return NaN;   
  if (n==0) return 0;  
  if (n%1 || n*n<2) return 1;
  if (n%2==0) return 2;  
  if (n%3==0) return 3;  
  if (n%5==0) return 5;  
  var q, m = Math.sqrt(n);
  for (var i=7;i<=m;i+=30) {
   if ((q=n/i)==Math.floor(q))      return i;
   if ((q=n/(i+4))==Math.floor(q))  return i+4;
   if ((q=n/(i+6))==Math.floor(q))  return i+6;
   if ((q=n/(i+10))==Math.floor(q)) return i+10;
   if ((q=n/(i+12))==Math.floor(q)) return i+12;
   if ((q=n/(i+16))==Math.floor(q)) return i+16;
   if ((q=n/(i+22))==Math.floor(q)) return i+22;
   if ((q=n/(i+24))==Math.floor(q)) return i+24;
  }
  return n;
 }



// function isPrime(n) returns:
// - false if n is NaN or not a finite integer
// - true  if n is prime
// - false otherwise

isPrime = function(n) {
 if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
 if (n==leastFactor(n)) return true;
 return false;
}

// function factor(n) returns:
// * a string containing the prime factorization of n
// * n.toString() if the factrization cannot be found

function factor(n){
 if (isNaN(n) || !isFinite(n) || n%1 || n==0) return n.toString();
 if (n<0) return '-'+factor(-n);
 var minFactor = leastFactor(n);
 if (n==minFactor) return n.toString();
 return minFactor+'*'+factor(n/minFactor);
}

// function nextPrime(n) returns:
// * the smallest prime greater than n
// * NaN if this prime is not a representable integer

function nextPrime(n){
 if (isNaN(n) || !isFinite(n)) return NaN; 
 if (n<2) return 2;
 n = Math.floor(n);
 for (var i=n+n%2+1; i<9007199254740992; i+=2) {
  if (isPrime(i)) return i;
 }
 return NaN;
}

// function nextPrimeTwin(n) returns:
// * 2 if n<2 or
// * 3 if n<3 or
// * 5 if n<5 or
// * the smallest twin prime 6i-1 greater than n, for an integer i
// * NaN if such a prime is not a representable integer

function nextPrimeTwin(n) {
 if (isNaN(n) || !isFinite(n)) return NaN; 
 if (n<2) return 2;
 if (n<3) return 3;
 if (n<5) return 5;
 for (var i=6*Math.ceil(Math.floor(n+2)/6); i<9007199254740880; i+=6) {
  if (pscreen(i-1) && pscreen(i+1) && isPrime(i-1) && isPrime(i+1))
    return i-1;
 }
 return NaN;
}

// function nextPrimeQuad(n) returns:
// * the smallest prime in the next prime quadruplet greater than n
// * NaN if such a prime is not a representable integer

function nextPrimeQuad(n) {
 if (isNaN(n) || !isFinite(n)) return NaN; 
 if (n<11) return 11;
 for (var i=30*Math.ceil(Math.floor(n-10)/30); i<9007199254740880; i+=30) {
  if (pscreen(i+11) && pscreen(i+13) && pscreen(i+17) && pscreen(i+19)
   && isPrime(i+11) && isPrime(i+13) && isPrime(i+17) && isPrime(i+19))
    return i+11;
 }
 return NaN;
}

function pscreen(n) {
 if (n<=19 || n%3 && n%5 && n%7 && n%11 && n%13 && n%17 && n%19) return true;
 return false;
}
