document.addEventListener('DOMContentLoaded', function() {
    // Create container explicitly
    const container = document.createElement('div');
    container.className = 'chessboard-container';
    document.body.prepend(container);
    
    initializeChessboard();
});

function initializeChessboard() {
    const container = document.querySelector('.chessboard-container');
    container.innerHTML = '';
    
    const chessboard = document.createElement('div');
    chessboard.className = 'chessboard';
    
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${row}-${col}`;
            square.tabIndex = 0; // Make focusable
            
            // Set colors
            const isWhite = (row + col) % 2 === 0;
            square.style.backgroundColor = isWhite ? 'white' : 'black';
            square.dataset.originalColor = isWhite ? 'white' : 'black';
            
            // Click handler
            square.addEventListener('click', function() {
                document.querySelectorAll('.square').forEach(sq => {
                    sq.style.backgroundColor = sq.dataset.originalColor;
                });
                this.style.backgroundColor = 'red';
            });
            
            chessboard.appendChild(square);
        }
    }
    
    container.appendChild(chessboard);
    
    // Force layout calculation
    void chessboard.offsetHeight;
}