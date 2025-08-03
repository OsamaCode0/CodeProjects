function initializeChessboard() {
  const board = document.createElement("div");
  board.className = "chessboard";
  
  let selectedSquare = null;

  for (let row = 1; row <= 8; row++) {
    for (let column = 1; column <= 8; column++) {
      const square = document.createElement("div");
      square.className = "square";
      square.id = `square-${row}-${column}`;

      // CHANGED: Use inline style instead of class
      const isWhite = (row + column) % 2 === 0;
      square.style.backgroundColor = isWhite ? 'white' : 'black';

      square.addEventListener("click", () => {
        if (selectedSquare === square) {
          // CHANGED: Revert to original color using style
          const [r, c] = square.id.split('-').slice(1).map(Number);
          square.style.backgroundColor = (r + c) % 2 === 0 ? 'white' : 'black';
          selectedSquare = null;
        } else {
          if (selectedSquare) {
            // CHANGED: Revert previous selection using style
            const [r, c] = selectedSquare.id.split('-').slice(1).map(Number);
            selectedSquare.style.backgroundColor = (r + c) % 2 === 0 ? 'white' : 'black';
          }
          square.style.backgroundColor = 'red';
          selectedSquare = square;
        }
      });

      board.appendChild(square);
    }
  }

  document.body.appendChild(board);
}

document.addEventListener('DOMContentLoaded', initializeChessboard);