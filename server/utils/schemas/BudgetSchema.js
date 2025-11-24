const mongoose = require('mongoose');

/**
 * Budget Schema
 * Tracks the budget and expenses for an event.
 */
const budgetSchema = new mongoose.Schema({
    _id: {
        type: String, // Changed to String for custom ID (e.g., B001)
        required: true,
    },
    // Reference to the Event (linked by custom String ID)
    event: {
        type: String,
        ref: 'Event',
        required: true,
    },
    // Total budget limit set by the user
    totalBudget: {
        type: Number,
        required: true,
        default: 0,
    },
    // List of individual expenses
    expenses: [
        {
            // Name of the expense item (e.g., "Catering")
            title: { type: String, required: true },
            // Cost of the item
            amount: { type: Number, required: true },
            // Category of the expense
            category: {
                type: String,
                enum: ['Venue', 'Catering', 'Decoration', 'Entertainment', 'Other'],
                required: true
            },
        }
    ],
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Budget', budgetSchema);
