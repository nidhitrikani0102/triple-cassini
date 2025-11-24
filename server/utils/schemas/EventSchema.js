const mongoose = require('mongoose');

/**
 * Event Schema
 * Defines the structure for event data.
 */
const eventSchema = new mongoose.Schema({
    _id: {
        type: String, // Changed to String for custom ID
        required: true,
    },
    user: {
        type: String, // Changed to String to reference custom User ID
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add an event name'],
        trim: true,
    },
    date: {
        type: Date,
        required: [true, 'Please add an event date'],
    },
    time: {
        type: String,
        required: [true, 'Please add an event time'],
    },
    type: {
        type: String,
        required: [true, 'Please select an event type'],
        enum: ['Wedding', 'Birthday', 'Corporate', 'Social', 'Other'],
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
    description: {
        type: String,
    },
    mapLink: {
        type: String,
    },
    organizerName: {
        type: String,
    },
    // Configuration for the custom invitation
    invitationConfig: {
        theme: {
            type: String,
            default: 'classic', // Options: classic, floral, modern, party
        },
        customMessage: {
            type: String,
            default: '',
        },
        showMap: {
            type: Boolean,
            default: true,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Event', eventSchema);
