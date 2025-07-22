

function getKeyFromValue(object, key) {

  return object[key] || undefined;
}


function addKeyValuePairs(originalObject, newKeyValuePairs) {
  return {...originalObject, ...newKeyValuePairs}
}