const Message = require('../models/Message');

/**
 * Message Service
 * Handles messaging logic between users.
 */

/**
 * Sends a message from one user to another.
 * @param {string} senderId - ID of the sender
 * @param {string} receiverId - ID of the receiver
 * @param {string} content - Message content
 * @returns {Promise<Object>} The created message
 */
const sendMessage = async (senderId, receiverId, content) => {
    try {
        if (!receiverId || !content) {
            const err = new Error('Receiver ID and content are required');
            err.status = 400;
            throw err;
        }

        const message = await Message.createOne({
            sender: senderId,
            receiver: receiverId,
            content,
        });
        return message;
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves a list of users the current user has conversed with.
 * @param {string} userId - ID of the current user
 * @returns {Promise<Array>} List of unique users
 */
const getConversations = async (userId) => {
    try {
        // Find messages where user is sender or receiver
        const sentMessages = await Message.findPopulated({ sender: userId }, { path: 'receiver', select: 'name email role' });
        const receivedMessages = await Message.findPopulated({ receiver: userId }, { path: 'sender', select: 'name email role' });

        const users = new Map();

        // Extract unique users from messages
        sentMessages.forEach(msg => {
            if (msg.receiver) users.set(msg.receiver._id.toString(), msg.receiver);
        });
        receivedMessages.forEach(msg => {
            if (msg.sender) users.set(msg.sender._id.toString(), msg.sender);
        });

        return Array.from(users.values());
    } catch (error) {
        throw error;
    }
};

/**
 * Deletes a conversation between two users.
 * @param {string} userId - ID of the current user
 * @param {string} otherUserId - ID of the other user
 * @returns {Promise<Object>} Success message
 */
const deleteConversation = async (userId, otherUserId) => {
    try {
        if (!otherUserId || otherUserId === 'undefined' || otherUserId === 'null') {
            const err = new Error('Invalid user ID');
            err.status = 400;
            throw err;
        }

        // Delete all messages between the two users
        await Message.deleteMany({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        });

        return { message: 'Conversation deleted successfully' };
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves all messages between two users.
 * @param {string} userId - ID of the current user
 * @param {string} otherUserId - ID of the other user
 * @returns {Promise<Array>} List of messages sorted by time
 */
const getMessages = async (userId, otherUserId) => {
    try {
        const messages = await Message.findSorted({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId },
            ],
        }, { createdAt: 1 });

        return messages;
    } catch (error) {
        throw error;
    }
};

module.exports = { sendMessage, getConversations, deleteConversation, getMessages };
