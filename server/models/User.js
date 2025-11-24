const User = require('../utils/schemas/UserSchema');



/**
 * User Model DAL (Data Access Layer)
 * Handles all direct database interactions for the User collection.
 * Wraps Mongoose methods in try-catch blocks for standardized error handling.
 */

/**
 * Creates a new user document in the database.
 * @param {Object} userData - The data for the new user (name, email, password, etc.)
 * @returns {Promise<Object>} The created user document
 */
/**
 * Generates a new custom ID for the user.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * Example: If U005 exists, it returns U006.
 * 
 * @returns {Promise<string>} The new custom ID (e.g., 'U001')
 */
const generateId = async () => {
    try {
        // Find all users and only select their _id field
        const users = await User.find({}, '_id');

        // If no users exist, start with U001
        if (users.length === 0) {
            return 'U001';
        }

        // Extract numbers from existing IDs (e.g., "U005" -> 5)
        const ids = users.map(user => {
            const idStr = user._id.toString();
            const numPart = idStr.substring(1); // Remove the 'U'
            return parseInt(numPart, 10); // Convert to integer
        });

        // Find the highest number
        const maxId = Math.max(...ids);

        // Add 1 to get the next ID
        const nextId = maxId + 1;

        // Format back to string with leading zeros (e.g., 6 -> "U006")
        return `U${nextId.toString().padStart(3, '0')}`;
    } catch (error) {
        throw new Error(`Error generating ID: ${error.message}`);
    }
};

/**
 * Creates a new user document in the database.
 * This function handles the custom ID generation automatically.
 * 
 * @param {Object} userData - The data for the new user (name, email, password, etc.)
 * @returns {Promise<Object>} The created user document
 */
const createOne = async (userData) => {
    try {
        // Step 1: Generate a unique custom ID
        const customId = await generateId();

        // Step 2: Create a new User instance with the custom ID and provided data
        const user = new User({
            _id: customId,
            ...userData,
        });

        // Step 3: Save the user to the database
        return await user.save();
    } catch (error) {
        // Wrap any database errors in a standardized Error object
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findOne = async (query) => {
    try {
        return await User.findOne(query);
    } catch (error) {
        if (error.name === 'DocumentNotFoundError') return null;
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findById = async (id) => {
    try {
        return await User.findOne({ _id: id });
    } catch (error) {
        if (error.name === 'DocumentNotFoundError') return null;
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findByIdAndDelete = async (id) => {
    try {
        return await User.findOneAndDelete({ _id: id });
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const find = async (query) => {
    try {
        return await User.find(query);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findWithSelect = async (query, select) => {
    try {
        return await User.find(query).select(select);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findOneWithSelect = async (query, select) => {
    try {
        return await User.findOne(query).select(select);
    } catch (error) {
        if (error.name === 'DocumentNotFoundError') return null;
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

module.exports = { createOne, findOne, findById, find, findByIdAndDelete, findWithSelect, findOneWithSelect };
