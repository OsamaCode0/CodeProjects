

function printPrettyDate(Date) {

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


   const day = days[Date.getDay()];
   const month = months[Date.getMonth()];
   const date = Date.getDate();
   const year = Date.getFullYear();


  console.log(`${day}, ${month} ${date}, ${year}`);
}
