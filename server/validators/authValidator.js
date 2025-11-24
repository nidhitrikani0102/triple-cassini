/**
 * Auth Validator
 * Validates user authentication data.
 */

/**
 * Validates user registration data.
 * @param {Object} data - Registration data
 * @returns {Array} List of error messages (empty if valid)
 */
const validateRegister = (data) => {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
        errors.push('Name is required');
    }

    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (!data.role || !['user', 'vendor', 'admin'].includes(data.role)) {
        errors.push('Valid role is required (user, vendor, admin)');
    }

    return errors;
};

/**
 * Validates user login data.
 * @param {Object} data - Login data
 * @returns {Array} List of error messages
 */
const validateLogin = (data) => {
    const errors = [];

    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.push('Valid email is required');
    }

    if (!data.password) {
        errors.push('Password is required');
    }

    return errors;
};

module.exports = { validateRegister, validateLogin };
