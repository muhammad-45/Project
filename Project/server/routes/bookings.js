const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('customer'), createBooking);
router.get('/my', auth, getMyBookings);
router.put('/:id/status', auth, roleCheck('provider', 'customer'), updateBookingStatus);

module.exports = router;
