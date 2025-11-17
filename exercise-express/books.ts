// create app 
const express = require("express");
const router = express.Router();
const Book = require("./models/book");
import type { BookType } from "./types/book";

// Get all books from database - render Pug template
router.get("/", async (req:any, res:any) => {
  try {
    const books = await Book.find();
    res.render("books", { books: books, user: req.user });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.render("books", { books: [], user: req.user });
  }
});

// Reading tracker page
router.get("/tracker", async (req:any, res:any) => {
  try {
    const books = await Book.find();
    
    // Calculate statistics
    const totalBooks = books.length;
    const booksRead = books.filter((b: BookType) => b.isFinished() || b.getStatus() === 'Read').length;
    const totalPages = books.reduce((sum : number, book: BookType) => sum + (book.getNumberOfPages() || 0), 0);
    const totalPagesRead = books.reduce((sum: number, book: BookType) => sum + (book.getCurrentlyAt() || 0), 0);
    const currentlyReading = books.filter((b: BookType) => b.getStatus() === 'Currently reading');
    
    const stats = {
      totalBooks,
      booksRead,
      totalPages,
      totalPagesRead,
      percentageComplete: totalPages > 0 ? Math.round((totalPagesRead / totalPages) * 100) : 0
    };
    
    res.render("reading-tracker", { 
      books: books, 
      currentlyReading: currentlyReading,
      stats: stats, 
      user: req.user 
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.render("reading-tracker", { 
      books: [], 
      currentlyReading: [],
      stats: { totalBooks: 0, booksRead: 0, totalPages: 0, totalPagesRead: 0, percentageComplete: 0 }, 
      user: req.user 
    });
  }
});

// API endpoint to get all books (JSON)
router.get("/api/books", async (req:any, res:any) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error: unknown) {
    res.status(500).json({ message: "Error fetching books", error: (error as Error).message });
  }
});

// API endpoint to add a new book
router.post("/api/books", async (req:any, res:any) => {
  try {
    const { title, author, numberOfPages, status, format, price } = req.body;
    const newBook = new Book({ 
      title, 
      author, 
      numberOfPages: numberOfPages || 0,
      status: status || 'Unread',
      format: format || 'Print',
      price: price || 0
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error: unknown) {
    res.status(400).json({ message: "Error creating book", error: (error as Error).message });
  }
});

// API endpoint to update reading progress
router.put("/api/books/:id/progress", async (req:any, res:any) => {
  try {
    const { numberOfPagesRead } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    book.numberOfPagesRead = numberOfPagesRead;
    
    // Update status based on progress
    if (numberOfPagesRead >= book.numberOfPages) {
      book.finished = true;
      book.status = 'Read';
      book.numberOfPagesRead = book.numberOfPages;
    } else if (numberOfPagesRead > 0) {
      book.status = 'Currently reading';
      book.finished = false;
    }
    
    await book.save();
    res.json(book);
  } catch (error: unknown) {
    res.status(400).json({ message: "Error updating progress", error: (error as Error).message });
  }
});

module.exports = router;