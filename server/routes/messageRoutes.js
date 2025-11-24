const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Message Routes
 * Handles messaging between users.
 * Base URL: /api/messages
 */

// Protect all routes
router.use(authMiddleware.protect);

/**
 * @route   POST /api/messages/send
 * @desc    Send a message to another user
 * @access  Private
 */
router.post('/send', async (req, res, next) => {
    try {
        const { receiverId, content } = req.body;
        const message = await messageService.sendMessage(req.user._id, receiverId, content);
        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/messages/conversations
 * @desc    Get list of users the current user has conversed with
 * @access  Private
 */
router.get('/conversations', async (req, res, next) => {
    try {
        const conversations = await messageService.getConversations(req.user._id);
        res.json(conversations);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/messages/:otherUserId
 * @desc    Get all messages between current user and another user
 * @access  Private
 */
router.get('/:otherUserId', async (req, res, next) => {
    try {
        const messages = await messageService.getMessages(req.user._id, req.params.otherUserId);
        res.json(messages);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/messages/conversations/:otherUserId
 * @desc    Delete a conversation with another user
 * @access  Private
 */
router.delete('/conversations/:otherUserId', async (req, res, next) => {
    try {
        const result = await messageService.deleteConversation(req.user._id, req.params.otherUserId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
