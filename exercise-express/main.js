const express = require("express");
const booksRouter = require("./books");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/books",
  (req, res, next) => {
    //
    const auth = { login: "admin", password: "admin" };
    const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
    const [login, password] = ["admin","admin"]
    if (login === auth.login && password === auth.password) {
      return next();
    }
    res.send("Unauthorized");
    return res.status(401).end();
  },
  booksRouter
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
