const VendorProfile = require('../utils/schemas/VendorProfileSchema');
const User = require('../models/User'); // Ensure User model is registered
const { validateVendorProfile } = require('../validators/vendorValidator');

/**
 * Vendor Service
 * Handles vendor profile management.
 */

/**
 * Creates or updates a vendor profile.
 * @param {string} userId - ID of the user
 * @param {Object} profileData - Profile details
 * @returns {Promise<Object>} Updated profile
 */
const createOrUpdateProfile = async (userId, profileData) => {
    try {
        // Validate profile data
        const errors = validateVendorProfile(profileData);
        if (errors.length > 0) {
            const err = new Error(errors.join(', '));
            err.status = 400;
            throw err;
        }

        let profile = await VendorProfile.findOne({ user: userId });

        if (profile) {
            // Update existing profile
            profile = await VendorProfile.findOneAndUpdate(
                { user: userId },
                { $set: profileData },
                { new: true }
            );
        } else {
            // Create new vendor profile
            profile = await VendorProfile.createOne({
                ...profileData,
                user: userId,
            });
        }
        return profile;
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves a vendor profile by user ID.
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} Vendor profile
 */
const getProfile = async (userId) => {
    try {
        const profile = await VendorProfile.findOne({ user: userId }).populate('user', 'name email');
        if (!profile) {
            const err = new Error('Vendor profile not found');
            err.status = 404;
            throw err;
        }
        return profile;
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves all vendor profiles.
 * @returns {Promise<Array>} List of all vendor profiles
 */
const getAllVendors = async () => {
    try {
        return await VendorProfile.find().populate('user', 'name email');
    } catch (error) {
        throw error;
    }
};

/**
 * Adds a portfolio image to the vendor profile.
 * @param {string} userId - ID of the user
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<Object>} Updated profile
 */
const addPortfolioImage = async (userId, imageUrl) => {
    try {
        const profile = await VendorProfile.findOne({ user: userId });
        if (!profile) {
            const err = new Error('Vendor profile not found');
            err.status = 404;
            throw err;
        }

        profile.portfolio.push(imageUrl);
        await profile.save();
        return profile;
    } catch (error) {
        throw error;
    }
};

/**
 * Searches for vendors based on query parameters.
 * @param {Object} query - Search query (e.g., { location: 'NY', serviceType: 'Photo' })
 * @returns {Promise<Array>} List of matching vendors
 */
const searchVendors = async (query) => {
    try {
        const filter = {};
        if (query.location) {
            filter.location = { $regex: query.location, $options: 'i' };
        }
        if (query.serviceType) {
            filter.serviceType = { $regex: query.serviceType, $options: 'i' };
        }
        if (query.name) {
            // Search by user name requires a more complex lookup or aggregation
            // For simplicity, we'll search vendor profile fields first.
            // To search by user name, we'd need to find users first, then find their profiles.
            // Let's stick to profile fields for now or implement a basic join.
        }

        const vendors = await VendorProfile.find(filter).populate('user', 'name email');
        console.log(`Search vendors found: ${vendors.length}`);
        return vendors;
    } catch (error) {
        throw error;
    }
};

module.exports = { createOrUpdateProfile, getProfile, getAllVendors, addPortfolioImage, searchVendors };
