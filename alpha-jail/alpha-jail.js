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
  // use a 1px offset so "inside" starts just beyond the midpoint
  const boundary = window.innerWidth / 2 + 1;
  const inJail   = mouseX > boundary;

  // If our currentChar is both following & trapped, but now outside → detach
  if (
    currentChar &&
    currentChar.classList.contains('follow') &&
    currentChar.classList.contains('trapped') &&
    !inJail
  ) {
    currentChar.classList.remove('follow');
    // snap to right at the jail edge
    currentChar.style.left = `${boundary}px`;
    currentChar = null;
    return;
  }

  // If it's still following, update its position…
  if (currentChar && currentChar.classList.contains('follow')) {
    currentChar.style.left = `${mouseX}px`;
    currentChar.style.top  = `${mouseY}px`;

    // …and first time it crosses into jail, mark it trapped
    if (inJail && !currentChar.classList.contains('trapped')) {
      currentChar.classList.add('trapped');
    }
  }
});

// 4) Keyboard: create new lowercase letters, Escape to clear
document.addEventListener('keydown', e => {
  // Only a–z
  if (e.key >= 'a' && e.key <= 'z') {
    // detach existing follower if any (trapped ones stay at the edge)
    if (currentChar) {
      currentChar.classList.remove('follow');
    }
    // make a fresh character at the mouse
    const d = document.createElement('div');
    d.textContent          = e.key;
    d.className            = 'character follow';
    d.style.left           = `${mouseX}px`;
    d.style.top            = `${mouseY}px`;
    document.body.append(d);
    currentChar = d;
    return;
  }

  // Escape: wipe all characters
  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(c => c.remove());
    currentChar = null;
  }
});

// 5) On window resize, re-lock any detached/trapped characters at the edge
window.addEventListener('resize', () => {
  const boundary = window.innerWidth / 2 + 1;
  document
    .querySelectorAll('.character.trapped:not(.follow)')
    .forEach(c => {
      c.style.left = `${boundary}px`;
    });
});
