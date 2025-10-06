console.log("Program Started");

const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("program resloved");
  }, 3000);
});

console.log(promise1);
console.log("Program in progress");

promise1.then((result) => {
  console.log(result);
  console.log("Program Complete");
});
