
module.exports = class blkState {
    constructor(fate, blkStack, blockNumber, averageBlockTime, blkDiv) {
      this.blockNumber = blockNumber;
      this.averageBlockTime = averageBlockTime;
      this.blkDiv = blkDiv ;
      this.blkStack = blkStack;
      this.fate = fate;
    }
}

