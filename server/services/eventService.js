const Event = require('../models/Event');
const Budget = require('../models/Budget');
const { validateEvent } = require('../validators/eventValidator');

/**
 * Event Service
 * Handles event creation, retrieval, and management.
 */

/**
 * Creates a new event and initializes its budget.
 * This function handles the entire "Create Event" workflow.
 * 
 * @param {Object} eventData - Data for the new event (name, date, location, etc.)
 * @param {string} userId - ID of the user creating the event
 * @returns {Promise<Object>} The created event document
 */
const createEvent = async (eventData, userId) => {
    try {
        // Step 1: Validate the input data
        // We use the eventValidator to check if all required fields are present and valid
        const errors = validateEvent(eventData);
        if (errors.length > 0) {
            // If there are errors, we throw a 400 (Bad Request) error with the details
            const err = new Error(errors.join(', '));
            err.status = 400;
            throw err;
        }

        // Step 2: Create the event in the database
        // We use the Event model (DAL) to insert the new document
        const event = await Event.createOne({
            ...eventData, // Spread the event data (name, date, etc.)
            user: userId, // Link the event to the user who created it
        });

        // Step 3: Initialize a budget for the event
        // Every event needs a budget, so we create an empty one automatically
        await Budget.createOne({
            event: event._id, // Link the budget to the newly created event
            totalBudget: 0,   // Start with 0 budget
            expenses: [],     // Start with no expenses
        });

        // Return the created event to the controller
        return event;
    } catch (error) {
        throw error; // Pass any errors up to the controller
    }
};

/**
 * Retrieves all events for a specific user.
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} List of events
 */
const getEvents = async (userId) => {
    try {
        return await Event.find({ user: userId });
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves a single event by ID.
 * @param {string} eventId - ID of the event
 * @param {string} userId - ID of the requesting user (for authorization)
 * @returns {Promise<Object>} The event document
 */
const getEventById = async (eventId, userId) => {
    try {
        const event = await Event.findById(eventId);

        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        // Check if the user owns the event
        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401;
            throw err;
        }

        return event;
    } catch (error) {
        throw error;
    }
};

/**
 * Updates an event.
 * @param {string} eventId - ID of the event
 * @param {Object} updateData - Data to update
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Object>} Updated event
 */
const updateEvent = async (eventId, updateData, userId) => {
    try {
        // Validate update data (optional, but good practice)
        // Note: We might want a partial validation here, but for now reusing validateEvent if full update
        // or just proceeding if partial. Since validateEvent checks required fields, it might fail on partial updates.
        // Let's skip strict validation for update or assume full object is passed, or create a separate validator.
        // For simplicity in this beginner-friendly code, we'll skip strict validation on update 
        // unless we want to enforce all fields.

        const event = await Event.findById(eventId);

        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401;
            throw err;
        }

        // Update event via DAL
        const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
            new: true,
            runValidators: true,
        });

        return updatedEvent;
    } catch (error) {
        throw error;
    }
};

/**
 * Deletes an event.
 * @param {string} eventId - ID of the event
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<void>}
 */
const deleteEvent = async (eventId, userId) => {
    try {
        const event = await Event.findById(eventId);

        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401;
            throw err;
        }

        await Event.findByIdAndDelete(eventId);
    } catch (error) {
        throw error;
    }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
