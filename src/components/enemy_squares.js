import {Layer} from 'react-konva';
import React from 'react';
import EnemySquare from './enemy_square';


export default class EnemySquares extends React.Component {
  // props: enemyProperties -> key-value pairs, just use the keys for the position
  // props: updateEnemiesQ
  // props: activeEnemies

  constructor(props) {
    super(props);
    this.rectangles = this.generateRectangles(props);
  }

  generateRectangles(newProps) {
    const enemyPositions = [];

    newProps.enemyProperties.forEach((value, key) => { // key: centralPositionString, value: includes currentPosition
      enemyPositions.push({position: value.currentPosition, updateQ: (newProps.activeEnemies.has(key) ? true : false)});
    });

    return enemyPositions.map((data) => {
      return (
        <EnemySquare position={data.position} updateQ={data.updateQ} key={data.position} />
      );
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.updateEnemiesQ;
  }

  componentWillUpdate(nextProps, nextState) {
    this.rectangles = this.generateRectangles(nextProps);
  }

  render() {
    return (
      <Layer>
        {this.rectangles}
      </Layer>
    );
  }
}

