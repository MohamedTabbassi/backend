const mongoose = require('mongoose');

const OrderStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const orderItemSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Please provide a product name']
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide a quantity'],
    min: 1
  },
  unitPrice: {
    type: Number,
    required: [true, 'Please provide a unit price']
  }
});

const orderSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: [true, 'Please provide a total price']
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);