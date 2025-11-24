const express = require('express');
const router = express.Router();
const budgetService = require('../services/budgetService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Budget Routes
 * Handles budget management for events.
 * Base URL: /api/budget
 */

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @route   GET /api/budget/:eventId
 * @desc    Get budget for an event
 * @access  Private
 */
router.get('/:eventId', async (req, res, next) => {
    try {
        const budget = await budgetService.getBudget(req.params.eventId, req.user._id);
        res.json(budget);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/budget/:eventId
 * @desc    Update total budget
 * @access  Private
 */
router.put('/:eventId', async (req, res, next) => {
    try {
        const { totalBudget } = req.body;
        const budget = await budgetService.updateBudget(req.params.eventId, totalBudget, req.user._id);
        res.json(budget);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/budget/:eventId/expenses
 * @desc    Add an expense to the budget
 * @access  Private
 */
router.post('/:eventId/expenses', async (req, res, next) => {
    try {
        const budget = await budgetService.addExpense(req.params.eventId, req.body, req.user._id);

        // Calculate remaining budget for alert
        const totalSpent = budget.expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const remaining = budget.totalBudget - totalSpent;
        const alert = remaining < 0;

        res.json({
            budget,
            alert,
            remaining
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
