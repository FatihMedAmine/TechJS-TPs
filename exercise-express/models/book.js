// create schema and model for Book
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  numberOfPages: { type: Number, required: true, default: 0 },
  numberOfPagesRead: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Read', 'Re-read', 'DNF', 'Currently reading', 'Returned', 'Unread', 'Want to read'],
    default: 'Unread'
  },
  price: { type: Number, default: 0 },
  format: { 
    type: String, 
    enum: ['Print', 'PDF', 'EBook', 'AudioBook'],
    default: 'Print'
  },
  finished: { type: Boolean, default: false },
  year: { type: Number },
  genre: { type: String },
  description: { type: String },
  publishedDate: { type: Date },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;