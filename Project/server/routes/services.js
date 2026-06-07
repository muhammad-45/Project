const express = require('express');
const router = express.Router();
const { 
  getServices, 
  getService, 
  createService, 
  updateService, 
  deleteService,
  getMyServices 
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', getServices);
router.get('/my/services', auth, roleCheck('provider'), getMyServices);
router.get('/:id', getService);

// Provider-only routes
router.post('/', auth, roleCheck('provider'), createService);
router.put('/:id', auth, roleCheck('provider'), updateService);
router.delete('/:id', auth, roleCheck('provider'), deleteService);

module.exports = router;
