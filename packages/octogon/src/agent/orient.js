

//export
module.exports = (world, agent) => {
    let index = agent.playerBodyId - 1;
    
    world.actionList = ['w','s','a','d',' '];
    console.log(world.bodies[index].position)
    agent.update(world.bodies[index].position.x,world.bodies[index].position.y);
    console.log(agent)
    return world;
}

