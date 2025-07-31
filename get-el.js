


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


function getElementsByAttribute(attributeName, attributeValue) {

  if (attributeValue !== undefined) {

    return document.querySelector(`[${attributeName} = "${attributeName}"]`)
  }else {
    return document.querySelector(`[${attributeName}]`)
  }

}
