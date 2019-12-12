
var learning_rate = 1;
var weights = [500, 400, 300, 500 , 400, 200, 100, 200, 300];
var bias = -5;
var scale = 1000
//randomize weights and bias on construction
//functions train, test, 

// aX + bY + ... + iN + c = 0
// if the length of the test data isnt the same as the weights it should do something

function test( data ){
    peceptron = 0;
    //console.log(data);
    for( i in data ){
        let td = data[i] * scale;
        peceptron = peceptron + (weights[i] * td );
        //console.log(peceptron);
    }
    peceptron = peceptron + bias;
    //console.log("bias: " + bias);
    console.log("pecp: " + peceptron);
    if(peceptron / scale> 0 ) {
        return true;
    } else {
        return false;
    }
}

function train( data ) {
    var sign;
    (test(data)) 
    ? sign = -1
    : sign = 1;
    //console.log("weights: "+ weights);
    for( i in data ){
      //  console.log("before: " + weights[i]);
      let td = data[i] * scale;  
      weights[i] = weights[i] + sign * td * learning_rate;
       // console.log("after: " + weights[i]);
    }
    //console.log("weights: "+ weights);
    bias = bias + (learning_rate * sign);
    return true;
}

function trainBulk ( dataSet ){
    dataSet.forEach(data => {
        train(data);
    });
}

function setLearningRate( new_learning_rate ){
    learning_rate = new_learning_rate;
    return true;
}

function getWeights() {
    return weights;
}


var data_set = [
    [ 2, 5, 2, 3, 4, 5, 5, 2, 2],
    [ 4, 4, 3, 3, 5, 1, 5, 5, 2],
    [ 5, 5, 5, 5, 5, 5, 5, 5, 5],
    [ 3, 1, 5, 5, 3, 1, 1, 5, 5],
    [ 5, 5, 5, 5, 5, 5, 5, 5, 5],
    [ 2, 5, 2, 3, 4, 5, 5, 2, 2],
    [ 4, 4, 3, 3, 5, 1, 5, 5, 2],
    [ 5, 5, 5, 5, 5, 5, 5, 5, 5],
    [ 3, 1, 5, 5, 3, 1, 1, 5, 5],
    [ 4, 5, 4, 5, 4, 5, 4, 5, 4]
]

var bad_set = [
    [1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
]

data_set.forEach(data => {
    console.log(test(data));
});
console.log(weights);
for(let i = 0; i < 999; i++){
    trainBulk(data_set);
}
console.log(weights);
data_set.forEach(data => {
    console.log(test(data));
});

bad_set.forEach( data => {
    console.log(test(data));
})