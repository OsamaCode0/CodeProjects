// sumNestedArray.js

function sumNestedArray(nestedArray) {
  // Flatten the nested array completely
  const flattenedArray = nestedArray.flat(Infinity);

  // Filter out non-number items
  const numbersOnly = flattenedArray.filter(item => typeof item === 'number');

  // If there are no numbers, return 0
  if (numbersOnly.length === 0) {
    return 0;
  }

  // Sum the valid numbers
  const total = numbersOnly.reduce((sum, num) => sum + num, 0);

  return total;
}

// Example usage
function main() {
  console.log(sumNestedArray([10, [5, "broken", 3], [[2, 4], "empty"]])); // Output: 24
}
main();
