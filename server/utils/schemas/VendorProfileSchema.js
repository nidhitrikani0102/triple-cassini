const mongoose = require('mongoose');

/**
 * Vendor Profile Schema
 * Stores additional details for users with the 'vendor' role.
 */
const vendorProfileSchema = new mongoose.Schema({
    _id: {
        type: String, // Changed to String for custom ID (e.g., V001)
        required: true,
    },
    // Reference to the User model (linked by custom String ID)
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    // Type of service provided (e.g., "Photography", "Catering")
    serviceType: {
        type: String,
        required: [true, 'Please add a service type'],
    },
    // Description of services
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    // Pricing information (e.g., "Starts at $500")
    pricing: {
        type: String,
        required: [true, 'Please add pricing info'],
    },
    // Location or service area
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
    // Array of image URLs for the portfolio
    portfolio: [String],
    // Soft delete flag
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
