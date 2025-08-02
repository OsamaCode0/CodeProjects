function initializeChessboard() {
    // Create container if it doesn't exist
    let container = document.querySelector('.chessboard-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'chessboard-container';
        document.body.appendChild(container);
    }
    
    // Clear previous chessboard if any
    container.innerHTML = '';
    
    // Create chessboard
    const chessboard = document.createElement('div');
    chessboard.className = 'chessboard';
    
    // Create squares
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${row}-${col}`;
            
            // Set initial color
            const isWhite = (row + col) % 2 === 0;
            square.style.backgroundColor = isWhite ? 'white' : 'black';
            square.dataset.originalColor = isWhite ? 'white' : 'black';
            
            // Make clickable
            square.style.cursor = 'pointer';
            square.addEventListener('click', handleSquareClick);
            
            chessboard.appendChild(square);
        }
    }
    
    container.appendChild(chessboard);
}

function handleSquareClick() {
    // Reset all squares
    document.querySelectorAll('.square').forEach(sq => {
        sq.style.backgroundColor = sq.dataset.originalColor;
    });
    
    // Set clicked square to red
    this.style.backgroundColor = 'red';
}

// Initialize immediately when script loads
initializeChessboard();