const { World, Bodies } = require('matter-js');

function createNewPlayer(world, position) {
  const newPlayerBody = Bodies.rectangle(position.x, position.y, 40, 40);

  World.add(world, newPlayerBody);
  return newPlayerBody;
}

module.exports = {
  createNewPlayer,
}