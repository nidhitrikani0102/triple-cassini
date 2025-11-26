const mongoose = require('mongoose');

const OtpLogSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Login', 'Reset'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // Automatically delete after 15 minutes (900 seconds)
    }
});

module.exports = OtpLogSchema;
