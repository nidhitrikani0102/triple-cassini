const express = require('express');
const router = express.Router();
const vendorAssignmentService = require('../services/vendorAssignmentService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Vendor Assignment Routes
 * Base URL: /api/assignments
 */

/**
 * @route   POST /api/assignments
 * @desc    Create a new assignment
 * @access  Private (User)
 */
router.post('/', authMiddleware.protect, async (req, res, next) => {
    try {
        const assignment = await vendorAssignmentService.createAssignment({
            ...req.body,
            userId: req.user._id
        });
        res.status(201).json(assignment);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/assignments/event/:eventId
 * @desc    Get assignments for an event
 * @access  Private (User)
 */
router.get('/event/:eventId', authMiddleware.protect, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = req.query.limit;
        if (limit !== 'all') {
            limit = parseInt(limit) || 9;
        }
        const result = await vendorAssignmentService.getAssignmentsByEvent(req.params.eventId, req.user._id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/assignments/vendor/my-jobs
 * @desc    Get assignments for the logged-in vendor
 * @access  Private (Vendor)
 */
router.get('/vendor/my-jobs', authMiddleware.protect, authMiddleware.vendor, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = req.query.limit;
        if (limit !== 'all') {
            limit = parseInt(limit) || 9;
        }
        const result = await vendorAssignmentService.getAssignmentsByVendor(req.user._id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/assignments/:id/status
 * @desc    Update assignment status
 * @access  Private (User or Vendor)
 */
router.put('/:id/status', authMiddleware.protect, async (req, res, next) => {
    try {
        const { status } = req.body;
        const role = req.user.role === 'vendor' ? 'vendor' : 'user';
        const assignment = await vendorAssignmentService.updateStatus(req.params.id, status, req.user._id, role);
        res.json(assignment);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/assignments/user/my-assignments
 * @desc    Get assignments for the logged-in user
 * @access  Private (User)
 */
router.get('/user/my-assignments', authMiddleware.protect, async (req, res, next) => {
    try {
        const assignments = await vendorAssignmentService.getAssignmentsByUser(req.user._id);
        res.json(assignments);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/assignments/:id
 * @desc    Update assignment details (amount)
 * @access  Private (User)
 */
router.put('/:id', authMiddleware.protect, async (req, res, next) => {
    try {
        const assignment = await vendorAssignmentService.updateAssignment(req.params.id, req.body, req.user._id);
        res.json(assignment);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
