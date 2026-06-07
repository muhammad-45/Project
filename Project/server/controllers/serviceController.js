const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get all services (with filters)
// @route   GET /api/services
exports.getServices = async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    
    const query = { isActive: true };

    // Filter by category
    if (category) query.category = category;
    
    // Filter by city
    if (city) query.city = { $regex: city, $options: 'i' };
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    if (sort === 'price_high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { 'provider.providerInfo.rating': -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const services = await Service.find(query)
      .populate('provider', 'name avatar city providerInfo.rating providerInfo.totalReviews providerInfo.isVerified')
      .populate('category', 'name icon')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // Only return services from verified providers
    const verifiedServices = services.filter(s => 
      s.provider && s.provider.providerInfo && s.provider.providerInfo.isVerified
    );

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      services: verifiedServices,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('GetServices error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email phone avatar city providerInfo')
      .populate('category', 'name icon description');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.json({ success: true, service });
  } catch (error) {
    console.error('GetService error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create a service (provider only)
// @route   POST /api/services
exports.createService = async (req, res) => {
  try {
    const { title, description, category, price, priceType, city, areas } = req.body;

    const service = await Service.create({
      title,
      description,
      provider: req.user._id,
      category,
      price,
      priceType,
      city,
      areas: areas || []
    });

    const populated = await Service.findById(service._id)
      .populate('provider', 'name avatar city providerInfo')
      .populate('category', 'name icon');

    res.status(201).json({ 
      success: true, 
      message: 'Service created successfully!',
      service: populated 
    });
  } catch (error) {
    console.error('CreateService error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    // Ensure provider owns the service
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this service.' });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('provider', 'name avatar city providerInfo')
      .populate('category', 'name icon');

    res.json({ success: true, service, message: 'Service updated successfully!' });
  } catch (error) {
    console.error('UpdateService error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this service.' });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Service deleted successfully!' });
  } catch (error) {
    console.error('DeleteService error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get services by provider (own services)
// @route   GET /api/services/my/services
exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.json({ success: true, services });
  } catch (error) {
    console.error('GetMyServices error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
