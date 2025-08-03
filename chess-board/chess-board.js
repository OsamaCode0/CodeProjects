function initializeChessboard() {
  const board = document.createElement("div");
  board.className = "chessboard";
  
  let selectedSquare = null;

  for (let row = 1; row <= 8; row++) {
    for (let column = 1; column <= 8; column++) {
      const square = document.createElement("div");
      square.classList.add("square");
      // FIXED: Use correct ID format
      square.id = `square-${row}-${column}`;

      const isWhite = (row + column) % 2 === 0;
      square.classList.add(isWhite ? "white" : "black");

      square.addEventListener("click", () => {
        if (selectedSquare === square) {
          selectedSquare.classList.remove("selected");
        } else {
          if (selectedSquare) {
            selectedSquare.classList.remove("selected")
          }
          square.classList.add("selected")
          selectedSquare = square
        }
      });

      board.appendChild(square);
    }
  }

  // FIXED: Add to body instead of replacing existing element
  document.body.appendChild(board);
}

// FIXED: Add event listener to run after DOM loads
document.addEventListener('DOMContentLoaded', initializeChessboard);