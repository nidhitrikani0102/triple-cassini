const express = require('express');
const router = express.Router();
const guestService = require('../services/guestService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Guest Routes
 * Handles guest management for events.
 * Base URL: /api/guests
 */

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @route   POST /api/guests/:eventId
 * @desc    Add a guest to an event
 * @access  Private
 */
router.post('/:eventId', async (req, res, next) => {
    try {
        const guest = await guestService.addGuest(req.params.eventId, req.body, req.user._id);
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

module.exports = router;
