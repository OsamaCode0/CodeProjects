// Create main container
let containerForCode = document.createElement("div");
containerForCode.id = "content";
document.body.appendChild(containerForCode);

// Create paragraph with text
let textCode = document.createElement("p");
textCode.textContent = "code";
containerForCode.appendChild(textCode);

// Create button container
let containerForButton = document.createElement("div");
containerForButton.className = "controls";
document.body.appendChild(containerForButton);

// Button configurations
const buttonControls = [
  { id: "bold", text: "B" },
  { id: "italic", text: "I" },
  { id: "underline", text: "U" },
  { id: "highlight", text: "Highlight" }
];

// Create buttons and add event listeners
buttonControls.forEach(config => {
  let button = document.createElement("button");
  button.id = config.id;
  button.textContent = config.text;
  
  button.addEventListener("click", () => {
    if (config.id === "highlight") {
      containerForCode.classList.toggle("highlight");
    } else {
      textCode.classList.toggle(config.id);
    }
  });
  
  containerForButton.appendChild(button);
});