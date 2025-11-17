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
    required: true,
    default: 'Unread'
  },
  price: { type: Number, required: true, default: 0 },
  format: { 
    type: String, 
    enum: ['Print', 'PDF', 'EBook', 'AudioBook'],
    required: true,
    default: 'Print'
  },
  finished: { type: Boolean, default: false }
});

// Method to calculate reading percentage (matching Book.ts logic)
bookSchema.methods.getReadingPercentage = function() {
  if (this.numberOfPages === 0) return 0;
  return Math.round((this.numberOfPagesRead / this.numberOfPages) * 100);
};

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;