const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

/**
 * Middleware to protect routes that require authentication
 * @route - Any protected route
 * @access - Private
 */

/**
 * Middleware to protect routes that require authentication
 * @route - Any protected route
 * @access - Private
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Auth Headers:', req.headers.authorization);

  // Check if authorization header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted:', token ? 'Token found' : 'Token empty or undefined');
  }

  // Check if token exists
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Log JWT secret presence (don't log the actual secret!)
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Support both id and userId in the token payload for backward compatibility
    const userId = decoded.id || decoded.userId;
    console.log('User ID extracted:', userId);

    if (!userId) {
      console.log('No user ID found in token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Get user from the token
    const user = await User.findById(userId);
    console.log('User found:', !!user);

    // Check if user exists
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(401).json({
        success: false,
        message: 'User not found or token is no longer valid'
      });
    }

    // Add user to request object
    req.user = user;
    console.log('User attached to request');

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
});


/**
 * Middleware to restrict access based on user role
 * @param {...string} roles - Roles that are allowed to access the route
 * @returns {function} - Middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Protected route accessed without user authentication'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Alternative token authentication middleware
 */
exports.authenticateToken = asyncHandler(async (req, res, next) => {
  // 1. Check if authorization header exists
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  // 2. Extract the token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user
    const user = await User.findById(decoded.id);

    // 5. Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or token is no longer valid'
      });
    }

    // 6. Add user data to request object (full user object for consistency with protect middleware)
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});