import DungeonBoard from './dungeon_board';
import ReachableSquares from './reachable_squares';
import EnemyProperty from './enemy_property';
import ItemProperty from './item_property';
import _ from 'underscore';

// enemy and enemy reachable squares

export default class GameElements {
  // this class is designed to construct:
  // enemies, enemies.dungeon, and enemies.properties
  // items, items.dungeon, and items.properties
  constructor(dungeon) {
    // set up available squares
    const availableSquares = new Set();
    for (let i = 0; i < dungeon.rows; i++) {
      for (let j = 0; j < dungeon.cols; j++) {
        if (dungeon.board[i][j]) {
          availableSquares.add(i + " " + j);
        }
      }
    }

    // one by one, take a square out from random from the available squares and create an enemy
    this.enemies = {};
    this.enemies.dungeon = new DungeonBoard(dungeon.rows, dungeon.cols, () => 0);
    this.enemies.properties = new Map();

    const availableDungeonBoard = [];
    dungeon.board.forEach((row) => {availableDungeonBoard.push(row.slice());});

    for (let i = 0; i < 20; i++) { // number of enemies
      // generate an enemy position

      // SET -> ARRAY
      const availableSquaresArray = Array.from(availableSquares);
      const enemyPositionString = availableSquaresArray[Math.floor(availableSquaresArray.length * Math.random())];
      const enemyPosition = enemyPositionString.split(" ").map((char) => parseInt(char, 10));

      // generate an enemy's radius squares set
      const radiusSquares = (new ReachableSquares(dungeon, enemyPosition, 10)).radiusSquares;
      this.enemies.properties.set(enemyPositionString, {radiusSquares: radiusSquares, centralPosition: enemyPosition, currentPosition: enemyPosition.slice(), enemyProperty: new EnemyProperty()});
      // set enemies.dungeon appearance
      radiusSquares.forEach((coordinateString) => {
        const coordinate = coordinateString.split(" ").map((char) => parseInt(char, 10));
        this.enemies.dungeon.board[coordinate[0]][coordinate[1]] = {square: 1, centralPositionString: enemyPositionString};
        availableDungeonBoard[coordinate[0]][coordinate[1]] = 0;
      });
      this.enemies.dungeon.board[enemyPosition[0]][enemyPosition[1]].square = 2;

      // remove available squares, overestimating the range of influence of an enemy.
      for (let i = enemyPosition[0] - 23; i <= enemyPosition[0] + 23; i++) {
        for (let j = enemyPosition[1] - 23; j <= enemyPosition[1] + 23; j++) {
          availableSquares.delete(i + " " + j);
        }
      }
    }
    
    console.log("enemies dungeon board: " + JSON.stringify(this.enemies.dungeon.board));

    // hashmap of enemy central position string keys and other values that represent states and actions of currently active enemies
    this.enemies.activeEnemies = new Map();

    // define both the items and the player
    // set up remaining available squares as an array
    const remainingAvailableSquares = [];
    availableDungeonBoard.forEach((row, indexI) => {
      row.forEach((element, indexJ) => {
        if (element == 1)
          remainingAvailableSquares.push([indexI, indexJ]);
      });
    });

    // take a random sample, in order to generate items
    const itemCount = 20;
    const squaresSample = _.sample(remainingAvailableSquares, itemCount + 2);

    // player and items.
    this.player = {};
    this.player.position = squaresSample[0];

    this.newFloor = {};
    this.newFloor.position = squaresSample[1];

    const itemPositions = squaresSample.slice(2, itemCount + 2);

    this.items = {};
    this.items.dungeon = new DungeonBoard(dungeon.rows, dungeon.cols, () => 0);
    itemPositions.forEach((position) => {this.items.dungeon.board[position[0]][position[1]] = 1});

    this.items.properties = new Map();
    itemPositions.forEach((position) => {
      const key = position[0] + " " + position[1];
      this.items.properties.set(key, new ItemProperty());
    });
  }
}

