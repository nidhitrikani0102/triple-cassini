/**
 * Event Validator
 * Validates event data.
 */

/**
 * Validates event creation/update data.
 * @param {Object} data - Event data
 * @returns {Array} List of error messages
 */
/**
 * Validates event creation/update data.
 * Checks for required fields and ensures dates are valid (not in the past).
 * 
 * @param {Object} data - Event data (name, date, time, location, etc.)
 * @returns {Array} List of error messages (empty if valid)
 */
const validateEvent = (data) => {
    const errors = [];

    // Check if name is provided
    if (!data.name || data.name.trim() === '') {
        errors.push('Event name is required');
    }

    // Check if date is provided and valid
    if (!data.date) {
        errors.push('Event date is required');
    } else {
        const eventDate = new Date(data.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time part to compare dates only

        if (isNaN(eventDate.getTime())) {
            errors.push('Invalid event date');
        } else if (eventDate < now) {
            errors.push('Event date cannot be in the past');
        } else if (data.time) {
            // If date is today, check if the time is in the past
            const [hours, minutes] = data.time.split(':');
            const eventDateTime = new Date(data.date);
            eventDateTime.setHours(hours, minutes);

            if (eventDateTime < new Date()) {
                errors.push('Event time cannot be in the past');
            }
        }
    }

    // Check if location is provided
    if (!data.location || data.location.trim() === '') {
        errors.push('Event location is required');
    }

    return errors;
};

module.exports = { validateEvent };
