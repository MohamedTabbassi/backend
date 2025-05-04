const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByUser
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Fix: Route ordering - specific routes before parameterized routes
// User services route
router.get('/user/:userId', getServicesByUser);

// Standard routes
router.route('/')
  .get(getServices)
  .post(protect, authorize('SERVICE_USER', 'ADMIN'), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('SERVICE_USER', 'ADMIN'), updateService)
  .delete(protect, authorize('SERVICE_USER', 'ADMIN'), deleteService);

module.exports = router;