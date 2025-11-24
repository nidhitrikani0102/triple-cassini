const Message = require('../models/Message');

/**
 * Message Service
 * Handles messaging logic between users.
 */

/**
 * Sends a message from one user to another.
 * 
 * @param {string} senderId - ID of the sender (from auth token)
 * @param {string} receiverId - ID of the receiver (from request body)
 * @param {string} content - The actual text of the message
 * @returns {Promise<Object>} The created message document
 */
const sendMessage = async (senderId, receiverId, content) => {
    try {
        // Step 1: Validate input
        if (!receiverId || !content) {
            const err = new Error('Receiver ID and content are required');
            err.status = 400;
            throw err;
        }

        // Step 2: Create the message in the database
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
 * This is used to display the "Inbox" or conversation list.
 * 
 * @param {string} userId - ID of the current user
 * @returns {Promise<Array>} List of unique user objects (people you've talked to)
 */
const getConversations = async (userId) => {
    try {
        // Step 1: Find all messages where the user is the sender
        // We populate the 'receiver' field to get their name and details
        const sentMessages = await Message.findPopulated({ sender: userId }, { path: 'receiver', select: 'name email role' });

        // Step 2: Find all messages where the user is the receiver
        // We populate the 'sender' field to get their name and details
        const receivedMessages = await Message.findPopulated({ receiver: userId }, { path: 'sender', select: 'name email role' });

        // Step 3: Combine these into a unique list of users
        // We use a Map to ensure each user only appears once, even if multiple messages were exchanged
        const users = new Map();

        // Add everyone I sent a message to
        sentMessages.forEach(msg => {
            if (msg.receiver) users.set(msg.receiver._id.toString(), msg.receiver);
        });

        // Add everyone who sent a message to me
        receivedMessages.forEach(msg => {
            if (msg.sender) users.set(msg.sender._id.toString(), msg.sender);
        });

        // Convert the Map values back to an array
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
