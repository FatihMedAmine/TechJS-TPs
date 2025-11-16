// create schema and model for Book
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number },
  genre: { type: String },
  description: { type: String },
  publishedDate: { type: Date },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;