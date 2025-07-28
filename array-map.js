


function convert2DArrayToObjectArray(data) {
  let result = [];

  for (const pair of data) {
    const key = pair[0];
    const value = pair[1];
    result.push({ [key]: value });
  }
  return result;
}

function convertArrayOfObjectsToStrings(arrayObjects) {
  let result = [];

  for (const obj of arrayObjects) {
     const str = `Name: ${obj.name}, Age: ${obj.age}, City: ${obj.city}`;
    result.push(str);
  }
  return result;
}


function concatenateStrings (concatString, maxLength) {

  let result = [];

  for (const str of concatString) {
    if (str.lenght <= maxLength) {
      result.push(str);
    }}
     {

  }
  return result.join(", ");
}