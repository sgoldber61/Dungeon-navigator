import {Rect} from 'react-konva';
import React from 'react';
import {PIXEL_SIZE} from '../constants';

export default class EnemySquare extends React.Component {
  // props: position, updateQ
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate() {
    return this.props.updateQ;
  }

  render() {
    console.log("creating enemy rectangle...");

    return (
      <Rect
        x={this.props.position[1] * PIXEL_SIZE}
        y={this.props.position[0] * PIXEL_SIZE}
        width={PIXEL_SIZE}
        height={PIXEL_SIZE}
        fill={"red"}
        >
      </Rect>
    );
  }
}

