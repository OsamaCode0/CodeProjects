

function getValueFromKey(object, key) {

  return object[key] || undefined;
}


function addKeyValuePairs(object, key) {
  return {...object, ...key} || undefined;
}