// Create zones
const leftZone = document.createElement('div');
const rightZone = document.createElement('div');
document.body.appendChild(leftZone);
document.body.appendChild(rightZone);

leftZone.classList.add('zone', 'outside');
rightZone.classList.add('zone', 'inside');
leftZone.textContent = 'Free World';
rightZone.textContent = 'Jail';

// Game state
let currentChar = null;
let isPointerInJail = false;
let mouseX = 0;
let mouseY = 0;

// Track mouse position continuously
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isPointerInJail = mouseX > window.innerWidth / 2;
    
    if (currentChar && currentChar.classList.contains('follow')) {
        currentChar.style.left = `${mouseX}px`;
        currentChar.style.top = `${mouseY}px`;
        
        if (isPointerInJail) {
            currentChar.classList.add('trapped');
            currentChar.style.backgroundColor = 'orange';
        }
    }
});

// Keyboard handler
document.addEventListener('keydown', (e) => {
    if (e.key >= 'a' && e.key <= 'z') {
        // Remove previous character's follow
        if (currentChar) {
            currentChar.classList.remove('follow');
        }
        
        // Create new character at current mouse position
        currentChar = document.createElement('div');
        currentChar.textContent = e.key;
        currentChar.classList.add('character', 'follow');
        
        // Set initial position to current mouse position
        currentChar.style.left = `${mouseX}px`;
        currentChar.style.top = `${mouseY}px`;
        
        // If created in jail, make it orange immediately
        if (isPointerInJail) {
            currentChar.classList.add('trapped');
            currentChar.style.backgroundColor = 'orange';
        }
        
        document.body.appendChild(currentChar);
    }
    
    if (e.key === 'Escape') {
        document.querySelectorAll('.character').forEach(char => char.remove());
        currentChar = null;
    }
});