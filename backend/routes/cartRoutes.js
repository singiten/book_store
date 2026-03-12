const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// ===== ALL CART ROUTES REQUIRE AUTHENTICATION =====

// GET user's cart
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching cart for user:', req.user.userId);
    
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate({
        path: 'items.book',
        select: 'title author coverImage priceETB slug stock'
      });
    
    // If no cart exists, return empty cart
    if (!cart) {
      return res.json({
        items: [],
        total: 0,
        message: 'Cart is empty'
      });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// ADD item to cart
router.post('/add', auth, async (req, res) => {
  try {
    console.log('Adding to cart - User:', req.user.userId);
    console.log('Request body:', req.body);
    
    const { bookId, quantity = 1 } = req.body;
    
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    
    // Validate book exists and is active
    const book = await Book.findOne({ _id: bookId, isActive: true });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    console.log('Book found:', book.title, 'Stock:', book.stock);
    
    // Check stock
    if (book.stock < quantity) {
      return res.status(400).json({ 
        error: `Only ${book.stock} copies available in stock` 
      });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      console.log('Creating new cart for user');
      // Create new cart
      cart = new Cart({
        user: req.user.userId,
        items: []
      });
    }
    
    // Check if book already in cart
    const itemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );
    
    if (itemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      
      // Check stock for total quantity
      if (book.stock < newQuantity) {
        return res.status(400).json({ 
          error: `Cannot add ${quantity} more. You already have ${cart.items[itemIndex].quantity} in cart. Total would exceed stock.` 
        });
      }
      
      cart.items[itemIndex].quantity = newQuantity;
      console.log('Updated existing item, new quantity:', newQuantity);
    } else {
      // Add new item
      cart.items.push({
        book: bookId,
        quantity,
        price: book.priceETB
      });
      console.log('Added new item to cart');
    }
    
    // Calculate total manually (no pre-save hook)
    let total = 0;
    for (let i = 0; i < cart.items.length; i++) {
      total += cart.items[i].price * cart.items[i].quantity;
    }
    cart.total = total;
    cart.updatedAt = Date.now();
    
    await cart.save();
    console.log('Cart saved successfully with total:', total);
    
    // Populate book details before sending response
    await cart.populate({
      path: 'items.book',
      select: 'title author coverImage priceETB slug stock'
    });
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('❌ Cart add error:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE item quantity
router.put('/update/:bookId', auth, async (req, res) => {
  try {
    console.log('Updating cart item - User:', req.user.userId);
    console.log('Book ID:', req.params.bookId);
    console.log('New quantity:', req.body.quantity);
    
    const { quantity } = req.body;
    const { bookId } = req.params;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    
    const cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.book.toString() === bookId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    // Check stock
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    if (book.stock < quantity) {
      return res.status(400).json({ 
        error: `Only ${book.stock} copies available in stock` 
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    
    // Recalculate total
    let total = 0;
    for (let i = 0; i < cart.items.length; i++) {
      total += cart.items[i].price * cart.items[i].quantity;
    }
    cart.total = total;
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    await cart.populate({
      path: 'items.book',
      select: 'title author coverImage priceETB slug stock'
    });
    
    res.json(cart);
  } catch (error) {
    console.error('❌ Cart update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// REMOVE item from cart
router.delete('/remove/:bookId', auth, async (req, res) => {
  try {
    console.log('Removing item from cart - User:', req.user.userId);
    console.log('Book ID:', req.params.bookId);
    
    const cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.book.toString() !== req.params.bookId
    );
    
    if (cart.items.length === initialLength) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    // Recalculate total
    let total = 0;
    for (let i = 0; i < cart.items.length; i++) {
      total += cart.items[i].price * cart.items[i].quantity;
    }
    cart.total = total;
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    await cart.populate({
      path: 'items.book',
      select: 'title author coverImage priceETB slug stock'
    });
    
    console.log('Item removed successfully');
    res.json(cart);
  } catch (error) {
    console.error('❌ Cart remove error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CLEAR cart
router.delete('/clear', auth, async (req, res) => {
  try {
    console.log('Clearing cart for user:', req.user.userId);
    
    const cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = [];
    cart.total = 0;
    cart.updatedAt = Date.now();
    await cart.save();
    
    console.log('Cart cleared successfully');
    res.json({ 
      message: 'Cart cleared successfully', 
      items: [], 
      total: 0 
    });
  } catch (error) {
    console.error('❌ Cart clear error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET cart count (number of items)
router.get('/count', auth, async (req, res) => {
  try {
    console.log('Getting cart count for user:', req.user.userId);
    
    const cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart || cart.items.length === 0) {
      return res.json({ count: 0 });
    }
    
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ count });
  } catch (error) {
    console.error('❌ Cart count error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;