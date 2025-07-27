function classifyDate(date) {
  const todaysDate = new Date();
  todaysDate.setHours(0, 0, 0, 0);

  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);

  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
  const diff = inputDate - todaysDate;

  if (diff < -oneYearInMs) {
    return "ancient";
  } else if (diff <= 0) {
    return "past";
  } else if (diff > oneYearInMs) {
    return "distant future";
  } else {
    return "future";
  }
}
