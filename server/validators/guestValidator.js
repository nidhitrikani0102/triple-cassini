/**
 * Guest Validator
 * Validates guest data.
 */

/**
 * Validates guest addition data.
 * @param {Object} data - Guest data
 * @returns {Array} List of error messages
 */
const validateGuest = (data) => {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
        errors.push('Guest name is required');
    }

    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
        errors.push('Valid guest email is required');
    }

    return errors;
};

module.exports = { validateGuest };
