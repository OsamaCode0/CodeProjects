


function filterOutOddNumbers(arrayNumbers) {


  const evenNumbers = arrayNumbers.filter(function(arrayNumber){
    return arrayNumber % 2 === 0;
  }) 

  return evenNumbers;
}

function filterObjectsByNameLength(arrayObject, maxLength) {
  const filterObject = arrayObject.filter(function(object) {
  return object.name.lenght <= maxLength
 }) 

 return filterObject;
}


function compoundFilter(arrayProduct) {

  const filteredProducts = arrayProduct.filter(function(products) {
    return (typeof products.code === "string" && products.code.length > 5 && !products.category.includes("special")) && products.price > 50 && products.location !== "Underground";
  })

  return filteredProducts;
}




