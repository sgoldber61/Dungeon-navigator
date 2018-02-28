import {Layer, Rect} from 'react-konva';
import React from 'react';
import {PIXEL_SIZE} from '../constants';

export default class NewFloorSquare extends React.Component {
  // props: newFloor -> position as an array
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <Layer>
        <Rect
          x={this.props.newFloor.position[1] * PIXEL_SIZE}
          y={this.props.newFloor.position[0] * PIXEL_SIZE}
          width={PIXEL_SIZE}
          height={PIXEL_SIZE}
          fill={"gray"}
          >
        </Rect>
      </Layer>
    );
  }
}
