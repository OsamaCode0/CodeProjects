function initializeChessboard() {
  const board = document.getElementById("chessboard");
  let selectedSquare = null;

  for (let row = 1; row <= 8; row++) {
    for (let column = 1; column <= 8; column++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.id = `r${row}-c${column}`;

      const isWhite = (row + column) % 2 === 0;
      square.classList.add(isWhite ? "white" : "black");

      square.addEventListener("click", () => {
        if (selectedSquare) {
          selectedSquare.classList.remove("selected");
        }
        square.classList.add("selected");
        selectedSquare = square;
      });

      board.appendChild(square);
    }
  }
}

initializeChessboard();
