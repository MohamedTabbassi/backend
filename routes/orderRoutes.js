const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  getOrdersByUser
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getOrders)
  .post(protect, authorize('CLIENT'), createOrder);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

router.get('/user/:userId', protect, authorize('ADMIN'), getOrdersByUser);

module.exports = router;