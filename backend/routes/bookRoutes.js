const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

// Helper function to generate slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// ===== PUBLIC ROUTES =====

// GET all books (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, author, language, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    // Apply filters
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (language) query.language = language;
    if (minPrice || maxPrice) {
      query.priceETB = {};
      if (minPrice) query.priceETB.$gte = parseInt(minPrice);
      if (maxPrice) query.priceETB.$lte = parseInt(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const books = await Book.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Book.countDocuments(query);
    
    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalBooks: total
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single book by slug
router.get('/:slug', async (req, res) => {
  try {
    const book = await Book.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('category', 'name slug description');
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET book by ID (for admin upload)
router.get('/id/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('category', 'name');
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET books by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const books = await Book.find({ 
      category: req.params.categoryId,
      isActive: true 
    }).populate('category', 'name');
    
    res.json(books);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN ONLY ROUTES =====

// POST create book (without image)
router.post('/', auth, admin, async (req, res) => {
  try {
    console.log('📝 Creating book with data:', req.body);
    
    // Validate required fields
    const { title, author, description, category, priceETB } = req.body;
    
    if (!title || !author || !description || !category || !priceETB) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, author, description, category, and priceETB are required' 
      });
    }
    
    // Generate slug from title
    const slug = generateSlug(title);
    
    // Create book data object with slug
    const bookData = {
      title: req.body.title,
      slug: slug,
      author: req.body.author,
      description: req.body.description,
      category: req.body.category,
      priceETB: req.body.priceETB,
      priceUSD: req.body.priceUSD || null,
      publisher: req.body.publisher || '',
      publishedYear: req.body.publishedYear || null,
      pages: req.body.pages || null,
      language: req.body.language || 'Amharic',
      stock: req.body.stock || 0,
      tags: req.body.tags || [],
      createdBy: req.user.userId
    };
    
    // Only add isbn if it's provided
    if (req.body.isbn) {
      bookData.isbn = req.body.isbn;
    }
    
    // Create and save book
    const book = new Book(bookData);
    await book.save();
    
    // Update category bookCount
    try {
      await Category.findByIdAndUpdate(
        book.category,
        { $inc: { bookCount: 1 } }
      );
      console.log('✅ Category bookCount updated');
    } catch (updateError) {
      console.log('⚠️ Category count update failed, but book was created');
    }
    
    console.log('✅ Book created successfully:', book.title);
    res.status(201).json(book);
  } catch (error) {
    console.error('❌ Book creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// SIMPLIFIED: POST upload book cover - ONLY needs bookId and coverImage
router.post('/upload-cover', auth, admin, upload.single('coverImage'), async (req, res) => {
  try {
    console.log('📝 Uploading cover for book ID:', req.body.bookId);
    
    const { bookId } = req.body;
    
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Cover image is required' });
    }
    
    // Find the book - all other info is already in database
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Update only the cover image
    const coverImagePath = `/uploads/covers/${req.file.filename}`;
    book.coverImage = coverImagePath;
    
    await book.save();
    
    console.log('✅ Cover uploaded for book:', book.title);
    res.json({ 
      message: 'Cover uploaded successfully',
      book: {
        id: book._id,
        title: book.title,
        coverImage: coverImagePath
      }
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update book
router.put('/:id', auth, admin, async (req, res) => {
  try {
    console.log('📝 Updating book:', req.params.id);
    
    // If title is being updated, update slug too
    if (req.body.title) {
      req.body.slug = generateSlug(req.body.title);
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    console.log('✅ Book updated:', book.title);
    res.json(book);
  } catch (error) {
    console.error('❌ Book update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update book with image (for completeness)
router.put('/:id/with-image', auth, admin, upload.single('coverImage'), async (req, res) => {
  try {
    console.log('📝 Updating book with image:', req.params.id);
    
    const updateData = { ...req.body };
    
    // If title is being updated, update slug too
    if (updateData.title) {
      updateData.slug = generateSlug(updateData.title);
    }
    
    // If new image uploaded, update coverImage
    if (req.file) {
      updateData.coverImage = `/uploads/covers/${req.file.filename}`;
    }
    
    // Parse tags if they come as string
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    console.log('✅ Book updated with image:', book.title);
    res.json(book);
  } catch (error) {
    console.error('❌ Book update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE book (soft delete)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    console.log('📝 Deactivating book:', req.params.id);
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    // Update category bookCount
    try {
      await Category.findByIdAndUpdate(
        book.category,
        { $inc: { bookCount: -1 } }
      );
    } catch (updateError) {
      console.log('⚠️ Category count update failed, but book was deactivated');
    }
    
    console.log('✅ Book deactivated:', book.title);
    res.json({ message: 'Book deactivated successfully' });
  } catch (error) {
    console.error('❌ Book delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET books stats (admin only)
router.get('/stats/summary', auth, admin, async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const activeBooks = await Book.countDocuments({ isActive: true });
    const outOfStock = await Book.countDocuments({ stock: 0 });
    const byLanguage = await Book.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalBooks,
      activeBooks,
      outOfStock,
      byLanguage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;