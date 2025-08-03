// Create a container div for all the letter elements
const letterContainer = document.createElement('div');
// Add CSS class for styling
letterContainer.className = 'letter-container';

// Create a container div for all the buttons
const buttonContainer = document.createElement('div');
// Add CSS class for styling
buttonContainer.className = 'button-container';

// Add both containers to the page body
document.body.appendChild(letterContainer);
document.body.appendChild(buttonContainer);

// Variable to keep track of currently selected letter element
let selectedLetter = null;
// Object to store font sizes for each letter (key: letter id, value: size)
const fontSizes = {};

// Loop through alphabet (A-Z, 26 letters)
for (let i = 0; i < 26; i++) {
  // Create div element for current letter
  const letter = document.createElement('div');
  // Get uppercase letter (A=65, B=66... in ASCII)
  const letterChar = String.fromCharCode(65 + i);
  // Get lowercase letter for ID (a=97, b=98... in ASCII)
  const letterId = String.fromCharCode(97 + i);
  
  // Add CSS class for basic letter styling
  letter.className = 'letter';
  // Set unique ID (a, b, c... z)
  letter.id = letterId;
  // Set visible text (A, B, C... Z)
  letter.textContent = letterChar;
  // Initialize font size for this letter (default 14px)
  fontSizes[letterId] = 14;
  
  // For first letter (A), make it selected by default
  if (i === 0) {
    // Add 'selected' class for bold styling
    letter.classList.add('selected');
    // Set as currently selected letter
    selectedLetter = letter;
  }
  
  // Add click handler for letter selection
  letter.addEventListener('click', function() {
    // If there's a previously selected letter
    if (selectedLetter) {
      // Remove its selected styling
      selectedLetter.classList.remove('selected');
    }
    // Add selected styling to clicked letter
    this.classList.add('selected');
    // Update selectedLetter reference
    selectedLetter = this;
  });
  
  // Add the letter to the letters container
  letterContainer.appendChild(letter);
}

// Array defining all control buttons with their properties
const buttons = [
  { id: 'prev', text: '<', action: movePrev },    // Previous letter button
  { id: 'next', text: '>', action: moveNext },    // Next letter button
  { id: 'decrease', text: '-', action: decreaseFont }, // Decrease font button
  { id: 'increase', text: '+', action: increaseFont }  // Increase font button
];

// Create all buttons from the array definition
buttons.forEach(btn => {
  // Create button element
  const button = document.createElement('button');
  // Set button ID
  button.id = btn.id;
  // Set button text (symbol)
  button.textContent = btn.text;
  // Attach corresponding action function
  button.addEventListener('click', btn.action);
  // Add button to button container
  buttonContainer.appendChild(button);
});

// Function to handle previous letter selection
function movePrev() {
  // If no letter is selected, do nothing
  if (!selectedLetter) return;
  
  // Get ID of current letter (a-z)
  const currentId = selectedLetter.id;
  // Calculate previous letter ID (wraps from a to z)
  let prevId = currentId === 'a' ? 'z' : String.fromCharCode(currentId.charCodeAt(0) - 1);
  
  // Update selection to previous letter
  updateSelectedLetter(prevId);
}

// Function to handle next letter selection
function moveNext() {
  // If no letter is selected, do nothing
  if (!selectedLetter) return;
  
  // Get ID of current letter (a-z)
  const currentId = selectedLetter.id;
  // Calculate next letter ID (wraps from z to a)
  let nextId = currentId === 'z' ? 'a' : String.fromCharCode(currentId.charCodeAt(0) + 1);
  
  // Update selection to next letter
  updateSelectedLetter(nextId);
}

// Function to decrease font size of selected letter
function decreaseFont() {
  // If no letter is selected, do nothing
  if (!selectedLetter) return;
  
  // Get ID of selected letter
  const letterId = selectedLetter.id;
  // Check if size is above minimum (10px)
  if (fontSizes[letterId] > 10) {
    // Decrease size by 2px
    fontSizes[letterId] -= 2;
    // Update the letter's font size in DOM
    selectedLetter.style.fontSize = `${fontSizes[letterId]}px`;
  }
}

// Function to increase font size of selected letter
function increaseFont() {
  // If no letter is selected, do nothing
  if (!selectedLetter) return;
  
  // Get ID of selected letter
  const letterId = selectedLetter.id;
  // Check if size is below maximum (26px)
  if (fontSizes[letterId] < 26) {
    // Increase size by 2px
    fontSizes[letterId] += 2;
    // Update the letter's font size in DOM
    selectedLetter.style.fontSize = `${fontSizes[letterId]}px`;
  }
}

// Helper function to update selected letter
function updateSelectedLetter(letterId) {
  // If there was a previously selected letter
  if (selectedLetter) {
    // Remove its selected styling
    selectedLetter.classList.remove('selected');
  }
  // Get reference to new selected letter
  selectedLetter = document.getElementById(letterId);
  // Add selected styling
  selectedLetter.classList.add('selected');
}