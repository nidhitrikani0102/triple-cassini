const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        ref: 'VendorAssignment',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'mock_card', 'mock_upi', 'mock_cash'],
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);
