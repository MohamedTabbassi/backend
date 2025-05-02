const asyncHandler = require('express-async-handler');
const { Service, Remorquage, PieceAuto, Mecanique, LocationVoiture, ServiceCategories } = require('../models/serviceModel');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = asyncHandler(async (req, res) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Service.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Service.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const services = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: services.length,
    pagination,
    data: services
  });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error(`Service not found with id of ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private
exports.createService = asyncHandler(async (req, res) => {
  // Add user to req.body
  req.body.userId = req.user.id;

  // Check for category and create appropriate service type
  const { category } = req.body;

  let service;

  switch (category) {
    case ServiceCategories.REMORQUAGE:
      service = await Remorquage.create(req.body);
      break;
    case ServiceCategories.PIECE_AUTO:
      service = await PieceAuto.create(req.body);
      break;
    case ServiceCategories.MECANIQUE:
      service = await Mecanique.create(req.body);
      break;
    case ServiceCategories.LOCATION_VOITURE:
      service = await LocationVoiture.create(req.body);
      break;
    default:
      service = await Service.create(req.body);
  }

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error(`Service not found with id of ${req.params.id}`);
  }

  // Make sure user is service owner
  if (service.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(401);
    throw new Error(`User ${req.user.id} is not authorized to update this service`);
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error(`Service not found with id of ${req.params.id}`);
  }

  // Make sure user is service owner
  if (service.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(401);
    throw new Error(`User ${req.user.id} is not authorized to delete this service`);
  }

  await service.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get services by user
// @route   GET /api/services/user/:userId
// @access  Public
exports.getServicesByUser = asyncHandler(async (req, res) => {
  const services = await Service.find({ userId: req.params.userId });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});