

const alertButton: HTMLButtonElement = document.getElementById('alertButton') as HTMLButtonElement;

const alertDisplay: HTMLParagraphElement = document.getElementById('alertDisplay') as HTMLParagraphElement;


alertButton.addEventListener('click', (event: MouseEvent) => {
    alertDisplay.textContent = 'Red Alert!'
})

