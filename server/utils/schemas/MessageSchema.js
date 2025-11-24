const mongoose = require('mongoose');

/**
 * Message Schema
 * Represents a message exchanged between a user and a vendor.
 */
const messageSchema = new mongoose.Schema({
    _id: {
        type: String, // Changed to String for custom ID (e.g., M001)
        required: true,
    },
    // Sender's User ID (String)
    sender: {
        type: String,
        ref: 'User',
        required: true,
    },
    // Receiver's User ID (String)
    receiver: {
        type: String,
        ref: 'User',
        required: true,
    },
    // Content of the message
    content: {
        type: String,
        required: true,
    },
    // Read status
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Message', messageSchema);
