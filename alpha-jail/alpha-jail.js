// alpha-jail.js

// 1) Build the two zones immediately
const leftZone  = document.createElement('div');
const rightZone = document.createElement('div');
leftZone.className  = 'zone outside';
rightZone.className = 'zone inside';
leftZone.textContent  = 'Free World';
rightZone.textContent = 'Jail';
document.body.append(leftZone, rightZone);

// 2) Game state
let currentChar = null;
let mouseX = 0, mouseY = 0;

// 3) Mouse move: track cursor & manage follow → trap → detach
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const half       = window.innerWidth / 2;
  const detachEdge = half + 1;         // 1px past center
  const inJail     = mouseX > half;

  // If a trapped character still has follow but now outside → detach it
  if (
    currentChar &&
    currentChar.classList.contains('follow') &&
    currentChar.classList.contains('trapped') &&
    !inJail
  ) {
    currentChar.classList.remove('follow');
    currentChar.style.left = `${detachEdge}px`;
    currentChar = null;
    return;
  }

  // If following, update its position and trap on first entry
  if (currentChar && currentChar.classList.contains('follow')) {
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top  = `${mouseY}px`;
    if (inJail && !currentChar.classList.contains('trapped')) {
      currentChar.classList.add('trapped');
    }
  }
});

// 4) Keyboard: only lowercase a–z; Escape to clear
document.addEventListener('keydown', e => {
  // Lower-case letter?
  if (e.key >= 'a' && e.key <= 'z') {
    // detach any existing follower (trapped ones stay at edge)
    if (currentChar) {
      currentChar.classList.remove('follow');
    }
    // create new character div at the mouse position
    const d = document.createElement('div');
    d.textContent = e.key;
    d.className   = 'character follow';
    d.style.left  = `${mouseX}px`;
    d.style.top   = `${mouseY}px`;
    document.body.appendChild(d);
    currentChar = d;

    // immediate trap if in right half
    if (mouseX > window.innerWidth / 2) {
      currentChar.classList.add('trapped');
    }
    return;
  }

  // Escape clears all characters
  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(c => c.remove());
    currentChar = null;
  }
});

// 5) On window resize, re-lock any detached/trapped characters at the edge
window.addEventListener('resize', () => {
  const edge = window.innerWidth / 2 + 1;
  document
    .querySelectorAll('.character.trapped:not(.follow)')
    .forEach(c => c.style.left = `${edge}px`);
});
