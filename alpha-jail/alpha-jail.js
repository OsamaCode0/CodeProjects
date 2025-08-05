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
let mouseX = 0;
let mouseY = 0;

// Track mouse position
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const jailBoundary = window.innerWidth / 2;
  
  if (currentChar && currentChar.classList.contains('follow')) {
    if (currentChar.classList.contains('trapped')) {
      // Keep character in jail
      currentChar.style.left = `${Math.max(mouseX, jailBoundary + 1)}px`;
      currentChar.style.top = `${mouseY}px`;
      
      // If mouse leaves jail, snap to boundary
      if (mouseX <= jailBoundary) {
        currentChar.style.left = `${jailBoundary + 1}px`;
      }
    } else {
      // Free movement
      currentChar.style.left = `${mouseX}px`;
      currentChar.style.top = `${mouseY}px`;
      
      // Check if entered jail
      if (mouseX > jailBoundary) {
        currentChar.classList.add('trapped');
        currentChar.style.left = `${jailBoundary + 1}px`;
      }
    }
  }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  // Create new character with a-z keys
  if (e.key >= 'a' && e.key <= 'z') {
    // Remove follow from previous character
    if (currentChar) {
      currentChar.classList.remove('follow');
      // If was in jail, snap to boundary
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
    if (mouseX > window.innerWidth / 2) {
      currentChar.classList.add('trapped');
      currentChar.style.left = `${window.innerWidth / 2 + 1}px`;
    }
  }

  // Clear all characters with Escape
  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(char => char.remove());
    currentChar = null;
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  // Update positions of trapped characters
  document.querySelectorAll('.character.trapped').forEach(char => {
    char.style.left = `${window.innerWidth / 2 + 1}px`;
  });
});