let previouslyClickedSquare = null; // Global variable to keep track of the last clicked square

/**
 * Dynamically creates the chessboard squares and attaches event listeners.
 */
function initializeChessboard() {
    // Dynamically create the main chessboard container
    const chessboardDiv = document.createElement('div');
    chessboardDiv.classList.add('chessboard');

    // Append the chessboard container to the body or after the h1
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.after(chessboardDiv); // Insert after the h1 if it exists
    } else {
        document.body.appendChild(chessboardDiv); // Fallback to appending to body
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

/**
 * Handles click events on the chessboard squares using event delegation.
 * @param {MouseEvent} event - The click event object.
 */
function handleSquareClick(event) {
    const clickedSquare = event.target;

    // Ensure the clicked element is a chessboard square (not the container itself or other elements)
    // and that it has an ID starting with 'square-' to confirm it's a valid square.
    if (!clickedSquare.classList.contains('square') ||!clickedSquare.id.startsWith('square-')) {
        return; // If not a square, do nothing
    }

    // --- Revert previously clicked square ---
    // If there was a previously clicked square AND it's not the current one
    if (previouslyClickedSquare && previouslyClickedSquare!== clickedSquare) {
        previouslyClickedSquare.classList.remove('selected-square'); // Remove red highlight
    }

    // --- Toggle current square's highlight ---
    // If the clicked square is already selected, deselect it
    if (clickedSquare.classList.contains('selected-square')) {
        clickedSquare.classList.remove('selected-square');
        previouslyClickedSquare = null; // No square is selected now
    } else {
        // Otherwise, select it
        clickedSquare.classList.add('selected-square');
        previouslyClickedSquare = clickedSquare; // Store reference to the newly selected square
    }
}

// Execute initializeChessboard function once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeChessboard);