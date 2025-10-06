function myFunction(time) {
  console.log("hello");
  setTimeout(myFunction, time, time);
}

setTimeout(myFunction, 2000,2000);
