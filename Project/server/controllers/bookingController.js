const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create a booking (customer only)
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { service: serviceId, date, time, address, city, notes } = req.body;

    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    // Prevent booking own service
    if (service.provider._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot book your own service.' });
    }

    const booking = await Booking.create({
      customer: req.user._id,
      provider: service.provider._id,
      service: serviceId,
      date,
      time,
      address,
      city,
      notes,
      totalPrice: service.price,
      status: 'pending'
    });

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .populate('service', 'title price priceType');

    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully! The provider will respond soon.',
      booking: populated 
    });
  } catch (error) {
    console.error('CreateBooking error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get my bookings (customer or provider)
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // Customer sees their bookings, provider sees bookings for them
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'provider') {
      query.provider = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all
    }

    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate('service', 'title price priceType category city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('GetMyBookings error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update booking status (provider only)
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['accepted', 'in-progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Provider can update their bookings, customer can only cancel
    if (req.user.role === 'provider' && booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (req.user.role === 'customer') {
      if (booking.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Customers can only cancel bookings.' });
      }
    }

    // Status transition validation
    const transitions = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!transitions[booking.status].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot change status from "${booking.status}" to "${status}".` 
      });
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('customer', 'name email phone avatar')
      .populate('provider', 'name email phone avatar')
      .populate('service', 'title price priceType');

    res.json({ 
      success: true, 
      message: `Booking ${status} successfully!`,
      booking: updated 
    });
  } catch (error) {
    console.error('UpdateBookingStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
