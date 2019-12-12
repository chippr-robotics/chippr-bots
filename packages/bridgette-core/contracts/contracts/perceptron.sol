pragma solidity >=0.4.22 <0.6.0;

contract perceptron{
    
    //global vars
    int public learning_rate =  1;
    int[9] public weights = [500, 400, 300, 500, 400, 200, 100, 200, 300];
    int public bias = -2900;
    int scale = 100;
  
//randomize weights and bias on construction
//functions train, test, 

// aX + bY + ... + iN + c = 0
// if the length of the test data isnt the same as the weights it should do something


    function test( int[9] memory data ) public view returns (bool){
        int pValue = 0;
        for( uint i = 0; i < data.length; i++ ){
            pValue = pValue + weights[i] * data[i] ;
        }
        pValue = pValue + bias;
        if(pValue  > 0 ) {
            return true;
        } else {
            return false;
        }
    }

    function train( int[9] memory data ) public returns( bool ){
        int sign;
        (test(data)) 
        ? sign = -1
        : sign = 1;
        for( uint i = 0; i < data.length; i++ ){
            weights[i] = weights[i] + (sign * data[i] * learning_rate);
        }
        bias = bias + (learning_rate * sign);
        return true;
}

    function setLearningRate( int new_learning_rate )public returns(bool){
        learning_rate = new_learning_rate;
        return true;
    }

    function setWeights( int[9] memory _weights) public returns(bool){
        weights = _weights;
        return true;
    }

}