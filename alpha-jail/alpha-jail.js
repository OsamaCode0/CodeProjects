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
    // Move character with mouse
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top = `${mouseY}px`;

    // Check if character entered jail
    if (isPointerInJail && !currentChar.classList.contains('trapped')) {
      currentChar.classList.add('trapped');
    }

    // Check if character is trying to leave jail
    if (currentChar.classList.contains('trapped') && !isPointerInJail) {
      detachCharacter();
    }
  }
});

function detachCharacter() {
  if (currentChar) {
    currentChar.classList.remove('follow');
    // Snap to jail boundary
    currentChar.style.left = `${window.innerWidth / 2}px`;
    currentChar = null;
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  // Create new character with a-z keys
  if (e.key >= 'a' && e.key <= 'z') {
    // Remove follow from previous character
    if (currentChar) {
      currentChar.classList.remove('follow');
      // If was in jail, snap to boundary
      if (currentChar.classList.contains('trapped')) {
        currentChar.style.left = `${window.innerWidth / 2}px`;
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
    char.style.left = `${window.innerWidth / 2}px`;
  });
});