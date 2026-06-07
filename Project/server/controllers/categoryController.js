const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, category });
  } catch (error) {
    console.error('GetCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create category (admin)
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({ name, icon, description });
    res.status(201).json({ success: true, category, message: 'Category created successfully!' });
  } catch (error) {
    console.error('CreateCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, category, message: 'Category updated successfully!' });
  } catch (error) {
    console.error('UpdateCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.json({ success: true, message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('DeleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
