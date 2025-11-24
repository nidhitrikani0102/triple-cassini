/**
 * Budget Validator
 * Validates budget and expense data.
 */

/**
 * Validates budget update data.
 * @param {Object} data - Budget data
 * @returns {Array} List of error messages
 */
const validateBudgetUpdate = (data) => {
    const errors = [];

    if (data.totalBudget === undefined || data.totalBudget === null || data.totalBudget < 0) {
        errors.push('Valid total budget amount is required');
    }

    return errors;
};

/**
 * Validates expense data.
 * @param {Object} data - Expense data
 * @returns {Array} List of error messages
 */
const validateExpense = (data) => {
    const errors = [];

    if (!data.title || data.title.trim() === '') {
        errors.push('Expense title is required');
    }

    if (data.amount === undefined || data.amount === null || data.amount <= 0) {
        errors.push('Valid expense amount is required');
    }

    if (!data.category || data.category.trim() === '') {
        errors.push('Expense category is required');
    }

    return errors;
};

module.exports = { validateBudgetUpdate, validateExpense };
