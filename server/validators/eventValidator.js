/**
 * Event Validator
 * Validates event data.
 */

/**
 * Validates event creation/update data.
 * @param {Object} data - Event data
 * @returns {Array} List of error messages
 */
const validateEvent = (data) => {
    const errors = [];

    if (!data.name || data.name.trim() === '') {
        errors.push('Event name is required');
    }

    if (!data.date) {
        errors.push('Event date is required');
    } else {
        const eventDate = new Date(data.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Compare dates only first

        if (isNaN(eventDate.getTime())) {
            errors.push('Invalid event date');
        } else if (eventDate < now) {
            errors.push('Event date cannot be in the past');
        } else if (data.time) {
            // If date is today, check time
            const [hours, minutes] = data.time.split(':');
            const eventDateTime = new Date(data.date);
            eventDateTime.setHours(hours, minutes);

            if (eventDateTime < new Date()) {
                errors.push('Event time cannot be in the past');
            }
        }
    }

    if (!data.location || data.location.trim() === '') {
        errors.push('Event location is required');
    }

    return errors;
};

module.exports = { validateEvent };
