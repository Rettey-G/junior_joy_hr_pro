const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../package.json');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Authentication failed',
                error: 'No token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(
                token, 
                process.env.JWT_SECRET || config.config.jwtSecret || 'yourjwtsecretkey'
            );
            
            // Determine userId from token payload
            const userId = decoded._id || decoded.id || decoded.userId;
            if (!userId) {
                return res.status(401).json({
                    message: 'Authentication failed',
                    error: 'Invalid token payload'
                });
            }
            // Find user by ID
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(401).json({ 
                    message: 'Authentication failed',
                    error: 'User not found'
                });
            }

            if (!user.active) {
                return res.status(401).json({ 
                    message: 'Authentication failed',
                    error: 'Account is deactivated'
                });
            }

            // Add user to request
            req.user = user;
            req.token = token;
            
            next();
        } catch (err) {
            return res.status(401).json({ 
                message: 'Authentication failed',
                error: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: 'Internal server error during authentication'
        });
    }
};

module.exports = auth; 