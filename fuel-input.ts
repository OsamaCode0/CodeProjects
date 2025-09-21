setTimeout(() => {
    // Your DOM code here
    const form = document.getElementById('fuelForm') as HTMLFormElement;
    const fuelInput = document.getElementById('fuelInput') as HTMLInputElement;
    const message = document.getElementById('message') as HTMLParagraphElement;
    
    form.addEventListener('submit', function(event: SubmitEvent) {
        event.preventDefault();
            let valueFuel = fuelInput.value.trim();
    let fuelNumber = Number(valueFuel);

    if (valueFuel === '' || isNaN(fuelNumber)) {
        message.textContent = 'Please enter a valid number for fuel.';
        return; // ✅ Add return to stop execution
    }

    if (fuelNumber < 0 || fuelNumber > 100) {
        message.textContent = "Invalid fuel input. Please enter a value between 0 and 100.";
    } else {
        message.textContent = "Fuel level set to: " [fuelNumber]
    }
});
    },100);
     // Small delay to ensure DOM is ready
