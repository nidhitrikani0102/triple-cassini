const VendorAssignment = require('../utils/schemas/VendorAssignmentSchema');

/**
 * VendorAssignment Model DAL
 * Handles database operations for Vendor Assignments.
 */

/**
 * Generates a new custom ID for the assignment.
 * Logic: Finds all existing IDs, extracts the numeric part, finds the max, and increments by 1.
 * @returns {Promise<string>} The new custom ID (e.g., 'VA001')
 */
const generateId = async () => {
    try {
        const assignments = await VendorAssignment.find({}, '_id');
        if (assignments.length === 0) {
            return 'VA001';
        }
        const ids = assignments.map(a => {
            const idStr = a._id.toString();
            // Check if ID starts with VA, if not (legacy), ignore or handle
            if (!idStr.startsWith('VA')) return 0;
            const numPart = idStr.substring(2);
            return parseInt(numPart, 10);
        });
        const maxId = Math.max(...ids);
        const nextId = maxId + 1;
        return `VA${nextId.toString().padStart(3, '0')}`;
    } catch (error) {
        throw new Error(`Error generating ID: ${error.message}`);
    }
};

/**
 * Creates a new assignment.
 * @param {Object} data - Assignment data
 * @returns {Promise<Object>} Created assignment
 */
const createOne = async (data) => {
    try {
        const customId = await generateId();
        const assignment = new VendorAssignment({
            _id: customId,
            ...data,
            paymentStatus: 'pending', // pending, paid, completed
            agreedPrice: data.agreedPrice || 0
        });
        return await assignment.save();
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const find = async (query) => {
    try {
        return await VendorAssignment.find(query)
            .populate({
                path: 'vendor',
                populate: { path: 'user', select: 'name email' }
            })
            .populate('event client');
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findById = async (id) => {
    try {
        return await VendorAssignment.findById(id)
            .populate({
                path: 'vendor',
                populate: { path: 'user', select: 'name email' }
            })
            .populate('event client');
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const updateStatus = async (id, status) => {
    try {
        return await VendorAssignment.findByIdAndUpdate(id, { status }, { new: true });
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findWithPopulate = async (query, populateOptions) => {
    try {
        let q = VendorAssignment.find(query);
        if (Array.isArray(populateOptions)) {
            populateOptions.forEach(opt => q = q.populate(opt));
        } else {
            q = q.populate(populateOptions);
        }
        return await q;
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const findWithPopulateAndPagination = async (query, populateOptions, skip, limit) => {
    try {
        let q = VendorAssignment.find(query);
        if (Array.isArray(populateOptions)) {
            populateOptions.forEach(opt => q = q.populate(opt));
        } else {
            q = q.populate(populateOptions);
        }
        return await q.skip(skip).limit(limit);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const countDocuments = async (query) => {
    try {
        return await VendorAssignment.countDocuments(query);
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

const updateAssignment = async (id, data) => {
    try {
        return await VendorAssignment.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
        const err = new Error(`Database Error: ${error.message}`);
        err.status = 500;
        throw err;
    }
};

module.exports = { createOne, find, findById, updateStatus, findWithPopulate, findWithPopulateAndPagination, countDocuments, updateAssignment };
