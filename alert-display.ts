// Get references to DOM elements with type assertions
const alertButton = document.getElementById('alertButton') as HTMLButtonElement;
const alertDisplay = document.getElementById('alertDisplay') as HTMLParagraphElement;

// Add event listener with proper parameter typing
alertButton.addEventListener('click', (event: MouseEvent) => {
    alertDisplay.textContent = 'Red Alert!';
});