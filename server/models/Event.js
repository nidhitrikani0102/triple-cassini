const Event = require('../utils/schemas/EventSchema');


/**
 * Event Model DAL
 * Handles database operations for Events.
 */

/**
 * Creates a new event.
 * @param {Object} eventData - Data for the new event
 * @returns {Promise<Object>} The created event
 */
/**
 * Generates a new custom ID for the event.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * @returns {Promise<string>} The new custom ID (e.g., 'E001')
 */
/**
 * Helper function to handle database errors.
 * It checks the type of error (e.g., duplicate key, validation error)
 * and throws a standardized Error object with a status code.
 * 
 * @param {Object} error - The error object from Mongoose
 */
const handleDbError = (error) => {
    console.error('Database Error:', error);

    // CastError happens when the ID is not in the correct format
    if (error.name === 'CastError') {
        const err = new Error('Invalid ID format');
        err.status = 400; // Bad Request
        throw err;
    }

    // Error code 11000 means a duplicate key error (e.g., two events with same unique field)
    if (error.code === 11000) {
        const err = new Error('Duplicate entry found');
        err.status = 400;
        throw err;
    }

    // ValidationError happens when data doesn't match the schema rules (e.g., missing required field)
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        const err = new Error(messages.join(', '));
        err.status = 400;
        throw err;
    }

    // For any other unknown errors, return a generic 500 Server Error
    const err = new Error('Server Error');
    err.status = 500;
    throw err;
};

const generateId = async () => {
    try {
        const events = await Event.find({}, '_id');
        if (events.length === 0) {
            return 'E001';
        }

        const ids = events.map(event => {
            const idStr = event._id.toString();
            const numPart = idStr.substring(1);
            return parseInt(numPart, 10);
        });

        const maxId = Math.max(...ids);
        const nextId = maxId + 1;

        return `E${nextId.toString().padStart(3, '0')}`;
    } catch (error) {
        handleDbError(error);
    }
};

const createOne = async (eventData) => {
    try {
        const customId = await generateId();

        const event = new Event({
            _id: customId,
            ...eventData,
        });
        return await event.save();
    } catch (error) {
        handleDbError(error);
    }
};

const find = async (query) => {
    try {
        return await Event.find(query);
    } catch (error) {
        handleDbError(error);
    }
};

const findById = async (id) => {
    try {
        return await Event.findById(id);
    } catch (error) {
        handleDbError(error);
    }
};

const findByIdAndUpdate = async (id, update, options) => {
    try {
        return await Event.findByIdAndUpdate(id, update, options);
    } catch (error) {
        handleDbError(error);
    }
};

const countDocuments = async (query) => {
    try {
        return await Event.countDocuments(query);
    } catch (error) {
        handleDbError(error);
    }
};

module.exports = { createOne, find, findById, findByIdAndUpdate, countDocuments };
