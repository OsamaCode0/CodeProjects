


let containerForCode = document.createElement("div")
let containerForButton = document.createElement("div")


containerForCode.id = "content"

document.body.appendChild(containerForCode)
document.body.appendChild(containerForButton)

containerForButton.className = "controls"

let textCode = document.createElement("p")

textCode.textContent = "code"

containerForCode.appendChild(textCode)


const buttonControls = [
  { id: `bold`, text: `B`},
  { id: `italic`, text: `I`},
  { id: `underline`, text: `U`},
  { id: `highlight`, text: `Highlight`}
]

buttonControls.forEach(config => {
  let button = document.createElement("button")
  button.id = config.id
  button.textContent = config.text
  

  button.addEventListener("click", function() {
    switch(config.id) {
      case "bold":
        textCode.classList.toggle("bold")
        break;
      case "italic":
        textCode.classList.toggle("italic")
        break;
      case "underline": 
      textCode.classList.toggle("underline")
      break;
      case "highlight":
        textCode.classList.toggle("highlight")
    }
})
containerForButton.appendChild(button)
});

