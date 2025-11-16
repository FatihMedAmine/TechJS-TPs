// create app 
const express = require("express");
const router = express.Router();
const Book = require("./models/book");

// Get all books from database - render Pug template
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.render("books", { books: books, user: req.user });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.render("books", { books: [], user: req.user });
  }
});

// API endpoint to get all books (JSON)
router.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// API endpoint to add a new book
router.post("/api/books", async (req, res) => {
  try {
    const { title, author, year, genre, description } = req.body;
    const newBook = new Book({ title, author, year, genre, description });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: "Error creating book", error: error.message });
  }
});

module.exports = router;