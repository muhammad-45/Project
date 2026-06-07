const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin only
router.post('/', auth, roleCheck('admin'), createCategory);
router.put('/:id', auth, roleCheck('admin'), updateCategory);
router.delete('/:id', auth, roleCheck('admin'), deleteCategory);

module.exports = router;
