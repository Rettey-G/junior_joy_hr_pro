const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../package.json');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwtSecret || 'yourjwtsecretkey');
        
        // Find user
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.active) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Add user to request
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = auth; 