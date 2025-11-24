const fs = require('fs');
const path = require('path');

/**
 * Error Logger Middleware
 * Logs errors to a file and sends a standardized error response.
 */

/**
 * Express error handling middleware.
 * @param {Object} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const errorLogger = (err, req, res, next) => {
    // Construct error log message
    const logMessage = `[${new Date().toISOString()}] ${err.stack}\n`;

    // Append error to ErrorLogger.txt
    fs.appendFile(path.join(__dirname, 'ErrorLogger.txt'), logMessage, (fsErr) => {
        if (fsErr) console.error('Failed to write to error log:', fsErr);
    });

    // Send error response to client
    // Use err.status if available (set by Service/Model layers), otherwise default to 500
    let status = err.status || 500;
    let message = err.message || 'Server Error';

    // Sanitize Mongoose "No document found" error
    if (message.includes('No document found for query')) {
        console.error('Sanitizing raw DB error:', message); // Log the original for debugging
        message = 'Invalid credentials or User not found';
        status = 404;
    }

    res.status(status).json({
        message: message,
    });
};

module.exports = errorLogger;
