

class EnemyProperty {
  constructor() {
    // random index: dictates what kind of enemy
    let index;
    const random = Math.random();
    if (random < 0.5)
      index = 0;
    else if (random < 0.75)
      index = 1;
    else if (random < 0.9)
      index = 2;
    else
      index = 3;

    Object.assign(this, EnemyProperty.enemyData[index]);
  }
}

EnemyProperty.enemyData = [["Basic Enemy", 300, 10, 8000], ["Standard Enemy", 450, 15, 12000], ["Advanced Enemy", 600, 20, 17000], ["Expert Enemy", 750, 25, 23000]].map((dataArray) => {return {name: dataArray[0], health: dataArray[1], attack: dataArray[2], experience: dataArray[3]};});

export default EnemyProperty;

