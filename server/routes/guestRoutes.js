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
 * @route   POST /api/guests/rsvp/:guestId
 * @desc    Update guest RSVP status (Public)
 * @access  Public
 */
router.post('/rsvp/:guestId', async (req, res, next) => {
    try {
        const { status } = req.body;
        const guest = await guestService.updateGuestStatus(req.params.guestId, status);
        res.json(guest);
    } catch (error) {
        next(error);
    }
});

// Protect all routes below this line
router.use(authMiddleware.protect);

/**
 * @route   POST /api/guests/:eventId
 * @desc    Add a guest to an event
 * @access  Private
 */
router.post('/:eventId', async (req, res, next) => {
    try {
        // We pass the event ID from the URL, the guest data from the body, and the user ID from the token
        const guest = await guestService.addGuest(req.params.eventId, req.body, req.user._id);

        // Return 201 (Created) and the new guest data
        res.status(201).json(guest);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/guests/:eventId
 * @desc    Get all guests for an event
 * @access  Private
 */
router.get('/:eventId', async (req, res, next) => {
    try {
        const guests = await guestService.getGuests(req.params.eventId, req.user._id);
        res.json(guests);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/guests/invite/:guestId
 * @desc    Send an invitation email to a guest
 * @access  Private
 */
router.post('/invite/:guestId', async (req, res, next) => {
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
router.post('/resend/:guestId', async (req, res, next) => {
    try {
        const result = await guestService.resendInvitation(req.params.guestId, req.user._id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
