

let form = document.getElementById('fuelForm') as HTMLFormElement;

let fuelInput = document.getElementById('fuelInput') as HTMLInputElement;

let message = document.getElementById('message') as HTMLParagraphElement;

form.addEventListener('submit', function(event: SubmitEvent) {
  event.preventDefault()
  let valueFuel = fuelInput.value.trim();
  let fuelNumber = Number(valueFuel);

  if (valueFuel === '' || isNaN(fuelNumber)) {
    message.textContent = 'Please enter a valid number for fuel.';
  }

  if (fuelNumber < 0 || fuelNumber > 100) {
    message.textContent = "Invalid fuel input. Please enter a value between 0 and 100.";
  } else {
    message.textContent = "Fuel level set to:" [fuelNumber]
  }
})
