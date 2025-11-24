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
        console.error('Error sending email:', error.message);
        // Fallback to logging so the flow doesn't break for the user
        console.log('==================================================');
        console.log('EMAIL FAILED (Logged instead)');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log('==================================================');
    }
};

module.exports = sendEmail;
