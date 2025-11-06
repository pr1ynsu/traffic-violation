// backend/middleware/auth.js (Fixed Version)

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    try {
        token = token.slice(7);
        const JWT_SECRET = process.env.JWT_SECRET || 'please_change_this';
        const decoded = jwt.verify(token, JWT_SECRET);

        // ✅ Directly use the decoded payload
        req.user = decoded;  

        next(); 
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Token is not valid.' });
    }
};

module.exports = { authMiddleware };
