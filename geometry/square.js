


import { Rectangle } from '../rectangle';

class Square extends Rectangle {
  constructor(side) {
    super(side, side)
    this.side = side
  }
}

const newSquare = new Square(4)

export default { Square, square }