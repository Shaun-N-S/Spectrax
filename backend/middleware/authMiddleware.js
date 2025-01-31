const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyAccessToken = async (req, res, next) => {
  // Check both cookies and Authorization header
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    
    const user = await User.findById(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check user status
    if (user.status === 'blocked') {
      return res.status(403).json({ 
        message: 'Account is not active. Please contact support.' 
      });
    }

    req.user = decoded;
    // Also attach the full user object if needed
    req.userDetails = user;
    
    next();
  } catch (error) {
    console.error('Access token error:', error);
    res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

module.exports = { verifyAccessToken };