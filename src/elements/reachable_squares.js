
// enemy reachable squares class

export default class ReachableSquares {
  constructor(dungeon, position, radius) {
    const initialTime = performance.now();

    this.dungeon = dungeon;
    this.centralPositionString = position[0] + " " + position[1];
    this.radius = radius;

    this.bulkSquares = new Set();
    this.recentSquares = new Set([this.centralPositionString]);

    const coordinateIncrementArray = [[-1, 0], [0, 1], [1, 0], [0, -1], [-1, 1], [1, 1], [1, -1], [-1, -1]];
    for (let k = 0; k <= radius; k++) {
      this.newRecentSquares = new Set();

      this.recentSquares.forEach((positionString) => {
        // set up position
        const position = positionString.split(" ");
        const i = parseInt(position[0], 10), j = parseInt(position[1], 10);

        // we need to check up on N-E-S-W, then check diagonal directions NE-SE-SW-NW.
        const directionApproval = [false, false, false, false];
        for (let a = 0; a < 8; a++) {
          if (a >= 4)
            if (!(directionApproval[a - 4] || directionApproval[(a - 3) % 4]))
              continue;

          const I = i + coordinateIncrementArray[a][0], J = j + coordinateIncrementArray[a][1];
          if (!(dungeon.board[I] && dungeon.board[I][J])) { // if dungeon.board[I][J] not both defined and 1, then continue
            continue;
          }
          else {
            if (a < 4)
              directionApproval[a] = true; // we CAN move either N, E, S, or W, so approve the direction
          }

          const newPositionString = I + " " + J;
          if (!(this.bulkSquares.has(newPositionString))) { // if this square hasn't been seen in the bulk squares, add it to newRecentSquares
            this.newRecentSquares.add(newPositionString); // this will only add to newRecentSquares if it is a unique value
          }
        }
      });

      this.recentSquares.forEach(this.bulkSquares.add, this.bulkSquares);
      this.recentSquares = this.newRecentSquares;
    }

    this.recentSquares.forEach(this.bulkSquares.add, this.bulkSquares);
    this.radiusSquares = this.bulkSquares;

    // end of constructor
    // this.largeRadiusSquares contains the necessary data.


    const elapsedTime = performance.now() - initialTime;
    console.log("enemy milliseconds ellapsed: " + elapsedTime);
  }
}

