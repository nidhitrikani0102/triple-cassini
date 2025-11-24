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
/**
 * Protects routes by verifying the JWT token.
 * This middleware ensures that only logged-in users can access specific routes.
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const protect = async (req, res, next) => {
    let token;

    // Check if the Authorization header exists and starts with 'Bearer'
    // Format: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token from the header (remove 'Bearer ' prefix)
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret key
            // This decodes the token and returns the payload (e.g., user ID)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user associated with the token
            // We exclude the password field for security
            req.user = await User.findOneWithSelect({ _id: decoded.id }, '-password');

            if (!req.user) {
                const err = new Error('Not authorized, user not found');
                err.status = 401;
                throw err;
            }

            // Proceed to the next middleware or route handler
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

    // If no token is found in the header
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
