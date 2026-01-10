// Create containers
const letterContainer = document.createElement('div');
letterContainer.className = 'letter-container';

const buttonContainer = document.createElement('div');
buttonContainer.className = 'button-container';

document.body.appendChild(letterContainer);
document.body.appendChild(buttonContainer);

// State tracking
let selectedLetter = null;
const fontSizes = {};

// Create letters A-Z
for (let i = 0; i < 26; i++) {
  const letter = document.createElement('div');
  const letterChar = String.fromCharCode(65 + i);
  const letterId = String.fromCharCode(97 + i);
  
  letter.className = 'letter';
  letter.id = letterId;
  letter.textContent = letterChar;
  fontSizes[letterId] = 14; // Default size 14px
  letter.style.fontSize = '14px'; // Apply to DOM
  
  if (i === 0) {
    letter.classList.add('selected');
    selectedLetter = letter;
  }
  
  letter.addEventListener('click', function() {
    if (selectedLetter) {
      selectedLetter.classList.remove('selected');
    }
    this.classList.add('selected');
    selectedLetter = this;
  });
  
  letterContainer.appendChild(letter);
}

// Create buttons
const buttons = [
  { id: 'prev', text: '<', action: movePrev },
  { id: 'next', text: '>', action: moveNext },
  { id: 'decrease', text: '-', action: decreaseFont },
  { id: 'increase', text: '+', action: increaseFont }
];

buttons.forEach(btn => {
  const button = document.createElement('button');
  button.id = btn.id;
  button.textContent = btn.text;
  button.addEventListener('click', btn.action);
  buttonContainer.appendChild(button);
});

// Button functions
function movePrev() {
  if (!selectedLetter) return;
  const currentId = selectedLetter.id;
  let prevId = currentId === 'a' ? 'z' : String.fromCharCode(currentId.charCodeAt(0) - 1);
  updateSelectedLetter(prevId);
}

function moveNext() {
  if (!selectedLetter) return;
  const currentId = selectedLetter.id;
  let nextId = currentId === 'z' ? 'a' : String.fromCharCode(currentId.charCodeAt(0) + 1);
  updateSelectedLetter(nextId);
}

function decreaseFont() {
  if (!selectedLetter) return;
  const letterId = selectedLetter.id;
  const newSize = fontSizes[letterId] - 2;
  if (newSize >= 10) {
    fontSizes[letterId] = newSize;
    selectedLetter.style.fontSize = `${newSize}px`;
  }
}

function increaseFont() {
  if (!selectedLetter) return;
  const letterId = selectedLetter.id;
  const newSize = fontSizes[letterId] + 2;
  if (newSize <= 26) {
    fontSizes[letterId] = newSize;
    selectedLetter.style.fontSize = `${newSize}px`;
  }
}

function updateSelectedLetter(letterId) {
  if (selectedLetter) {
    selectedLetter.classList.remove('selected');
  }
  selectedLetter = document.getElementById(letterId);
  selectedLetter.classList.add('selected');
}