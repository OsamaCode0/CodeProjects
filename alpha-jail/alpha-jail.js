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

  if (!currentChar || !currentChar.classList.contains('follow')) return;

  // If it's already trapped...
  if (currentChar.classList.contains('trapped')) {
    // and pointer leaves → detach follow, leave trapped state
    if (!isPointerInJail) {
      currentChar.classList.remove('follow');
      // snap to jail edge
      currentChar.style.left = `${jailBoundary + 1}px`;
      // drop reference so it no longer follows
      currentChar = null;
      return;
    }
    // otherwise still in jail → keep following
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top  = `${mouseY}px`;
    return;
  }

  // Not yet trapped → free movement
  currentChar.style.left = `${mouseX}px`;
  currentChar.style.top  = `${mouseY}px`;

  // If entering jail for the first time
  if (isPointerInJail) {
    currentChar.classList.add('trapped');
  }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  // spawn on a–z
  if (e.key >= 'a' && e.key <= 'z') {
    // detach previous follow (but leave it trapped if it was)
    if (currentChar) {
      currentChar.classList.remove('follow');
    }

    // Create new character
    currentChar = document.createElement('div');
    currentChar.textContent = e.key;
    currentChar.classList.add('character', 'follow');
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top  = `${mouseY}px`;
    document.body.appendChild(currentChar);

    // Immediately trap if in jail
    if (isPointerInJail) {
      currentChar.classList.add('trapped');
    }
  }

  // clear all
  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(c => c.remove());
    currentChar = null;
  }
});

// Keep already-trapped chars locked to the jail edge on resize
window.addEventListener('resize', () => {
  const boundary = window.innerWidth / 2 + 1;
  document.querySelectorAll('.character.trapped:not(.follow)')
    .forEach(char => {
      // ensure anything detached to the edge stays there
      char.style.left = `${boundary}px`;
    });
});
