const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const bcrypt = require('bcryptjs');

/**
 * Admin Service
 * Handles administrative tasks like managing users.
 */

/**
 * Retrieves all regular users.
 * This is used by the Admin Dashboard to show a list of all registered users.
 * 
 * @returns {Promise<Array>} List of users with role 'user'
 */
const getAllUsers = async () => {
    try {
        // Find all documents in the User collection where role is 'user'
        // We exclude the 'password' field for security reasons ('-password')
        return await User.findWithSelect({ role: 'user' }, '-password');
    } catch (error) {
        throw error; // Pass any errors to the controller
    }
};

/**
 * Retrieves all vendors with their profile details.
 * This is slightly more complex because vendor data is split across two collections:
 * 1. User collection (basic info like name, email)
 * 2. VendorProfile collection (business details like service type, bio)
 * 
 * @returns {Promise<Array>} List of vendors with their full profiles
 */
const getAllVendors = async () => {
    try {
        // Step 1: Get all users who have the 'vendor' role
        const vendors = await User.findWithSelect({ role: 'vendor' }, '-password');

        // Step 2: For each vendor, fetch their detailed profile from the VendorProfile collection
        // We use Promise.all to run these queries in parallel for better performance
        const vendorsWithProfiles = await Promise.all(vendors.map(async (vendor) => {
            // Find the profile that belongs to this specific user (linked by user ID)
            const profile = await VendorProfile.findOne({ user: vendor._id });

            // Combine the user data and profile data into a single object
            // vendor.toObject() converts the Mongoose document to a plain JavaScript object
            return { ...vendor.toObject(), profile };
        }));

        return vendorsWithProfiles;
    } catch (error) {
        throw error;
    }
};

/**
 * Updates a user's details (including blocking/unblocking and password reset).
 * @param {string} userId - ID of the user
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateUser = async (userId, updateData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }

        if (updateData.name) user.name = updateData.name;
        if (updateData.email) user.email = updateData.email;
        if (typeof updateData.isBlocked === 'boolean') user.isBlocked = updateData.isBlocked;

        // Handle password update
        if (updateData.password && updateData.password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(updateData.password, salt);
        }

        return await user.save();
    } catch (error) {
        throw error;
    }
};

/**
 * Deletes a user and their associated vendor profile (if applicable).
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<Object>} Confirmation message
 */
const deleteUser = async (userId) => {
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }

        // If user was a vendor, delete their profile too
        if (user.role === 'vendor') {
            await VendorProfile.findOneAndDelete({ user: userId });
        }

        return { message: 'User deleted successfully' };
    } catch (error) {
        throw error;
    }
};

module.exports = { getAllUsers, getAllVendors, updateUser, deleteUser };
