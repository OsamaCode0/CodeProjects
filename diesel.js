function calculateFines(carsData) {
  const cars = JSON.parse(carsData);
  let finedCars = [];
  let totalFines = 0;

  if (!cars || cars.length === 0) {
    return JSON.stringify({ totalFines: 0, cars: [] });
  }

  for (let car of cars) {
    const [make, model, reg, year, fuel] = car;
    let fine = 0;

    if (year < 2000) fine = 20;
    else if (fuel === "diesel" && year < 2015) fine = 10;

    if (fine > 0) {
      totalFines += fine;
      finedCars.push({ reg, year, fuel, fine });
    }
  }

  return JSON.stringify({
    totalFines,
    cars: finedCars,
  });
}

function main() {
  const carData =
    '[["Toyota", "Camry", "ABC123", 2014, "diesel"], ["Ford", "Focus", "XYZ456", 1999, "petrol"]]';

  console.log(calculateFines(carData));
}

main();
