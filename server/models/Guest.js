const Guest = require('../utils/schemas/GuestSchema');


/**
 * Guest Model DAL
 * Handles database operations for Guests.
 */

/**
 * Creates a new guest.
 * @param {Object} guestData - Data for the new guest
 * @returns {Promise<Object>} The created guest
 */
/**
 * Generates a new custom ID for the guest.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * @returns {Promise<string>} The new custom ID (e.g., 'G001')
 */
const handleDbError = (error) => {
    console.error('Database Error:', error);
    if (error.name === 'CastError') {
        const err = new Error('Invalid ID format');
        err.status = 400;
        throw err;
    }
    if (error.code === 11000) {
        const err = new Error('Duplicate entry found');
        err.status = 400;
        throw err;
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        const err = new Error(messages.join(', '));
        err.status = 400;
        throw err;
    }
    const err = new Error('Server Error');
    err.status = 500;
    throw err;
};

const generateId = async () => {
    try {
        const guests = await Guest.find({}, '_id');
        if (guests.length === 0) {
            return 'G001';
        }

        const ids = guests.map(guest => {
            const idStr = guest._id.toString();
            const numPart = idStr.substring(1);
            return parseInt(numPart, 10);
        });

        const maxId = Math.max(...ids);
        const nextId = maxId + 1;

        return `G${nextId.toString().padStart(3, '0')}`;
    } catch (error) {
        handleDbError(error);
    }
};

const createOne = async (guestData) => {
    try {
        const customId = await generateId();

        const guest = new Guest({
            _id: customId,
            ...guestData,
        });
        return await guest.save();
    } catch (error) {
        handleDbError(error);
    }
};

const find = async (query) => {
    try {
        return await Guest.find(query);
    } catch (error) {
        handleDbError(error);
    }
};

const findById = async (id) => {
    try {
        return await Guest.findById(id);
    } catch (error) {
        handleDbError(error);
    }
};

const findWithPopulate = async (query, populatePath, populateSelect) => {
    try {
        return await Guest.find(query).populate(populatePath, populateSelect);
    } catch (error) {
        handleDbError(error);
    }
};

const findWithPagination = async (query, skip, limit) => {
    try {
        return await Guest.find(query).skip(skip).limit(limit);
    } catch (error) {
        handleDbError(error);
    }
};

const countDocuments = async (query) => {
    try {
        return await Guest.countDocuments(query);
    } catch (error) {
        handleDbError(error);
    }
};

module.exports = { createOne, find, findById, findWithPopulate, findWithPagination, countDocuments };
