import {Layer, Rect} from 'react-konva';
import React from 'react';
import {PIXEL_SIZE} from '../constants';

const PlayerSquare = (props) => {
  // props: player -> position as an array

  return (
    <Layer>
      <Rect
        x={props.player.position[1] * PIXEL_SIZE}
        y={props.player.position[0] * PIXEL_SIZE}
        width={PIXEL_SIZE}
        height={PIXEL_SIZE}
        fill={"yellow"}
        >
      </Rect>
    </Layer>
  );
}

export default PlayerSquare;
