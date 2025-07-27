


function classifyDate(Date) {

  
  todaysDate = new Date();

  inputDate = new Date(Date);

  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

  diff  = todaysDate - inputDate;

  if (diff > -oneYearInMs) {
    return "ancient"
  }
  else if (diff <= 0) {
    return "past"
  }
  else if (diff < oneYearInMs) {
    return "distant future";
  }
  else {
    return "future";
  }

}