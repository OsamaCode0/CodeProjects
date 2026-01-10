// Get DOM elements with type assertions
const form = document.getElementById('fuelForm') as HTMLFormElement;
const fuelInput = document.getElementById('fuelInput') as HTMLInputElement;
const message = document.getElementById('message') as HTMLParagraphElement;

// Add event listener with proper typing
form.addEventListener('submit', function(event: SubmitEvent) {
    event.preventDefault();
    let valueFuel = fuelInput.value.trim();
    let fuelNumber = Number(valueFuel);

    // Validation checks
    if (valueFuel === '' || isNaN(fuelNumber)) {
        message.textContent = 'Invalid fuel input. Please enter a number between 0 and 100.';
        return;
    }

    if (fuelNumber < 0 || fuelNumber > 100) {
        message.textContent = 'Invalid fuel input. Please enter a number between 0 and 100.';
    } else {
        message.textContent = `Fuel level set to: ${fuelNumber}`;
    }
});