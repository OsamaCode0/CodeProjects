// chess-board.js
function initializeChessboard() {
    const chessboard = document.querySelector('.chessboard');
    let previouslyClickedSquare = null;

    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${row}-${col}`;

            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }

            square.addEventListener('click', () => {
                if (previouslyClickedSquare) {
                    previouslyClickedSquare.classList.remove('red');
                }

                if (previouslyClickedSquare === square) {
                    previouslyClickedSquare = null;
                } else {
                    square.classList.add('red');
                    previouslyClickedSquare = square;
                }
            });

            chessboard.appendChild(square);
        }
    }
}

document.addEventListener('DOMContentLoaded', initializeChessboard);