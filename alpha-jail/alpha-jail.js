// alpha-jail.js

// 1) build the two zones
const leftZone  = document.createElement('div');
const rightZone = document.createElement('div');
leftZone.className  = 'zone outside';
rightZone.className = 'zone inside';
leftZone.textContent  = 'Free World';
rightZone.textContent = 'Jail';
document.body.append(leftZone, rightZone);

// 2) game state
let currentChar = null;
let mouseX = 0, mouseY = 0;

// 3) on mouse move, track cursor and manage follow/trap/detach
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const inJail = mouseX > window.innerWidth / 2;

  // If we have a character that's both follow+trapped but now outside, detach it immediately
  if (
    currentChar &&
    currentChar.classList.contains('follow') &&
    currentChar.classList.contains('trapped') &&
    !inJail
  ) {
    currentChar.classList.remove('follow');
    // snap to the edge
    currentChar.style.left = (window.innerWidth / 2) + 'px';
    // clear ref so it won't follow again
    currentChar = null;
    return;
  }

  // If there's a follower, update its position
  if (currentChar && currentChar.classList.contains('follow')) {
    currentChar.style.left = mouseX + 'px';
    currentChar.style.top  = mouseY + 'px';

    // first time it enters jail: mark trapped
    if (inJail && !currentChar.classList.contains('trapped')) {
      currentChar.classList.add('trapped');
    }
  }
});

// 4) on keydown, create or clear characters
document.addEventListener('keydown', (e) => {
  // letter a–z?
  if (e.key >= 'a' && e.key <= 'z') {
    // detach old follower (leaving it trapped at the edge if it was)
    if (currentChar) {
      currentChar.classList.remove('follow');
    }
    // make a new one
    const d = document.createElement('div');
    d.textContent = e.key;
    d.className = 'character follow';
    d.style.left = mouseX + 'px';
    d.style.top  = mouseY + 'px';
    document.body.appendChild(d);
    currentChar = d;
  }

  // Escape clears all
  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(c => c.remove());
    currentChar = null;
  }
});

// 5) on resize, lock any detached/trapped chars to the edge
window.addEventListener('resize', () => {
  const edgeX = window.innerWidth / 2;
  document.querySelectorAll('.character.trapped:not(.follow)')
    .forEach(c => c.style.left = edgeX + 'px');
});
