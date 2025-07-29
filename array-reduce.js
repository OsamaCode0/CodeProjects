


function getTotalFromShoppingBasket(basket) {

  const totatPrice = basket.reduce((accumulator, item) => {
    return accumulator + item.price;
  }
, 0)
return totatPrice;
}


function getAverageAge(people) {

  const averageAge = people.reduce((accumulator, person) => {
    return  accumulator + person.age;
  }, 0)

  const peoplesLength = people.length
  return averageAge / peoplesLength;
}

function concatenateObjects(objects) {

  let result = {};

  for (let item of objects) {
    let key = item.key;
    let value = item.value;

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(value);
  }
  return result;
}


