const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getProviders, 
  verifyProvider, 
  getUsers, 
  updateUser 
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require admin role
router.use(auth, roleCheck('admin'));

router.get('/stats', getStats);
router.get('/providers', getProviders);
router.put('/providers/:id/verify', verifyProvider);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

module.exports = router;
