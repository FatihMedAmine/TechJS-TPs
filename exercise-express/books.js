// create app 
const express = require("express");
const router = express.Router();
let books = [];

// Get all books
router.get("/", (req, res) => {
  res.json(books);
});

// Add a new book
router.post("/", (req, res) => {
  const book = req.body;
  books.push(book);
  res.status(201).json(book);
});

module.exports = router;