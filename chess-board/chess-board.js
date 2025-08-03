// Delete any existing chessboard first
document.querySelector('.chessboard')?.remove();

// Create fresh chessboard
const chessboard = document.createElement('div');
chessboard.className = 'chessboard';

// Build chessboard
for (let i = 1; i <= 8; i++) {
  for (let j = 1; j <= 8; j++) {
    const square = document.createElement('div');
    square.className = 'square';
    square.id = `square-${i}-${j}`;
    square.style.backgroundColor = (i + j) % 2 ? 'black' : 'white';
    
    square.onclick = function() {
      document.querySelector('.selected')?.classList.remove('selected');
      this.classList.add('selected');
    };
    
    chessboard.appendChild(square);
  }
}

// Add to page
document.body.appendChild(chessboard);