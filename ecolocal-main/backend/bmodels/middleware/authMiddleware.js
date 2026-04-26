// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // ← REQUIRED for DB lookup

// Protect: only allow if valid JWT is sent in Authorization header
const protect = async (req, res, next) => {
  let token;
  
  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from headerss
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token and decode
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 🔧 CRITICAL: Fetch full user from DB (not just JWT payload)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      next();
      
    } catch (error) {
      console.error('🔒 JWT Error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }
};

// isAdmin: only allow if user.role === 'admin'
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: 'Admin access only' 
  });
};

module.exports = { protect, isAdmin };
