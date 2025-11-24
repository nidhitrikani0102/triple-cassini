const Message = require('../utils/schemas/MessageSchema');


/**
 * Message Model DAL
 * Handles database operations for Messages.
 */

/**
 * Creates a new message.
 * @param {Object} messageData - Data for the new message
 * @returns {Promise<Object>} The created message
 */
/**
 * Generates a new custom ID for the message.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * @returns {Promise<string>} The new custom ID (e.g., 'M001')
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
        const messages = await Message.find({}, '_id');
        if (messages.length === 0) {
            return 'M001';
        }

        const ids = messages.map(msg => {
            const idStr = msg._id.toString();
            const numPart = idStr.substring(1);
            return parseInt(numPart, 10);
        });

        const maxId = Math.max(...ids);
        const nextId = maxId + 1;

        return `M${nextId.toString().padStart(3, '0')}`;
    } catch (error) {
        handleDbError(error);
    }
};

const createOne = async (messageData) => {
    try {
        const customId = await generateId();

        const message = new Message({
            _id: customId,
            ...messageData,
        });
        return await message.save();
    } catch (error) {
        handleDbError(error);
    }
};

const find = async (query) => {
    try {
        return await Message.find(query);
    } catch (error) {
        handleDbError(error);
    }
};

const deleteMany = async (query) => {
    try {
        return await Message.deleteMany(query);
    } catch (error) {
        handleDbError(error);
    }
};

const findPopulated = async (query, populateOptions) => {
    try {
        return await Message.find(query).populate(populateOptions);
    } catch (error) {
        handleDbError(error);
    }
};

const findSorted = async (query, sortOptions) => {
    try {
        return await Message.find(query).sort(sortOptions);
    } catch (error) {
        handleDbError(error);
    }
};

module.exports = { createOne, find, deleteMany, findPopulated, findSorted };
