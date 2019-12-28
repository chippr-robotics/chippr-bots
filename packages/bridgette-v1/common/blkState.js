
module.exports = class blkState {
    constructor(blkStack, blockNumber, averageBlockTime, blkDiv) {
      this.blockNumber = blockNumber;
      this.averageBlockTime = averageBlockTime;
      this.blkDiv = blkDiv ;
      this.blkStack = blkStack;
    }
}

