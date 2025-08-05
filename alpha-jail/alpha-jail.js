// Create the two zones
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

// Track mouse position
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const jailBoundary = window.innerWidth / 2;
  isPointerInJail = mouseX > jailBoundary;

  if (currentChar && currentChar.classList.contains('follow')) {
    if (currentChar.classList.contains('trapped')) {
      // If trying to leave jail, fully detach the character
      if (!isPointerInJail) {
        currentChar.classList.remove('follow', 'trapped'); // Remove both classes
        currentChar.style.backgroundColor = 'white'; // Reset color
        currentChar.style.left = `${jailBoundary}px`; // Snap to boundary
        currentChar = null; // Clear reference
      }
      else {
        // Still in jail - keep moving
        currentChar.style.left = `${mouseX}px`;
        currentChar.style.top = `${mouseY}px`;
      }
    }
    else {
      // Free movement
      currentChar.style.left = `${mouseX}px`;
      currentChar.style.top = `${mouseY}px`;
      
      // Entering jail
      if (isPointerInJail) {
        currentChar.classList.add('trapped');
      }
    }
  }
});
// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key >= 'a' && e.key <= 'z') {
    // Remove follow from previous character
    if (currentChar) {
      currentChar.classList.remove('follow');
      if (currentChar.classList.contains('trapped')) {
        currentChar.style.left = `${window.innerWidth / 2 + 1}px`;
      }
    }

    // Create new character
    currentChar = document.createElement('div');
    currentChar.textContent = e.key;
    currentChar.classList.add('character', 'follow');
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top = `${mouseY}px`;
    document.body.appendChild(currentChar);

    // Immediately check if spawned in jail
    if (isPointerInJail) {
      currentChar.classList.add('trapped');
    }
  }

  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(char => char.remove());
    currentChar = null;
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  const boundary = window.innerWidth / 2 + 1;
  document.querySelectorAll('.character.trapped').forEach(char => {
    char.style.left = `${boundary}px`;
  });
});