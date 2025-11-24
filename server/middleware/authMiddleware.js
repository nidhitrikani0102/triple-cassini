const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Auth Middleware
 * Handles user authentication and role-based access control.
 */

/**
 * Protects routes by verifying the JWT token.
 * Attaches the user object to the request if valid.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token using findOneWithSelect to avoid ObjectId casting and select issues
            req.user = await User.findOneWithSelect({ _id: decoded.id }, '-password');

            if (!req.user) {
                const err = new Error('Not authorized, user not found');
                err.status = 401;
                throw err;
            }

            next();
        } catch (error) {
            console.error(error);
            // If the error has a status (e.g. from User DAL), use it
            if (error.status) {
                next(error);
            } else {
                const err = new Error('Not authorized, token failed');
                err.status = 401;
                next(err);
            }
        }
    }

    if (!token) {
        const err = new Error('Not authorized, no token');
        err.status = 401;
        next(err);
    }
};

/**
 * Restricts access to admin users only.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        const err = new Error('Not authorized as an admin');
        err.status = 403; // Forbidden
        next(err);
    }
};

/**
 * Restricts access to vendor users only.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const vendor = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next();
    } else {
        const err = new Error('Not authorized as a vendor');
        err.status = 403; // Forbidden
        next(err);
    }
};

module.exports = { protect, admin, vendor };
