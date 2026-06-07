const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Category = require('../models/Category');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const verifiedProviders = await User.countDocuments({ role: 'provider', 'providerInfo.isVerified': true });
    const pendingProviders = await User.countDocuments({ role: 'provider', 'providerInfo.isVerified': false });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Category.countDocuments({ isActive: true });

    // Booking status breakdown
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const acceptedBookings = await Booking.countDocuments({ status: 'accepted' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Revenue (sum of completed bookings)
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Monthly bookings for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalProviders,
        verifiedProviders,
        pendingProviders,
        totalServices,
        totalBookings,
        totalCategories,
        totalRevenue,
        bookingStatus: {
          pending: pendingBookings,
          accepted: acceptedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings
        },
        monthlyBookings,
        recentBookings
      }
    });
  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all providers (admin)
// @route   GET /api/admin/providers
exports.getProviders = async (req, res) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    const query = { role: 'provider' };
    
    if (verified === 'true') query['providerInfo.isVerified'] = true;
    if (verified === 'false') query['providerInfo.isVerified'] = false;

    const skip = (Number(page) - 1) * Number(limit);

    const providers = await User.find(query)
      .populate('providerInfo.category', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      providers,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('GetProviders error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Verify/reject provider (admin)
// @route   PUT /api/admin/providers/:id/verify
exports.verifyProvider = async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    provider.providerInfo.isVerified = isVerified;
    await provider.save();

    res.json({ 
      success: true, 
      message: isVerified ? 'Provider verified successfully!' : 'Provider verification revoked.',
      provider 
    });
  } catch (error) {
    console.error('VerifyProvider error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update user (admin) — change role, etc.
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    const updateData = {};

    if (role && ['customer', 'provider', 'admin'].includes(role)) {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user, message: 'User updated successfully!' });
  } catch (error) {
    console.error('UpdateUser error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
