require('dotenv').config(); // Correct dotenv configuration
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to verify the user
const verifyUser = async (req, res, next) => {
  let token = req.cookies?.token; // Correct access to cookies

  if (token) {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user and exclude the password field
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach the user to the request object
      req.user = user;

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { verifyUser };
