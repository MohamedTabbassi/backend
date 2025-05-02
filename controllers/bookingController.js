const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Service = require('../models/serviceModel');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Client)
exports.createBooking = asyncHandler(async (req, res) => {
  const { serviceId, bookingDate, notes } = req.body;

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return res.status(404).json({ success: false, message: "Service not found" });
  }

  // Check if service is available
  if (!service.available) {
    return res.status(400).json({ success: false, message: "Service is not available" });
  }

  // Create booking
  const booking = await Booking.create({
    clientId: req.user.userId,
    serviceId,
    bookingDate,
    notes,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: booking
  });
});

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('clientId', 'name email')
    .populate('serviceId', 'name price');
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get client's bookings
// @route   GET /api/bookings/client
// @access  Private (Client)
exports.getClientBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ clientId: req.user.userId })
    .populate('serviceId', 'name price duration')
    .sort({ bookingDate: -1 });
  
  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Service Provider)
exports.getProviderBookings = asyncHandler(async (req, res) => {
  // Find services owned by provider
  const services = await Service.find({ userId: req.user.userId });
  const serviceIds = services.map(service => service._id);

  const bookings = await Booking.find({ serviceId: { $in: serviceIds } })
    .populate('clientId', 'name email phone')
    .populate('serviceId', 'name')
    .sort({ bookingDate: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('clientId', 'name email phone')
    .populate('serviceId', 'name price userId');

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  // Authorization check
  if (req.user.role === 'CLIENT' && booking.clientId._id.toString() !== req.user.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  if (req.user.role === 'SERVICE_USER' && booking.serviceId.userId.toString() !== req.user.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Provider/Admin)
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id).populate('serviceId', 'userId');

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  // Check if user is service provider or admin
  if (req.user.role === 'SERVICE_USER' && booking.serviceId.userId.toString() !== req.user.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  booking.status = status;
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id).populate('serviceId', 'userId');

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  // Authorization logic
  if (req.user.role === 'CLIENT') {
    if (booking.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    // Clients can only update notes
    const { notes } = req.body;
    booking.notes = notes;
  } else if (req.user.role === 'SERVICE_USER') {
    if (booking.serviceId.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    // Providers can update status and notes
    const { status, notes } = req.body;
    if (status) booking.status = status;
    if (notes) booking.notes = notes;
  }

  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  // Only client or admin can delete
  if (req.user.role !== 'ADMIN' && booking.clientId.toString() !== req.user.userId) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  await booking.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get bookings by user ID
// @route   GET /api/bookings/user/:userId
// @access  Private (Admin)
exports.getBookingsByUser = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ clientId: req.params.userId })
    .populate('serviceId', 'name price')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Get bookings by service ID
// @route   GET /api/bookings/service/:serviceId
// @access  Private (Provider/Admin)
exports.getBookingsByService = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ serviceId: req.params.serviceId })
    .populate('clientId', 'name email')
    .sort({ bookingDate: -1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});