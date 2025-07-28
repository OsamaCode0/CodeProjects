


function convert2DArrayToObjectArray(data) {
  let result = [];

  for (const pair of data) {
    const key = pair[0];
    const value = pair[1];
    result.push({ [key]: value });
  }

  return result;
}

convertArrayOfObjectsToStrings (arrayObjects) {
const let = []

  for (const object of arrayObjects) {

    let.push(`${object.name} ${object.age} `);
  }
}