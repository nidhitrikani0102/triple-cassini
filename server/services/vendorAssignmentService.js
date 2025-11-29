const VendorAssignment = require('../models/VendorAssignment');
const Event = require('../models/Event');
const Budget = require('../models/Budget');
const VendorProfile = require('../models/VendorProfile');

/**
 * Vendor Assignment Service
 * Handles business logic for vendor assignments.
 */

/**
 * Create a new vendor assignment.
 * @param {Object} data - Assignment data (eventId, vendorId, userId, amount, serviceType)
 * @returns {Promise<Object>} Created assignment
 */
const createAssignment = async (data) => {
    try {
        const { eventId, vendorId, userId, amount, serviceType } = data;

        // Verify Event
        const event = await Event.findById(eventId);
        if (!event) throw { status: 404, message: 'Event not found' };
        if (event.user.toString() !== userId) throw { status: 401, message: 'Not authorized' };

        // Verify Vendor
        const vendor = await VendorProfile.findOne({ _id: vendorId, isDeleted: { $ne: true } });
        if (!vendor) throw { status: 404, message: 'Vendor not found' };

        // Create Assignment
        const assignment = await VendorAssignment.createOne({
            event: eventId,
            vendor: vendorId,
            client: userId,
            serviceType: serviceType || vendor.serviceType,
            amount,
            status: 'Pending'
        });

        return assignment;
    } catch (error) {
        throw error;
    }
};

/**
 * Get assignments for an event.
 * @param {string} eventId 
 * @param {string} userId 
 * @returns {Promise<Array>} List of assignments
 */
const getAssignmentsByEvent = async (eventId, userId) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) throw { status: 404, message: 'Event not found' };
        if (event.user.toString() !== userId) throw { status: 401, message: 'Not authorized' };

        return await VendorAssignment.find({ event: eventId });
    } catch (error) {
        throw error;
    }
};

/**
 * Get assignments for a vendor.
 * @param {string} vendorUserId 
 * @returns {Promise<Array>} List of assignments
 */
const getAssignmentsByVendor = async (vendorUserId) => {
    try {
        // Find vendor profile for this user
        const vendorProfile = await VendorProfile.findOne({ user: vendorUserId, isDeleted: { $ne: true } });
        if (!vendorProfile) throw { status: 404, message: 'Vendor profile not found' };

        return await VendorAssignment.find({ vendor: vendorProfile._id });
    } catch (error) {
        throw error;
    }
};

/**
 * Update assignment status.
 * @param {string} assignmentId 
 * @param {string} status 
 * @param {string} userId - ID of the user performing the action
 * @param {string} role - 'user' or 'vendor'
 * @returns {Promise<Object>} Updated assignment
 */
const updateStatus = async (assignmentId, status, userId, role) => {
    try {
        const assignment = await VendorAssignment.findById(assignmentId);
        if (!assignment) throw { status: 404, message: 'Assignment not found' };

        // Authorization check
        if (role === 'vendor') {
            const vendorProfile = await VendorProfile.findOne({ user: userId });
            if (!vendorProfile || assignment.vendor._id.toString() !== vendorProfile._id.toString()) {
                throw { status: 401, message: 'Not authorized' };
            }
        } else if (role === 'user') {
            if (assignment.client._id.toString() !== userId) {
                throw { status: 401, message: 'Not authorized' };
            }
        }

        // Status transition logic
        if (status === 'Paid') {
            // Only user can mark as Paid
            if (role !== 'user') throw { status: 403, message: 'Only client can process payment' };

            // Add expense to budget
            const budget = await Budget.findOne({ event: assignment.event._id });
            if (budget) {
                budget.expenses.push({
                    title: `Payment to ${assignment.vendor.user?.name || 'Unknown'} (Vendor)`,
                    amount: assignment.amount,
                    category: assignment.serviceType,
                    date: new Date()
                });
                await budget.save();
            }
        }

        return await VendorAssignment.updateStatus(assignmentId, status);
    } catch (error) {
        throw error;
    }
};

module.exports = { createAssignment, getAssignmentsByEvent, getAssignmentsByVendor, updateStatus };
