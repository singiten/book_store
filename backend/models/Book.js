const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  priceETB: {
    type: Number,
    required: [true, 'Price in Birr is required'],
    min: 0
  },
  priceUSD: {
    type: Number,
    min: 0
  },
  coverImage: {
    type: String,
    default: '/uploads/default-book.jpg'
  },
  isbn: {
    type: String,
    unique: false,  // ← Changed from true to false
    sparse: true,
    default: undefined  // ← Don't set default null
  },
  publisher: String,
  publishedYear: Number,
  pages: Number,
  language: {
    type: String,
    default: 'Amharic'
  },
  stock: {
    type: Number,
    default: 0
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);