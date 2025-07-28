


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
  

  return arrayObjects.map(obj => {
    const entries = Object.entries(obj);
    const parts  = entries.map(([key, value]) => {
      let capitalizeKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `${capitalizeKey}: ${value}`;
    }); 
    return parts.join(", ");
  })
}


function concatenateStrings (concatString, maxLength) {

  let result = [];

  for (const str of concatString) {
    if (str.lenght <= maxLength) {
      result.push(str);
    }else {
      result.push(str.slice(0, maxLength) + "...");
    }
  }

     {

  }
  return result
}