// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.header('Authorization');

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  try {
    token = token.slice(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info directly (not nested under .user)
    req.user = decoded; 
    next();

  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

// ✅ Correct export
module.exports = { protect };
