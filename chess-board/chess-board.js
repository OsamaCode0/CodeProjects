function initializeChessboard() {
    // Create the chessboard container
    const chessboard = document.createElement('div');
    chessboard.className = 'chessboard';
    
    // Create 64 squares (8x8 grid)
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 8; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${row}-${col}`;
            
            // Determine if square should be black or white
            // Top left (1,1) is white, alternating pattern
            if ((row + col) % 2 === 0) {
                square.style.backgroundColor = 'white';
            } else {
                square.style.backgroundColor = 'black';
            }
            
            // Add click event listener
            square.addEventListener('click', function() {
                // Reset all squares to their original colors
                document.querySelectorAll('.square').forEach(sq => {
                    const [r, c] = sq.id.split('-').slice(1).map(Number);
                    sq.style.backgroundColor = (r + c) % 2 === 0 ? 'white' : 'black';
                });
                
                // Set clicked square to red
                this.style.backgroundColor = 'red';
            });
            
            chessboard.appendChild(square);
        }
    }
    
    // Add chessboard to the body
    document.body.appendChild(chessboard);
}