const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateUser, 
  getAllUsers 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update', protect, updateUser);

// Admin routes
router.get('/', protect, authorize('ADMIN'), getAllUsers);

module.exports = router;