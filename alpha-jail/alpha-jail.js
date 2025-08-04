// Create the two zones
const leftZone = document.createElement('div');
const rightZone = document.createElement('div');

// Add to DOM
document.body.appendChild(leftZone);
document.body.appendChild(rightZone);

// Add classes
leftZone.classList.add('zone', 'outside');
rightZone.classList.add('zone', 'inside');

// Add zone labels
leftZone.textContent = 'Free World';
rightZone.textContent = 'Jail';

// Game state
let currentChar = null;
let isPointerInJail = false;

// Mouse movement handler
document.addEventListener('mousemove', (e) => {
    // Check if pointer is in jail (right half)
    isPointerInJail = e.clientX > window.innerWidth / 2;
    
    // If we have an active following character
    if (currentChar && currentChar.classList.contains('follow')) {
        // Position character at pointer (centered)
        currentChar.style.left = `${e.clientX}px`;
        currentChar.style.top = `${e.clientY}px`;
        
        // Trap if pointer enters jail
        if (isPointerInJail) {
            currentChar.classList.add('trapped');
            currentChar.style.backgroundColor = 'orange'; // Exact color
        }
    }
});

// Keyboard handler
document.addEventListener('keydown', (e) => {
    // Create new character on a-z
    if (e.key >= 'a' && e.key <= 'z') {
        // Remove follow from previous character
        if (currentChar) {
            currentChar.classList.remove('follow');
        }
        
        // Create new character at current mouse position
        currentChar = document.createElement('div');
        currentChar.textContent = e.key;
        currentChar.classList.add('character', 'follow');
        
        // Set initial position to current mouse position
        currentChar.style.left = `${event.clientX}px`;
        currentChar.style.top = `${event.clientY}px`;
        
        // If created in jail, make it orange immediately
        if (event.clientX > window.innerWidth / 2) {
            currentChar.classList.add('trapped');
            currentChar.style.backgroundColor = 'orange';
        }
        
        document.body.appendChild(currentChar);
    }
    
    // Clear all on Escape
    if (e.key === 'Escape') {
        document.querySelectorAll('.character').forEach(char => char.remove());
        currentChar = null;
    }
});