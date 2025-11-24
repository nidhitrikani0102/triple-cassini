const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Budget = require('../utils/schemas/BudgetSchema');
const Event = require('../utils/schemas/EventSchema');
const User = require('../utils/schemas/UserSchema');
const { addExpense } = require('../services/budgetService');

dotenv.config();

const debugBudget = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Find a valid event and user (ensure ID is string)
        const event = await Event.findOne({ _id: { $type: 'string' } });
        if (!event) {
            console.log('No events found to test with.');
            process.exit();
        }
        const userId = event.user;
        console.log(`Testing with Event: ${event.name} (${event._id}) and User: ${userId}`);

        // 2. Test adding valid expense
        const expenseData = {
            title: 'Test Expense',
            amount: 500,
            category: 'Other'
        };

        console.log('Attempting to add expense...');
        try {
            const budget = await addExpense(event._id, expenseData, userId);
            console.log('Success! Budget updated:', budget._id);
            console.log('Expenses count:', budget.expenses.length);
        } catch (err) {
            console.error('Failed to add expense:', err.message);
        }

        // 3. Test adding invalid expense (missing amount)
        const invalidExpense = {
            title: 'Invalid Expense',
            category: 'Other'
        };
        console.log('Attempting to add invalid expense...');
        try {
            await addExpense(event._id, invalidExpense, userId);
        } catch (err) {
            console.log('Caught expected error:', err.message);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugBudget();
