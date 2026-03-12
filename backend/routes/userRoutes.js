const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// ===== PUBLIC ROUTES =====
// Get all users (public - shows only basic info)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('name email role createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user (public)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email role createdAt');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN ONLY ROUTES =====

// Get all users with full details (admin only)
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'author', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete/deactivate user (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;