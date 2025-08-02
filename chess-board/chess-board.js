let previouslyClickedSquare = null; // To keep track of the last clicked square

/**
 * Dynamically creates the chessboard squares and attaches event listeners.
 */
function initializeChessboard() {
    const chessboardDiv = document.querySelector('.chessboard'); // Get the main chessboard container

    // Defensive check: Ensure the chessboardDiv exists before proceeding
    if (!chessboardDiv) {
        console.error("Error: Chessboard container (<div class='chessboard'>) not found in the HTML. Please ensure it's present.");
        return; // Exit if container is not found
    }

    // Loop to create 8 rows and 8 columns (64 squares)
    for (let i = 0; i < 8; i++) { // 'i' represents the row index (0-7)
        for (let j = 0; j < 8; j++) { // 'j' represents the column index (0-7)
            const square = document.createElement('div'); // Create a new div element for each square
            square.classList.add('square'); // Add the base 'square' class
            square.id = `square-${i + 1}-${j + 1}`; // Assign unique ID: square-row-col (rows/cols start from 1)

            // Determine square color based on the sum of row and column indices
            // If (row + col) is even, it's a white square; otherwise, it's black.
            if ((i + j) % 2 === 0) {
                square.classList.add('white-square');
            } else {
                square.classList.add('black-square');
            }

            chessboardDiv.appendChild(square); // Append the created square to the chessboard container
        }
    }

    // Attach a single event listener to the chessboard container for click events (Event Delegation)
    chessboardDiv.addEventListener('click', handleSquareClick);
}