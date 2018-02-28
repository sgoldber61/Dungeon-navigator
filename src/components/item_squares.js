import {Layer, Rect} from 'react-konva';
import React from 'react';
import {PIXEL_SIZE} from '../constants';

export default class ItemSquares extends React.Component {
  // props: itemProperties -> key-value pairs, with keys for the position and values for the item properties
  // props: updateItemsQ
  constructor(props) {
    super(props);

    this.rectangles = this.generateRectangles(props);
  }

  generateRectangles(newProps) {
    const itemPositionsColors = [];

    newProps.itemProperties.forEach((value, key) => {
      itemPositionsColors.push({position: key.split(" ").map((numString) => parseInt(numString, 10)), type: value.type});
    });

    return itemPositionsColors.map((data) => {
      console.log("item rectangle created");

      return (
        <Rect
          x={data.position[1] * PIXEL_SIZE}
          y={data.position[0] * PIXEL_SIZE}
          width={PIXEL_SIZE}
          height={PIXEL_SIZE}
          fill={data.type == "health" ? "green" : "purple"}
          key={data.position}
          >
        </Rect>
      );
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.updateItemsQ; // if updateItemsQ is true, then update
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
