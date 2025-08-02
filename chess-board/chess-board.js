document.addEventListener('DOMContentLoaded', function() {
    initializeChessboard();
});

function initializeChessboard() {
    // Get or create the chessboard container
    let container = document.getElementById('chessboard-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'chessboard-container';
        document.body.appendChild(container);
    }

    // Clear any existing chessboard
    container.innerHTML = '';

    // Create the chessboard
    const chessboard = document.createElement('div');
    chessboard.className = 'chessboard';
    
    // Create 64 squares (8x8 grid)
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${row}-${col}`;
            
            // Set initial color
            const isWhite = (row + col) % 2 === 0;
            square.dataset.originalColor = isWhite ? 'white' : 'black';
            square.style.backgroundColor = square.dataset.originalColor;
            
            // Add click event listener
            square.addEventListener('click', function() {
                // Reset all squares to original colors
                document.querySelectorAll('.square').forEach(sq => {
                    sq.style.backgroundColor = sq.dataset.originalColor;
                });
                
                // If this square wasn't already red, make it red
                if (this.style.backgroundColor !== 'red') {
                    this.style.backgroundColor = 'red';
                } else {
                    // If it was red, revert to original color
                    this.style.backgroundColor = this.dataset.originalColor;
                }
            });
            
            chessboard.appendChild(square);
        }
    }
    
    // Add chessboard to the container
    container.appendChild(chessboard);
}