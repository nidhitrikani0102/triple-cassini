const Budget = require('../models/Budget');
const Event = require('../models/Event');
const { validateBudgetUpdate, validateExpense } = require('../validators/budgetValidator');

/**
 * Budget Service
 * Handles budget management for events.
 */

/**
 * Retrieves the budget for a specific event.
 * Ensures that only the event owner can view the budget.
 * 
 * @param {string} eventId - ID of the event
 * @param {string} userId - ID of the requesting user (for authorization)
 * @returns {Promise<Object>} The budget document
 */
const getBudget = async (eventId, userId) => {
    try {
        // Step 1: Verify that the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        // Step 2: Check if the requesting user is the owner of the event
        // We convert the ObjectId to a string for comparison
        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401; // Unauthorized
            throw err;
        }

        // Step 3: Find the budget associated with this event
        const budget = await Budget.findOne({ event: eventId });
        if (!budget) {
            const err = new Error('Budget not found');
            err.status = 404;
            throw err;
        }

        return budget;
    } catch (error) {
        throw error;
    }
};

/**
 * Updates the total budget amount.
 * @param {string} eventId - ID of the event
 * @param {number} totalBudget - New total budget amount
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Object>} Updated budget
 */
const updateBudget = async (eventId, totalBudget, userId) => {
    try {
        // Validate budget data
        const errors = validateBudgetUpdate({ totalBudget });
        if (errors.length > 0) {
            const err = new Error(errors.join(', '));
            err.status = 400;
            throw err;
        }

        // Verify event ownership
        const event = await Event.findById(eventId);
        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401;
            throw err;
        }

        // Check if budget exists
        let budget = await Budget.findOne({ event: eventId });

        if (!budget) {
            // Create new budget using DAL to ensure custom ID
            budget = await Budget.createOne({
                event: eventId,
                totalBudget,
                expenses: []
            });
        } else {
            // Update existing budget
            budget = await Budget.findOneAndUpdate(
                { event: eventId },
                { totalBudget },
                { new: true }
            );
        }

        return budget;
    } catch (error) {
        throw error;
    }
};

/**
 * Adds an expense to the budget.
 * @param {string} eventId - ID of the event
 * @param {Object} expenseData - Details of the expense (title, amount, category)
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Object>} Updated budget with new expense
 */
const addExpense = async (eventId, expenseData, userId) => {
    try {
        // Validate expense data
        const errors = validateExpense(expenseData);
        if (errors.length > 0) {
            const err = new Error(errors.join(', '));
            err.status = 400;
            throw err;
        }

        // Verify event ownership
        const event = await Event.findById(eventId);
        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401;
            throw err;
        }

        // Check if budget exists first
        let budget = await Budget.findOne({ event: eventId });

        if (!budget) {
            // Create new budget with this expense
            budget = await Budget.createOne({
                event: eventId,
                totalBudget: 0,
                expenses: [expenseData]
            });
        } else {
            // Add expense to existing budget
            budget = await Budget.findOneAndUpdate(
                { event: eventId },
                { $push: { expenses: expenseData } },
                { new: true }
            );
        }

        return budget;
    } catch (error) {
        throw error;
    }
};

module.exports = { getBudget, updateBudget, addExpense };
