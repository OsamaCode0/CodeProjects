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

// How many pixels past center counts as “inside”?
const OFFSET = 20;  // ← bump this to 20px

// Track mouse position
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const boundary = window.innerWidth / 2 + OFFSET;
  isPointerInJail = mouseX > boundary;

  if (!currentChar || !currentChar.classList.contains('follow')) return;

  if (currentChar.classList.contains('trapped')) {
    // Pointer leaves the buffered jail area → detach follow (but stay trapped)
    if (!isPointerInJail) {
      currentChar.classList.remove('follow');
      currentChar.style.left = `${boundary}px`;
      currentChar = null;
      return;
    }
    // Still inside buffered jail → keep following
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top  = `${mouseY}px`;
    return;
  }

  // Free movement before trapping
  currentChar.style.left = `${mouseX}px`;
  currentChar.style.top  = `${mouseY}px`;

  // First time crossing into buffered jail
  if (isPointerInJail) {
    currentChar.classList.add('trapped');
  }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key >= 'a' && e.key <= 'z') {
    // Detach previous follower (it remains trapped if it was)
    if (currentChar) {
      currentChar.classList.remove('follow');
    }

    // Create a new character element
    currentChar = document.createElement('div');
    currentChar.textContent = e.key;
    currentChar.classList.add('character', 'follow');
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top  = `${mouseY}px`;
    document.body.appendChild(currentChar);

    // Immediate trapping if cursor is already in buffered jail
    if (isPointerInJail) {
      currentChar.classList.add('trapped');
    }
  }

  // Remove all characters
  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(c => c.remove());
    currentChar = null;
  }
});

// Keep detached, trapped characters locked at the buffered jail edge on resize
window.addEventListener('resize', () => {
  const boundary = window.innerWidth / 2 + OFFSET;
  document.querySelectorAll('.character.trapped:not(.follow)')
    .forEach(char => {
      char.style.left = `${boundary}px`;
    });
});
