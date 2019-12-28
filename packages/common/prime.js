function leastFactor(n) {
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

function isPrime(n) {
    if (isNaN(n) || !isFinite(n) || n%1 || n<2) return false; 
    if (n==leastFactor(n)) return true;
    return false;
}

function factor(n){
    if (isNaN(n) || !isFinite(n) || n%1 || n==0) return n.toString();
    if (n<0) return '-'+factor(-n);
    var minFactor = leastFactor(n);
    if (n==minFactor) return n.toString();
    return minFactor+'*'+factor(n/minFactor);
}

function nextPrime(n){
    if (isNaN(n) || !isFinite(n)) return NaN; 
    if (n<2) return 2;
    n = Math.floor(n);
    for (var i=n+n%2+1; i<9007199254740992; i+=2) {
        if (isPrime(i)) return i;
    }
    return NaN;
}

function nextPrimeTwin(n) {
    if (isNaN(n) || !isFinite(n)) return NaN; 
    if (n<2) return 2;
    if (n<3) return 3;
    if (n<5) return 5;
    for (var i=6*Math.ceil(Math.floor(n+2)/6); i<9007199254740880; i+=6) {
        if (
            pscreen(i-1) && 
            pscreen(i+1) && 
            isPrime(i-1) && 
            isPrime(i+1)
        ) return i-1;
    }
    return NaN;
}

function nextPrimeQuad(n) {
    if (isNaN(n) || !isFinite(n)) return NaN; 
    if (n<11) return 11;
    for (var i=30*Math.ceil(Math.floor(n-10)/30); i<9007199254740880; i+=30) {
        if (
            pscreen(i+11) && 
            pscreen(i+13) && 
            pscreen(i+17) && 
            pscreen(i+19) && 
            isPrime(i+11) && 
            isPrime(i+13) && 
            isPrime(i+17) && 
            isPrime(i+19)
        ) return i+11;
    }
    return NaN;
}

function pscreen(n) {
    if (n<=19 || n%3 && n%5 && n%7 && n%11 && n%13 && n%17 && n%19) return true;
    return false;
}

module.exports = {
    leastFactor : leastFactor,
    isPrime : isPrime,
    factor : factor,
    nextPrime : nextPrime,
    nextPrimeTwin :nextPrimeTwin,
    nextPrimeQuad : nextPrimeQuad,
    pscreen :pscreen,
}

