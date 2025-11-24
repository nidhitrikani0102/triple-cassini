/**
 * Role Middleware
 * Handles role-based access control.
 */

/**
 * Restricts access to specific user roles.
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'vendor')
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            const err = new Error(`User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`);
            err.status = 403; // Forbidden
            next(err);
        }
        next();
    };
};

module.exports = { authorize };
