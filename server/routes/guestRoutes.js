const express = require('express');
const router = express.Router();
const guestService = require('../services/guestService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Guest Routes
 * Handles guest management for events.
 * Base URL: /api/guests
 */
/**
 * @route   GET /api/guests/my-invitations
 * @desc    Get pending invitations for the logged-in user
 * @access  Private
 */
router.get('/my-invitations', authMiddleware.protect, async (req, res, next) => {
    try {
        const invitations = await guestService.getMyInvitations(req.user._id);
        res.json(invitations);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/guests/:eventId
 * @desc    Add a guest to an event
 * @access  Private
 */
router.post('/:eventId', authMiddleware.protect, async (req, res, next) => {
    try {
        console.log('POST /guests/:eventId hit');
        console.log('req.body:', JSON.stringify(req.body, null, 2));
        console.log('Is Array?', Array.isArray(req.body));

        // Check if the request body is an array (Bulk Insert)
        if (Array.isArray(req.body)) {
            console.log('Processing Bulk Insert');
            const guests = await guestService.addGuestsBulk(req.params.eventId, req.body, req.user._id);
            res.status(201).json(guests);
        } else {
            console.log('Processing Single Insert');
            // Single Insert
            const guest = await guestService.addGuest(req.params.eventId, req.body, req.user._id);
            res.status(201).json(guest);
        }
    } catch (error) {
        console.error('Error in POST /guests/:eventId:', error);
        next(error);
    }
});
/**
 * @route   GET /api/guests/:eventId
 * @desc    Get all guests for an event
 * @access  Private
 */
router.get('/:eventId', authMiddleware.protect, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await guestService.getGuests(req.params.eventId, req.user._id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/guests/invite/:guestId
 * @desc    Send an invitation email to a guest
 * @access  Private
 */
router.post('/invite/:guestId', authMiddleware.protect, async (req, res, next) => {
    try {
        const result = await guestService.sendInvitation(req.params.guestId, req.user._id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/guests/resend/:guestId
 * @desc    Resend invitation email (Host only)
 * @access  Private
 */
router.post('/resend/:guestId', authMiddleware.protect, async (req, res, next) => {
    try {
        const result = await guestService.resendInvitation(req.params.guestId, req.user._id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/guests/rsvp/:guestId
 * @desc    Update guest RSVP status (Public)
 * @access  Public
 */
router.post('/rsvp/:guestId', async (req, res, next) => {
    try {
        const guest = await guestService.updateGuestStatus(req.params.guestId, req.body);
        res.json(guest);
    } catch (error) {
        next(error);
    }
});

router.get('/public/:guestId', async (req, res, next) => {
    try {
        const data = await guestService.getPublicGuestInfo(req.params.guestId);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
