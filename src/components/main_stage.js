import {Stage, Layer, Rect} from 'react-konva';
import Konva from 'konva';
import DungeonBoard from '../elements/dungeon_board';
import AStarCalculator from '../elements/a_star_calculator';
import GameElements from '../elements/game_elements';
import PlayerSquare from './player_square';
import ItemSquares from './item_squares';
import NewFloorSquare from './new_floor_square';
import EnemySquares from './enemy_squares';
import {PIXEL_SIZE} from '../constants';
import React from 'react';

const DISPLAY_ENEMY_ZONES = false;


export default class MainStage extends React.Component {
  // props functions: updatePlayerStats, contactEnemy, moveUpFloor
  // props number: floor
  constructor(props) {
    super(props);

    const dungeon = DungeonBoard.generateDungeon();

    // GameElements contains raw data info for the player, items, and enemies.
    const gameElements = new GameElements(dungeon);

    // AStar helper factory
    this.aStarFactory = new AStarCalculator(dungeon);

    this.layerRefCallback = this.layerRefCallback.bind(this);
    this.movePlayer = this.movePlayer.bind(this);

    this.state = {dungeon: dungeon, player: gameElements.player, items: gameElements.items, newFloor: gameElements.newFloor, enemies: gameElements.enemies, updateItemsQ: true, updateEnemiesQ: true, updateStageQ: true};
  }

  layerRefCallback(layer) {
    // upon unoumnt
    if (layer === null)
      return;

    // add dungeon map squares directly to Konva
    for (let i = 0; i < this.state.dungeon.rows; i++) {
      for (let j = 0; j < this.state.dungeon.cols; j++) {
        const rect = new Konva.Rect({
          x: j * PIXEL_SIZE,
          y: i * PIXEL_SIZE,
          width: PIXEL_SIZE,
          height: PIXEL_SIZE,
          fill: (this.state.dungeon.board[i][j] ? "darkblue" : "black")
        });

        layer.add(rect);
      }
    }

    // add enemy region squares directly to Konva
    if (DISPLAY_ENEMY_ZONES) {
      const enemyRegions = [];

      this.state.enemies.properties.forEach((value, key) => { // key: centralPositionString, value: radiusSquares set
        enemyRegions.push({centralPositionString: key, neighborPositions: []});

        value.radiusSquares.forEach((positionString) => {
          enemyRegions[enemyRegions.length - 1].neighborPositions.push(positionString);
        });
      });

      enemyRegions.forEach((enemyAreaData) => {
        enemyAreaData.neighborPositions.forEach((positionString) => {
          const position = positionString.split(" ").map((numString) => parseInt(numString, 10));

          console.log("enemy zone created");

          const rect = new Konva.Rect({
            x: position[1] * PIXEL_SIZE,
            y: position[0] * PIXEL_SIZE,
            width: PIXEL_SIZE,
            height: PIXEL_SIZE,
            fill: "orange"
          });

          layer.add(rect);
        });

      });
    }
  }

  componentDidMount() {
    // player movement
    window.addEventListener('keydown', this.movePlayer);

    // enemy movement
    this.timerID = setInterval(this.moveEnemies.bind(this), 1000);
  }

  componentWillUnmount() {
    // get rid of event listener
    window.removeEventListener('keydown', this.movePlayer);

    // get rid of enemy movement
    clearInterval(this.timerID);
  }

  movePlayer(event) {
    console.log("key pressed");

    let deltaI = 0, deltaJ = 0;

    switch (event.keyCode)
        {
      case 37: // left arrow
        deltaJ = -1;
        break;
      case 39: // right arrow
        deltaJ = 1;
        break;
      case 38: // up arrow
        deltaI = -1;
        break;
      case 40: // down arrow
        deltaI = 1;
        break;
      default:
        return; // don't do anything
    }

    const oldI = this.state.player.position[0];
    const oldJ = this.state.player.position[1];
    const newI = this.state.player.position[0] + deltaI;
    const newJ = this.state.player.position[1] + deltaJ;

    const row = this.state.dungeon.board[newI];
    if (row && row[newJ]) { // if the position is available, move to it
      // check for changes involving enemies. either entering or leaving an enemy territory will activate/deactivate enemies
      const newPoint = this.state.enemies.dungeon.board[newI][newJ];
      const newPointValue = ((typeof newPoint == "object") ? newPoint.square : newPoint);
      const oldPoint = this.state.enemies.dungeon.board[oldI][oldJ];
      const oldPointValue = ((typeof oldPoint == "object") ? oldPoint.square : oldPoint);

      console.log(newPoint);
      console.log(newPointValue);

      if (newPointValue != oldPointValue) {
        // if we bump into an enemy, disallow moving into the enemy
        if (newPointValue == 2) {
          this.setState({updateItemsQ: false, updateEnemiesQ: false});
        }
        // if we enter an enemy territory, activate the enemy to set sights on player
        else if (newPointValue == 1) {
          const centralPositionString = newPoint.centralPositionString;
          this.state.enemies.activeEnemies.set(centralPositionString, {enemyData: this.state.enemies.properties.get(centralPositionString), playerQ: true});

          this.state.player.position[0] = newI;
          this.state.player.position[1] = newJ;
          this.setState({player: this.state.player, updateItemsQ: false, updateEnemiesQ: false});
        }
        // if we leave an enemy territory, set the enemy to return back to its central position
        else {
          const centralPositionString = oldPoint.centralPositionString;
          this.state.enemies.activeEnemies.set(centralPositionString, {enemyData: this.state.enemies.properties.get(centralPositionString), playerQ: false});

          this.state.player.position[0] = newI;
          this.state.player.position[1] = newJ;
          this.setState({player: this.state.player, updateItemsQ: false, updateEnemiesQ: false});
        }
      }
      // check for item
      else if (this.state.items.dungeon.board[newI][newJ]) {
        const itemData = this.state.items.properties.get(newI + " " + newJ);

        // do stuff depending on itemData.
        this.props.updatePlayerStats(itemData);

        this.state.items.dungeon.board[newI][newJ] = 0;
        this.state.items.properties.delete(newI + " " + newJ);

        this.state.player.position[0] = newI;
        this.state.player.position[1] = newJ;
        this.setState({player: this.state.player, items: this.state.items, updateItemsQ: true, updateEnemiesQ: false});
      }
      // check for newFloor
      else if ((this.state.newFloor.position[0] == newI) && (this.state.newFloor.position[1] == newJ)) {
        this.props.moveUpFloor();
      }
      // no items, no enemy interactions or territory changes
      else {
        this.state.player.position[0] = newI;
        this.state.player.position[1] = newJ;
        this.setState({player: this.state.player, updateItemsQ: false, updateEnemiesQ: false});
      }
    }
  }
  
  // move enemies functions
  
  // helper function to advance enemy
  advanceEnemy(coord0, coord1, centralPosition) {
    // adjust 2d dungeon array
    this.state.enemies.dungeon.board[coord0[0]][coord0[1]] = 1;
    this.state.enemies.dungeon.board[coord1[0]][coord1[1]] = 2;

    // adjust current position in enemy data
    const centralPositionString = centralPosition[0] + " " + centralPosition[1];
    const enemyData = this.state.enemies.properties.get(centralPositionString);
    enemyData.currentPosition[0] = coord1[0];
    enemyData.currentPosition[1] = coord1[1];
  }

  moveEnemies() {
    let enemyMovedQ = false;

    this.state.enemies.activeEnemies.forEach((value, key, hashMap) => {
      let path;
      if (value.playerQ) { // if player is on stage, generate a path
        console.log(JSON.stringify(value.enemyData.currentPosition));
        console.log(JSON.stringify(this.state.player.position));

        path = this.aStarFactory.calculatePath(value.enemyData.currentPosition, this.state.player.position);
      }

      if (path && path.length <= 8) { // move forwards to player
        value.pathBackwards = undefined;

        // if player is one step away, do damage!
        if (path.length == 2) {
          const contactResults = this.props.contactEnemy(value.enemyData.enemyProperty);
          // enemydefeatedQ, playerDeathQ

          if (contactResults.playerDeathQ) {
            this.props.playerDefeated();
          }

          if (contactResults.enemyDefeatedQ) {
            value.enemyData.radiusSquares.forEach((positionString) => {
              const position = positionString.split(" ").map((char) => parseInt(char, 10));
              this.state.enemies.dungeon.board[position[0]][position[1]] = 0;
            });

            this.state.enemies.properties.delete(value.enemyData.centralPosition[0] + " " + value.enemyData.centralPosition[1]);

            hashMap.delete(key);

            enemyMovedQ = true;
          }
        }
        // otherwise, move towards the player
        else {
          console.log(JSON.stringify(path[0]) + " " + JSON.stringify(path[1]));
          this.advanceEnemy(path[0], path[1], value.enemyData.centralPosition);
          enemyMovedQ = true;
        }
      }
      else { // move backwards to centralPosition
        console.log("moving backwards");
        if ((value.enemyData.centralPosition[0] == value.enemyData.currentPosition[0]) && (value.enemyData.centralPosition[1] == value.enemyData.currentPosition[1])) {
          if (!(value.playerQ)) {
            hashMap.delete(key);
          }
          else {
            value.pathBackwards = undefined;
          }
        }
        else {
          if (!(value.pathBackwards)) {
            value.pathBackwards = this.aStarFactory.calculatePath(value.enemyData.currentPosition, value.enemyData.centralPosition);
          }

          console.log(JSON.stringify(value.pathBackwards[0]) + " " + JSON.stringify(value.pathBackwards[1]));
          this.advanceEnemy(value.pathBackwards[0], value.pathBackwards[1], value.enemyData.centralPosition);
          value.pathBackwards.shift();
          enemyMovedQ = true;
        }
      }
    });

    if (enemyMovedQ) {
      this.setState({enemies: this.state.enemies, updateItemsQ: false, updateEnemiesQ: true});
    }
  }

  render() {
    // ItemSquares, EnemySquares, and PlayerSquare are all Layers.
    return (
      <Stage height={this.state.dungeon.rows * PIXEL_SIZE} width={this.state.dungeon.cols * PIXEL_SIZE} key={this.props.floor}>
        <Layer ref={this.layerRefCallback} />
        <PlayerSquare player={this.state.player} />
        <ItemSquares itemProperties={this.state.items.properties} updateItemsQ={this.state.updateItemsQ} />
        <NewFloorSquare newFloor={this.state.newFloor} />
        <EnemySquares enemyProperties={this.state.enemies.properties} updateEnemiesQ={this.state.updateEnemiesQ} activeEnemies={this.state.enemies.activeEnemies} />
      </Stage>
    );
  }
}

