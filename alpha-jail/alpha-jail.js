// alpha-jail.js

// 1) create zones
const leftZone = document.createElement('div');
const rightZone = document.createElement('div');
leftZone.className = 'zone outside';
rightZone.className = 'zone inside';
leftZone.textContent = 'Free World';
rightZone.textContent = 'Jail';
document.body.append(leftZone, rightZone);

// state
let currentChar = null;
let mouseX = 0, mouseY = 0;

// update char position if it's following
document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (currentChar?.classList.contains('follow')) {
    currentChar.style.left = mouseX + 'px';
    currentChar.style.top  = mouseY + 'px';
  }
});

// ENTER jail → trap
rightZone.addEventListener('pointerenter', () => {
  if (currentChar?.classList.contains('follow')) {
    currentChar.classList.add('trapped');
  }
});

// LEAVE jail → detach trapped
rightZone.addEventListener('pointerleave', () => {
  if (currentChar?.classList.contains('follow') &&
      currentChar.classList.contains('trapped')) {
    // remove only follow (trapped stays)
    currentChar.classList.remove('follow');
    // snap to just outside the jail edge
    const edgeX = window.innerWidth / 2 - 1;
    currentChar.style.left = edgeX + 'px';
    // drop reference so it won't follow again
    currentChar = null;
  }
});

// key handling
document.addEventListener('keydown', e => {
  // a–z
  if (e.key >= 'a' && e.key <= 'z') {
    // detach previous follower (if any)
    if (currentChar) currentChar.classList.remove('follow');

    // make new
    const d = document.createElement('div');
    d.textContent = e.key;
    d.className = 'character follow';
    d.style.left = mouseX + 'px';
    d.style.top  = mouseY + 'px';
    document.body.append(d);
    currentChar = d;
  }

  // ESC clears all
  if (e.key === 'Escape') {
    document.querySelectorAll('.character').forEach(c => c.remove());
    currentChar = null;
  }
});

// keep any trapped-but-detached chars at the edge on resize
window.addEventListener('resize', () => {
  const edgeX = window.innerWidth / 2 - 1;
  document.querySelectorAll('.character.trapped:not(.follow)')
    .forEach(c => c.style.left = edgeX + 'px');
});
