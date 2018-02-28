import {ROWS, COLS, PIXEL_SIZE} from '../constants';


const BIRTH_LIMIT = 4;
const DEATH_LIMIT = 3;
const INITIAL_CHANCE = 0.35; // possibly adjust

export default class DungeonBoard {
  constructor(rows, cols, func) {
    this.board = new Array(rows).fill(null);
    for (let i = 0; i < rows; i++) {
      this.board[i] = [];
      for (let j = 0; j < cols; j++) {
        this.board[i].push(func(i, j));
      }
    }

    this.rows = rows;
    this.cols = cols;
  }

  copyDungeon() {
    const newDungeon = new DungeonBoard(this.rows, this.cols, (i, j) => {
      return this.board[i][j];
    });
  }


  static generateDungeon() {
    const initialTime = performance.now();

    const dungeon = (new DungeonBoard(ROWS, COLS, () => (Math.random() < INITIAL_CHANCE))).fixedPoint().removeInaccessibleLand().removeInteriorHoles();

    const elapsedTime = performance.now() - initialTime;
    console.log("dungeon milliseconds ellapsed: " + elapsedTime);

    return dungeon;
  }

  // automaton generation functions

  tallyNeighbors(i, j) {
    let total = 0;

    for (let I = i - 1; I <= i + 1; I++) {
      for (let J = j - 1; J <= j + 1; J++) {
        if (I < 0 || J < 0 || I == this.rows || J == this.cols)
          total++;
        else
          total += this.board[I][J];
      }
    }

    return total - this.board[i][j];
  }

  advanceStep() {
    let fixedPointQ = true;

    if (this.board2 === undefined) 
      this.board2 = (new Array(this.rows)).fill(0).map(() => (new Array(this.cols)).fill(0));

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const neighbors = this.tallyNeighbors(i, j);
        if (this.board[i][j]) {
          if (neighbors < DEATH_LIMIT) {
            this.board2[i][j] = 0;
            fixedPointQ = false;
          }
          else {
            this.board2[i][j] = this.board[i][j];
          }
        }
        else {
          if (neighbors > BIRTH_LIMIT) {
            this.board2[i][j] = 1;
            fixedPointQ = false;
          }
          else {
            this.board2[i][j] = this.board[i][j];
          }
        }
      }
    }

    [this.board, this.board2] = [this.board2, this.board];
    return fixedPointQ
  }

  fixedPoint() {
    for (let i = 0; i < 30; i++) { // max 30 steps to find fixed point.
      if (this.advanceStep()) {
        break;
      }
    }

    // "reverse" board so that 1 represents available and 0 represents unavailable
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.board[i][j] = (this.board[i][j] ? 0 : 1);
      }
    }
    // delete this.board2
    this.board2 = undefined;

    return this;
  }

  // dungeon trimming and flood fill functions

  // total points with value "color".
  totalColorPoints(color) {
    let total = 0;
    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.cols; j++)
        total += (this.board[i][j] == color ? 1 : 0);

    return total;
  }

  // returns an array of coordinates representing everything that's being flooded, as well as a total number of filled points
  // "color" represents the color we are looking to fill. If we are looking for plain ground, use 0. If we are looking for unavailable blockades, use 1.
  floodFill(startI, startJ, color) {
    // this is a list of painted coordinates
    const coordinates = [];
    // this is a queue for the algorithm
    const queue = [[startI, startJ]];
    let index = 0; // starting index of queue

    // go through the flood coordinates, tacking on new points to coordinates.
    const totalPoints = this.rows * this.cols;
    for (let protectIndex = 0; protectIndex < totalPoints; protectIndex++) {
      // if we're at the end of the array-queue, we're finished.
      if (index == queue.length)
        break;

      // if already flooded, move on.
      const I = queue[index][0], J = queue[index][1];
      if (this.board[I][J] == -1) {
        index++;
        continue;
      }

      // set initial point to be flooded
      this.board[I][J] = -1;
      coordinates.push([I, J]);

      // expand north and south, filling out nodes between north and south
      let n = I, s = I;
      while (n > 0) {
        if (this.board[n - 1][J] == color) {
          this.board[n - 1][J] = -1;
          coordinates.push([n - 1, J]);
        }
        else
          break;

        n--;
      }
      while (s < this.rows - 1) {
        if (this.board[s + 1][J] == color) {
          this.board[s + 1][J] = -1;
          coordinates.push([s + 1, J]);
        }
        else
          break;

        s++;
      }

      // add nodes to the left and right to the end of the array-queue if necessary.
      for (let i = n; i <= s; i++) {
        if (J > 0 && this.board[i][J - 1] == color) {
          queue.push([i, J - 1]);
        }
        if (J < this.cols - 1 && this.board[i][J + 1] == color) {
          queue.push([i, J + 1]);
        }
      }

      // move on to the next part of the queue
      index++;
    }

    return coordinates;
  }

  // remove either inaccessible land areas or interior holes (depending on color 1 or 0), returning a dungeon
  // color: 1 or 0. threshold: a function of land-mass size and totalColor i.e. (size, totalColor) => (size < thresholdConstant or size < totalColor / 2).
  removeColors(color, minThreshold, maxThreshold, maximumIter) {
    const oppositeColor = (color == 1 ? 0 : 1);

    let floodI = 0, floodJ = -1;

    // only iterate at a maximum number
    for (let protectIndex = 0; protectIndex < maximumIter; protectIndex++) {
      // total color spaces
      const totalColor = this.totalColorPoints(color);

      // update the starting point to flood-fill
      floodJ++;
      if (floodJ == this.cols) {
        if (floodI == this.rows - 1) {
          return this;
        }
        else {
          floodJ = 0;
          floodI++;
        }
      }

      let floodPointFound = false;
      let i = floodI, j = floodJ;
      while (i < this.rows) {
        if (j == this.cols) {
          j = 0;
          i++;
        }

        if (this.board[i][j] == color) {
          floodI = i;
          floodJ = j;
          // "break"
          floodPointFound = true;
          break;
        }

        j++;
      }
      if (!floodPointFound)
        return this;

      // flood fill
      const floodCoordinates = this.floodFill(floodI, floodJ, color);

      // if no "cut out" needed, just return the board
      if (floodCoordinates.length == totalColor) {
        return this;
      }
      // if flood is small to within the minThreshold, remove. this is the only case where we need to try another flooding.
      if (minThreshold(floodCoordinates.length, totalColor)) {
        for (let i = 0; i < floodCoordinates.length; i++) {
          this.board[floodCoordinates[i][0]][floodCoordinates[i][1]] = oppositeColor; // removal means setting to opposite color
        }
      }
      // flood is large by above a maxThreshold
      else if (maxThreshold(floodCoordinates.length, totalColor)) {
        // set opposite entire board
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            this.board[i][j] = oppositeColor;
          }
        }

        // make flood colored
        for (let i = 0; i < floodCoordinates.length; i++) {
          this.board[floodCoordinates[i][0]][floodCoordinates[i][1]] = color;
        }

        return this;
      }
    }

    return this;
  }

  healBoard(color) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.board[i][j] == -1)
          this.board[i][j] = color;
      }
    }

    return this;
  }

  removeInaccessibleLand() {
    return this.removeColors(1, (size, totalColor) => (size < totalColor / 2), (size, totalColor) => (size >= totalColor / 2), 5).healBoard(1);
  }

  removeInteriorHoles() {
    return this.removeColors(0, (size, totalColor) => (size <= 16), (size, totalColor) => false, this.rows * this.cols).healBoard(0);
  }
}
