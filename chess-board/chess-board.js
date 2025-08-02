function initializeChessboard() {
  const chessboard = document.createElement('div');
  chessboard.classList.add('chessboard');
  document.body.appendChild(chessboard);

  let selectedSquare = null;

  for (let row = 1; row <= 8; row++) {
    for (let col = 1; col <= 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.id = `square-${row}-${col}`;

      const isWhite = (row + col) % 2 === 0;
      square.classList.add(isWhite ? 'white' : 'black');

      square.addEventListener('click', () => {
        if (selectedSquare) {
          selectedSquare.classList.remove('selected');
        }
        square.classList.add('selected');
        selectedSquare = square;
      });

      chessboard.appendChild(square);
    }
  }
}

initializeChessboard();
