const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// ===== PUBLIC ROUTES =====

// GET all active categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name')
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single category by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('parentCategory', 'name');
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN ONLY ROUTES =====

// POST create category (admin only) - FIXED VERSION
router.post('/', auth, admin, async (req, res) => {
  try {
    console.log('📝 Creating category with user:', req.user);
    
    const { name, description, parentCategory, image } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    // Create new category
    const category = new Category({
      name,
      description: description || '',
      parentCategory: parentCategory || null,
      image: image || '/uploads/default-category.jpg',
      createdBy: req.user.userId
    });
    
    await category.save();
    console.log('✅ Category created:', category.name);
    
    res.status(201).json(category);
  } catch (error) {
    console.error('❌ Category creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT update category (admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    console.log('📝 Updating category:', req.params.id);
    
    const { name, description, parentCategory, image, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        parentCategory: parentCategory || null,
        image,
        isActive
      },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('✅ Category updated:', category.name);
    res.json(category);
  } catch (error) {
    console.error('❌ Category update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE category (soft delete - admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    console.log('📝 Deactivating category:', req.params.id);
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('✅ Category deactivated:', category.name);
    res.json({ message: 'Category deactivated successfully', category });
  } catch (error) {
    console.error('❌ Category delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Hard delete (permanent - admin only, use carefully)
router.delete('/:id/permanent', auth, admin, async (req, res) => {
  try {
    console.log('⚠️ Permanently deleting category:', req.params.id);
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('✅ Category permanently deleted:', category.name);
    res.json({ message: 'Category permanently deleted' });
  } catch (error) {
    console.error('❌ Permanent delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;