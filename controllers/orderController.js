const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
  let query;

  // If user is not admin, show only their orders
  if (req.user.role === 'CLIENT') {
    query = Order.find({ clientId: req.user.id });
  } else {
    // Admin can see all orders
    query = Order.find();
  }

  const orders = await query;

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error(`Order not found with id of ${req.params.id}`);
  }

  // Make sure user is order owner or admin
  if (order.clientId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(401);
    throw new Error(`User ${req.user.id} is not authorized to access this order`);
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  // Add client to req.body
  req.body.clientId = req.user.id;

  // Calculate total price
  if (req.body.items && req.body.items.length > 0) {
    req.body.totalPrice = req.body.items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }

  const order = await Order.create(req.body);

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error(`Order not found with id of ${req.params.id}`);
  }

  // Make sure user is order owner or admin
  if (order.clientId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(401);
    throw new Error(`User ${req.user.id} is not authorized to update this order`);
  }

  // Recalculate total price if items are updated
  if (req.body.items && req.body.items.length > 0) {
    req.body.totalPrice = req.body.items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error(`Order not found with id of ${req.params.id}`);
  }

  // Make sure user is order owner or admin
  if (order.clientId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(401);
    throw new Error(`User ${req.user.id} is not authorized to delete this order`);
  }

  await order.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get orders by user
// @route   GET /api/orders/user/:userId
// @access  Private/Admin
exports.getOrdersByUser = asyncHandler(async (req, res) => {
  const orders = await Order.find({ clientId: req.params.userId });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});