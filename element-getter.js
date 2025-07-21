
function getFirstElement(array) {
  if (Array.isArray(array) && array.length >= 0) {
    return [array[0]]
  }
  else if (array == "") {
    return undefined
  }
}


function getLastElement(array) {
  if (Array.isArray(array) && array.length >= 0) {
    return [array[array.length - 1]]
  } else if (array == "") {
    return undefined
  }
}


function getElementByIndex(array, index) {
  if (Array.isArray(array) && index >= 0 && index < array.length) {
    return [array[index]]
  } else if (array == "") {
  return undefined
}
}

