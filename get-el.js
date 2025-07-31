


function getElementsByTag(tagName) {

  let gottenElement = document.getElementsByTagName(tagName)

  return gottenElement
}

function getElementsByClassName(className) {

  let gottenClass = document.getElementsByClassName(className)
  return gottenClass
}

function getElementById(tagId) {

  let gottenId = document.getElementById(tagId) 

  if (gottenId == null) {
    return undefined
  }

  return gottenId
}


function getElementsByAttribute(tagAttribute) {

 let gottenAttribute = document.getElementByAttribute(tagAttribute)
  return gottenAttribute
}