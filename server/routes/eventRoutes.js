const express = require('express');
const router = express.Router();
const eventService = require('../services/eventService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Event Routes
 * Handles event creation and retrieval.
 * Base URL: /api/events
 */

// Protect all routes
// This middleware checks if the user is logged in (has a valid token)
// If not, it will return a 401 Unauthorized error
router.use(authMiddleware.protect);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Only logged-in users)
 */
router.post('/', async (req, res, next) => {
    try {
        // req.user._id comes from the authMiddleware.protect
        // It tells us WHICH user is creating the event
        const event = await eventService.createEvent(req.body, req.user._id);

        // Return 201 (Created) and the new event data
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/events
 * @desc    Get all events for the current user
 * @access  Private
 */
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = req.query.limit;
        if (limit !== 'all') {
            limit = parseInt(limit) || 9;
        }
        const result = await eventService.getEvents(req.user._id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event by ID
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id, req.user._id);
        res.json(event);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private
 */
router.put('/:id', async (req, res, next) => {
    try {
        const event = await eventService.updateEvent(req.params.id, req.body, req.user._id);
        res.json(event);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await eventService.deleteEvent(req.params.id, req.user._id);
        res.json({ message: 'Event removed' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
