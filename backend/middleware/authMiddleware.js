const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Access token error:', error);
    res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

module.exports = { verifyAccessToken };
