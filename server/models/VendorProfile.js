const VendorProfile = require('../utils/schemas/VendorProfileSchema');


/**
 * VendorProfile Model DAL
 * Handles database operations for Vendor Profiles.
 */

/**
 * Creates a new vendor profile.
 * @param {Object} profileData - Data for the new profile
 * @returns {Promise<Object>} The created profile
 */
/**
 * Generates a new custom ID for the vendor profile.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * @returns {Promise<string>} The new custom ID (e.g., 'V001')
 */
/**
 * Generates a new custom ID for the vendor profile.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * Example: If V005 exists, it returns V006.
 * 
 * @returns {Promise<string>} The new custom ID (e.g., 'V001')
 */
const generateId = async () => {
    try {
        // Find all vendor profiles and only select their _id field
        const profiles = await VendorProfile.find({}, '_id');

        // If no profiles exist, start with V001
        if (profiles.length === 0) {
            return 'V001';
        }

        // Extract numbers from existing IDs (e.g., "V005" -> 5)
        const ids = profiles.map(profile => {
            const idStr = profile._id.toString();
            const numPart = idStr.substring(1); // Remove the 'V'
            return parseInt(numPart, 10); // Convert to integer
        });

        // Find the highest number
        const maxId = Math.max(...ids);

        // Add 1 to get the next ID
        const nextId = maxId + 1;

        // Format back to string with leading zeros (e.g., 6 -> "V006")
        return `V${nextId.toString().padStart(3, '0')}`;
    } catch (error) {
        throw new Error(`Error generating ID: ${error.message}`);
    }
};

/**
 * Creates a new vendor profile in the database.
 * This function handles the custom ID generation automatically.
 * 
 * @param {Object} profileData - The data for the new profile (businessName, serviceType, etc.)
 * @returns {Promise<Object>} The created profile document
 */
const createOne = async (profileData) => {
    try {
        // Step 1: Generate a unique custom ID
        const customId = await generateId();

        // Step 2: Create a new VendorProfile instance with the custom ID and provided data
        const profile = new VendorProfile({
            _id: customId,
            ...profileData,
        });

        // Step 3: Save the profile to the database
        return await profile.save();
    } catch (error) {
        // Wrap any database errors in a standardized Error object
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findOne = async (query) => {
    try {
        return await VendorProfile.findOne(query);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const find = async (query) => {
    try {
        return await VendorProfile.find(query);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findOneAndUpdate = async (query, update, options) => {
    try {
        return await VendorProfile.findOneAndUpdate(query, update, options);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findOneAndDelete = async (query) => {
    try {
        return await VendorProfile.findOneAndDelete(query);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const countDocuments = async (query) => {
    try {
        return await VendorProfile.countDocuments(query);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findWithPopulate = async (query, populatePath, selectFields) => {
    try {
        return await VendorProfile.find(query).populate(populatePath, selectFields);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findOneWithPopulate = async (query, populatePath, selectFields) => {
    try {
        return await VendorProfile.findOne(query).populate(populatePath, selectFields);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findWithPagination = async (query, populatePath, selectFields, skip, limit) => {
    try {
        return await VendorProfile.find(query)
            .populate(populatePath, selectFields)
            .skip(skip)
            .limit(limit);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

module.exports = { createOne, findOne, find, findOneAndUpdate, findOneAndDelete, countDocuments, findWithPopulate, findOneWithPopulate, findWithPagination };
