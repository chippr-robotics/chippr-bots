
module.exports = class blkState {
    constructor(blkStack, blockNumber, averageBlockTime, blkDiv) {
      this.blockNumber = blkStack;
      this.averageBlockTime = averageBlockTime;
      this.blkDiv = blkDiv ;
      this.blkStack = blkStack;
    }
  }

