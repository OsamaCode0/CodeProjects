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
    const parts = entries.map(([key, value]) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `${capitalizedKey}: ${value}`;
    });
    return parts.join(", ");
  });
}

function concatenateStrings(concatString, maxLength) {
  return concatString.map(str => {
    if (str.length <= maxLength) {
      return str;
    } else {
      return str.slice(0, maxLength - 3) + "...";
    }
  });
}
