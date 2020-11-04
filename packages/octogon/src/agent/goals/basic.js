//basic agent that only wants to move to the top right 

class Agent {
    //init
    constructor(playerBodyId){
        this.playerBodyId = playerBodyId;
        this.lifeSpan = Math.random() * 100;
        this.age = 0;
        this.isAlive = true;
        this.score = 0;
    }
    
    //
    update(xPos, yPos){
        this.score = xPos - yPos;
        this.age = this.age + 1;
        (this.age > this.lifeSpan) ? this.isAlive = false : this.isAlive = true;
    }

}

module.exports = Agent;