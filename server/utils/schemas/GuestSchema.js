const mongoose = require('mongoose');

/**
 * Guest Schema
 * Represents a guest invited to an event.
 */
const guestSchema = new mongoose.Schema({
    _id: {
        type: String, // Changed to String for custom ID (e.g., G001)
        required: true,
    },
    // Reference to the Event (linked by custom String ID)
    event: {
        type: String,
        ref: 'Event',
        required: true,
    },
    // Guest's name
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    // Guest's email
    email: {
        type: String,
        required: [true, 'Please add an email'],
    },
    // Status of the invitation
    isInvited: {
        type: Boolean,
        default: false,
    },
    // Timestamp when the invitation was sent
    invitedAt: {
        type: Date,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Guest', guestSchema);
