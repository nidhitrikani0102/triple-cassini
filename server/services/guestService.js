const Guest = require('../models/Guest');
const Event = require('../models/Event');
const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail');
const { validateGuest } = require('../validators/guestValidator');

/**
 * Guest Service
 * Handles guest management and invitations.
 */

/**
 * Adds a guest to an event.
 * This function handles validation, creation, and sending an automatic invitation email.
 * 
 * @param {string} eventId - ID of the event
 * @param {Object} guestData - Guest details (name, email, userId, invitationType)
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Object>} Created guest document
 */
const addGuest = async (eventId, guestData, userId) => {
    try {
        // Step 1: Validate the guest data (e.g., check if email is valid)
        const errors = validateGuest(guestData);
        if (errors.length > 0) {
            const err = new Error(errors.join(', '));
            err.status = 400;
            throw err;
        }

        // Step 2: Verify that the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        // Step 3: Ensure the user owns the event
        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401;
            throw err;
        }

        // Step 4: Create the guest record in the database
        const { name, email, userId: guestUserId, invitationType } = guestData;

        const guest = await Guest.createOne({
            event: eventId,
            name,
            email,
            userId: guestUserId,
            invitationType,
            status: 'Pending',
            isInvited: true, // We assume we send it immediately
            invitedAt: Date.now(),
        });

        // Step 5: Send Invitation based on Type
        if (invitationType === 'Email') {
            // We wrap this in a try-catch so that if the email fails, the guest is still created
            try {
                await sendInvitation(guest._id, userId);
            } catch (emailError) {
                console.error('Failed to send auto-invitation:', emailError);
                // We log the error but don't stop the process
            }
        } else {
            // In-App: No email needed, just saved to DB.
            console.log(`In-App Invitation created for User ${guestUserId}`);
        }

        return guest;
    } catch (error) {
        throw error;
    }
};

/**
 * Adds multiple guests to an event.
 * @param {string} eventId - ID of the event
 * @param {Array} guestsData - Array of guest details
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Array>} List of created guests
 */
const addGuestsBulk = async (eventId, guestsData, userId) => {
    try {
        const results = [];
        // We process them sequentially to ensure proper validation and error handling for each
        // In a production environment with huge lists, we might want to optimize this or use Promise.all
        for (const guestData of guestsData) {
            try {
                const guest = await addGuest(eventId, guestData, userId);
                results.push(guest);
            } catch (error) {
                console.error(`Failed to add guest ${guestData.email}:`, error.message);
                // We continue adding other guests even if one fails
                // Optionally, we could return a list of errors
            }
        }
        return results;
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves all guests for an event.
 * @param {string} eventId - ID of the event
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Array>} List of guests
 */
const getGuests = async (eventId, userId) => {
    try {
        // Verify event ownership
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

        return await Guest.find({ event: eventId });
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves all invitations for a specific user.
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} List of invitations (guest records)
 */
const getMyInvitations = async (userId) => {
    try {
        // Find guests where userId matches and populate event details
        // We use the DAL method findWithPopulate
        // Added mapLink and invitationConfig to populate fields
        const invitations = await Guest.findWithPopulate({ userId }, 'event', 'name date time location mapLink invitationConfig');

        // Sort manually since DAL doesn't support sort chaining yet, or we can just accept default sort
        // For now, let's just return them. If sorting is needed, we should add it to DAL or sort in memory.
        return invitations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        throw error;
    }
};

/**
 * Sends an email invitation to a guest.
 * @param {string} guestId - ID of the guest
 * @param {string} userId - ID of the requesting user
 * @returns {Promise<Object>} Success message
 */
const sendInvitation = async (guestId, userId) => {
    try {
        const guest = await Guest.findById(guestId);
        if (!guest) {
            const err = new Error('Guest not found');
            err.status = 404;
            throw err;
        }

        const event = await Event.findById(guest.event);
        if (event.user.toString() !== userId) {
            const err = new Error('Not authorized');
            err.status = 401;
            throw err;
        }

        // Generate HTML Template based on config
        const themeColors = {
            classic: { header: '#343a40', bg: '#f8f9fa', text: '#212529', button: '#343a40' },
            floral: { header: '#d63384', bg: '#fff0f5', text: '#4a4a4a', button: '#d63384' },
            modern: { header: '#0d6efd', bg: '#ffffff', text: '#212529', button: '#0d6efd' },
            party: { header: '#ffc107', bg: '#212529', text: '#ffffff', button: '#ffc107' }
        };

        const config = event.invitationConfig || { theme: 'classic', showMap: true, customMessage: '' };
        const theme = themeColors[config.theme] || themeColors.classic;

        // Generate RSVP Link
        const rsvpLink = `http://localhost:3000/rsvp/${guest._id}`;

        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: ${theme.bg}; color: ${theme.text};">
                <div style="background-color: ${theme.header}; padding: 20px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0;">You're Invited!</h1>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 18px;">Dear <strong>${guest.name}</strong>,</p>
                    <p style="font-size: 16px;">You are cordially invited to attend <strong>${event.name}</strong>.</p>
                    
                    ${config.customMessage ? `<p style="font-style: italic; margin: 20px 0; padding: 15px; background-color: rgba(0,0,0,0.05); border-radius: 5px;">"${config.customMessage}"</p>` : ''}

                    <div style="background-color: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                        <p style="margin: 5px 0;">📅 <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                        <p style="margin: 5px 0;">⏰ <strong>Time:</strong> ${event.time}</p>
                        <p style="margin: 5px 0;">📍 <strong>Location:</strong> ${event.location}</p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 15px; font-weight: bold;">Please let us know if you can make it:</p>
                        <div style="display: flex; justify-content: center; gap: 15px;">
                            <a href="http://localhost:3000/invitation/${guest._id}?status=Accepted" style="background-color: #198754; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Joyfully Accept</a>
                            <a href="http://localhost:3000/invitation/${guest._id}?status=Declined" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Regretfully Decline</a>
                        </div>
                    </div>

                    ${config.showMap && event.mapLink ? `
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="${event.mapLink}" style="color: #e91e63; text-decoration: none; font-size: 14px;">View Location on Map</a>
                        </div>
                    ` : ''}
                </div>
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee;">
                    Sent via EventEmpire
                </div>
            </div>
        `;

        // Send email invitation
        await sendEmail({
            email: guest.email,
            subject: `Invitation to ${event.name}`,
            message: `You have been invited to ${event.name}. Please check your email for details.`,
            html: htmlTemplate
        });

        console.log(`Invitation sent to ${guest.email}`);

        // Update guest status
        guest.isInvited = true;
        guest.invitedAt = Date.now();
        await guest.save();

        return { message: 'Invitation sent' };
    } catch (error) {
        throw error;
    }
};

/**
 * Updates the RSVP status of a guest.
 * @param {string} guestId - ID of the guest
 * @param {Object} data - Update data including status and extended fields
 * @returns {Promise<Object>} Updated guest
 */
const updateGuestStatus = async (guestId, data) => {
    try {
        const { status } = data;
        const guest = await Guest.findById(guestId);
        if (!guest) {
            const err = new Error('Guest not found');
            err.status = 404;
            throw err;
        }

        if (!['Accepted', 'Declined'].includes(status)) {
            const err = new Error('Invalid status');
            err.status = 400;
            throw err;
        }

        guest.status = status;

        // Update extended fields if provided
        if (data.dietaryRestrictions !== undefined) guest.dietaryRestrictions = data.dietaryRestrictions;
        if (data.plusOne !== undefined) guest.plusOne = data.plusOne;
        if (data.plusOneName !== undefined) guest.plusOneName = data.plusOneName;
        if (data.message !== undefined) guest.message = data.message;

        await guest.save();
        return guest;
    } catch (error) {
        throw error;
    }
};

/**
 * Resends an invitation to a guest.
 * @param {string} guestId - ID of the guest
 * @param {string} userId - ID of the requesting user (Host)
 * @returns {Promise<Object>} Success message
 */
const resendInvitation = async (guestId, userId) => {
    // Reset status to Pending so the user can RSVP again
    const guest = await Guest.findById(guestId);
    if (guest) {
        guest.status = 'Pending';
        await guest.save();
    }
    return await sendInvitation(guestId, userId);
};

/**
 * Retrieves guest and event info for the public invitation page.
 * @param {string} guestId - ID of the guest
 * @returns {Promise<Object>} Guest and Event details
 */
const getPublicGuestInfo = async (guestId) => {
    try {
        const guest = await Guest.findById(guestId);
        if (!guest) {
            const err = new Error('Guest not found');
            err.status = 404;
            throw err;
        }

        const event = await Event.findById(guest.event);
        if (!event) {
            const err = new Error('Event not found');
            err.status = 404;
            throw err;
        }

        // Populate host name for the "Thank You" message
        await event.populate('user', 'name');

        return { guest, event };
    } catch (error) {
        throw error;
    }
};

module.exports = { addGuest, addGuestsBulk, getGuests, sendInvitation, updateGuestStatus, resendInvitation, getMyInvitations, getPublicGuestInfo };
