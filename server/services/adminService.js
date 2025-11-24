const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const bcrypt = require('bcryptjs');

/**
 * Admin Service
 * Handles administrative tasks like managing users.
 */

/**
 * Retrieves all regular users.
 * @returns {Promise<Array>} List of users with role 'user'
 */
const getAllUsers = async () => {
    try {
        return await User.findWithSelect({ role: 'user' }, '-password');
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves all vendors with their profile details.
 * @returns {Promise<Array>} List of vendors
 */
const getAllVendors = async () => {
    try {
        const vendors = await User.findWithSelect({ role: 'vendor' }, '-password');
        // Manually populate vendor profiles since they are in a separate collection
        const vendorsWithProfiles = await Promise.all(vendors.map(async (vendor) => {
            const profile = await VendorProfile.findOne({ user: vendor._id });
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
