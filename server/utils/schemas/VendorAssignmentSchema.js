const mongoose = require('mongoose');

const VendorAssignmentSchema = new mongoose.Schema({
    _id: {
        type: String, // Custom ID (e.g., VA001)
    },
    event: {
        type: String, // Custom ID (e.g., E001)
        ref: 'Event',
        required: true
    },
    vendor: {
        type: String, // Custom ID (e.g., V001)
        ref: 'VendorProfile',
        required: true
    },
    client: {
        type: String, // Custom ID (e.g., U001)
        ref: 'User',
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Paid'],
        default: 'Pending'
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VendorAssignment', VendorAssignmentSchema);
