const employee = (req, res, next) => {
    // Check if user exists and has a valid role
    if (!req.user || !['employee', 'hr', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Valid user role required.' });
    }
    next();
};

module.exports = employee; 