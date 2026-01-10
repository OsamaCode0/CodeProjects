// Remove any existing chessboard first
function clearExisting() {
  const existing = document.querySelector('.chessboard');
  if (existing) existing.remove();
}

function initializeChessboard() {
  clearExisting(); // Ensure clean slate
  
  const board = document.createElement("div");
  board.className = "chessboard";
  
  // Create document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  for (let row = 1; row <= 8; row++) {
    for (let col = 1; col <= 8; col++) {
      const square = document.createElement("div");
      square.className = "square";
      square.id = `square-${row}-${col}`;
      
      // Inline styles only
      square.style.backgroundColor = (row + col) % 2 === 0 ? 'white' : 'black';
      
      // Click handler with full style management
      square.addEventListener("click", function() {
        const current = document.querySelector('.square[style*="red"]');
        if (current) {
          const [r, c] = current.id.split('-').slice(1).map(Number);
          current.style.backgroundColor = (r + c) % 2 === 0 ? 'white' : 'black';
        }
        if (current !== this) {
          this.style.backgroundColor = 'red';
        }
      });
      
      fragment.appendChild(square);
    }
  }
  
  board.appendChild(fragment);
  document.body.appendChild(board);
}

// Initialize immediately when script loads
initializeChessboard();