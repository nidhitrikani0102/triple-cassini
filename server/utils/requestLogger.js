const fs = require('fs');
const path = require('path');

/**
 * Request Logger Middleware
 * Logs incoming HTTP requests to a file.
 */

/**
 * Express middleware to log request details.
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const requestLogger = (req, res, next) => {
    // Construct log message with method, URL, and timestamp
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;

    // Append log to RequestLogger.txt
    fs.appendFile(path.join(__dirname, 'RequestLogger.txt'), logMessage, (err) => {
        if (err) console.error('Failed to write to request log:', err);
    });

    next();
};

module.exports = requestLogger;
