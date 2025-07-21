
function getFirstElement(array) {
  if (Array.isArray(array) && array.length > 0) {
    return [array[0]]
  }
}


function getLastElement(array) {
  if (Array.isArray(array) && array.length > 0) {
    return [array[array.length - 1]]
  }
}


function getElementByIndex(array, index) {
  if (Array.isArray(array) && index >= 0 && index < array.length) {
    return [array[index]]
  }
}

