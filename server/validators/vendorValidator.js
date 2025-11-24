/**
 * Vendor Validator
 * Validates vendor profile data.
 */

/**
 * Validates vendor profile data.
 * @param {Object} data - Profile data
 * @returns {Array} List of error messages
 */
const validateVendorProfile = (data) => {
    const errors = [];

    // businessName is not in the schema, so we remove this validation
    // if (!data.businessName || data.businessName.trim() === '') {
    //     errors.push('Business name is required');
    // }

    if (!data.serviceType || data.serviceType.trim() === '') {
        errors.push('Service type is required');
    }

    if (!data.description || data.description.trim() === '') {
        errors.push('Description is required');
    }

    if (data.pricing && data.pricing < 0) {
        errors.push('Pricing cannot be negative');
    }

    return errors;
};

module.exports = { validateVendorProfile };
