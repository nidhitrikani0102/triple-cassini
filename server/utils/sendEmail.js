const nodemailer = require('nodemailer');

/**
 * Email Sender Utility
 * Handles sending emails using Nodemailer.
 */

/**
 * Sends an email.
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (text)
 * @param {string} [options.html] - Email body (HTML)
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
    // Create a transporter using SMTP settings
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or your preferred email service
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS, // Your email password or app password
        },
    });

    // Define email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Optional HTML content
    };

    // Check if credentials are provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('==================================================');
        console.log('EMAIL MOCK (Credentials missing in .env)');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('==================================================');
        return;
    }

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        // ROBUST ERROR HANDLING:
        // If email fails (network, auth, etc.), we catch it and LOG it.
        // We do NOT throw the error, so the application flow continues.
        console.error('==================================================');
        console.error('EMAIL FAILED (Network/Auth Error)');
        console.error(`Error: ${error.message}`);
        console.error('FALLBACK LOGGING (Mock Mode Activated)');
        console.error(`To: ${options.email}`);
        console.error(`Subject: ${options.subject}`);
        console.error(`Message: ${options.message}`);
        console.error('==================================================');
    }
};

module.exports = sendEmail;
