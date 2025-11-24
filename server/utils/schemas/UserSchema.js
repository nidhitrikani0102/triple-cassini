const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Defines the structure for user data in the database.
 */
const userSchema = new mongoose.Schema({
    _id: {
        type: String, // Changed to String for custom ID (e.g., U001)
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, // Ensures no two users have the same email
    },
    // Encrypted password
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    // User role: 'user' (default), 'admin', or 'vendor'
    role: {
        type: String,
        enum: ['user', 'admin', 'vendor'],
        default: 'user',
    },
    // Account status: blocked users cannot log in
    isBlocked: {
        type: Boolean,
        default: false,
    },
    // One-Time Password for 2FA or password reset
    otp: String,
    // Expiration time for the OTP
    otpExpires: Date,
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

/**
 * Pre-save Middleware
 * Automatically hashes the password before saving the user document.
 * This runs before .save() and .create()
 */
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        next();
    }
    // Generate a salt (random data) to strengthen the hash
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Method: matchPassword
 * Compares a plain text password (entered by user) with the hashed password in DB.
 * @param {string} enteredPassword - The password to check
 * @returns {boolean} - True if passwords match, False otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
