const Budget = require('../utils/schemas/BudgetSchema');


/**
 * Budget Model DAL
 * Handles database operations for Budgets.
 */

/**
 * Creates a new budget.
 * @param {Object} budgetData - Data for the new budget
 * @returns {Promise<Object>} The created budget
 */
/**
 * Generates a new custom ID for the budget.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * @returns {Promise<string>} The new custom ID (e.g., 'B001')
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

    // Error code 11000 means a duplicate key error
    if (error.code === 11000) {
        const err = new Error('Duplicate entry found');
        err.status = 400;
        throw err;
    }

    // ValidationError happens when data doesn't match the schema rules
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
        const budgets = await Budget.find({}, '_id');
        if (budgets.length === 0) {
            return 'B001';
        }

        const ids = budgets.map(budget => {
            const idStr = budget._id.toString();
            const numPart = idStr.substring(1);
            return parseInt(numPart, 10);
        });

        const maxId = Math.max(...ids);
        const nextId = maxId + 1;

        return `B${nextId.toString().padStart(3, '0')}`;
    } catch (error) {
        handleDbError(error);
    }
};

const createOne = async (budgetData) => {
    try {
        const customId = await generateId();

        const budget = new Budget({
            _id: customId,
            ...budgetData,
        });
        return await budget.save();
    } catch (error) {
        handleDbError(error);
    }
};

const findOne = async (query) => {
    try {
        return await Budget.findOne(query);
    } catch (error) {
        handleDbError(error);
    }
};

const findOneAndUpdate = async (query, update, options) => {
    try {
        return await Budget.findOneAndUpdate(query, update, options);
    } catch (error) {
        handleDbError(error);
    }
};

module.exports = { createOne, findOne, findOneAndUpdate };
