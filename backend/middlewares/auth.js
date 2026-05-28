const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token received:', token.substring(0, 20) + '...');
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Decoded token:', decoded);
      
      // Handle both userId and id (for flexibility)
      const userId = decoded.userId || decoded.id;
      console.log('👤 Looking for user ID:', userId);
      
      // Find user
      req.user = await User.findById(userId).select('-password');
      console.log('📦 User found:', req.user ? `Yes (${req.user.email})` : 'No');
      
      if (!req.user) {
        console.log('❌ User not found in database');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      console.error('❌ JWT Error:', error.message);
      console.error('Error name:', error.name);
      
      // More specific error messages
      let message = 'Not authorized, token failed';
      if (error.name === 'TokenExpiredError') {
        message = 'Token has expired, please login again';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      }
      
      return res.status(401).json({ 
        message,
        error: error.message 
      });
    }
  } else {
    console.log('❌ No authorization header or invalid format');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔒 Checking role authorization...');
    console.log('User role:', req.user?.role);
    console.log('Required roles:', roles);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ Role authorization failed');
      return res.status(403).json({ 
        message: `Not authorized for this role. Required: ${roles.join(' or ')}` 
      });
    }
    
    console.log('✅ Role authorization passed');
    next();
  };
};

module.exports = {
  protect,
  authorize
};