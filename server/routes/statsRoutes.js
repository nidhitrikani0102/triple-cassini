const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../utils/schemas/UserSchema');
const Event = require('../utils/schemas/EventSchema');
const VendorProfile = require('../utils/schemas/VendorProfileSchema');

/**
 * Stats Routes
 * Handles dashboard statistics.
 * Base URL: /api/stats
 */

/**
 * @route   GET /api/stats/public
 * @desc    Get public statistics for landing page
 * @access  Public
 */
router.get('/public', async (req, res, next) => {
    try {
        const users = await User.countDocuments();
        const events = await Event.countDocuments();
        const vendors = await VendorProfile.countDocuments();

        res.json({
            users,
            events,
            vendors
        });
    } catch (error) {
        next(error);
    }
});

// Protect all routes and restrict to admin
router.use(authMiddleware.protect);
router.use(authMiddleware.admin);

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/dashboard', async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalVendors = await VendorProfile.countDocuments();

        res.json({
            totalUsers,
            totalEvents,
            totalVendors
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
