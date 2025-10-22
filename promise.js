// console.log("Program Started");

// const promise1 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve("program resloved");
//   }, 3000);
// });

// console.log(promise1);
// console.log("Program in progress");

// promise1.then((result) => {
//   console.log(result);
//   console.log("Program Complete");
// });

// console.log("Program Started");

// const promise1 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve();
//   }, 3000);

//   setTimeout(() => {
//     reject();
//   }, 2000);
// });

// console.log(promise1);
// console.log("Program in progress");

// promise1
//   .then(() => {
//     console.log("Program Complete");
//   })
//   .catch(() => {
//     console.log("Program failure");
//   });

console.log("Program Started");

const promise1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, 3000);
});

console.log(promise1);
console.log("Program in progress");

promise1
  .then(() => {
    console.log("Step 1 Complete");

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });
  })
  .then(() => {
    console.log("Step 2 Complete");
  })
  .catch(() => {
    console.log("Program failure");
  });
