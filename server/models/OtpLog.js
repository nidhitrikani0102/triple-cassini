const mongoose = require('mongoose');
const OtpLogSchema = require('../utils/schemas/OtpLogSchema');

/**
 * OtpLog Model
 * Represents a log of generated OTPs for debugging and admin review.
 */
const OtpLog = mongoose.model('OtpLog', OtpLogSchema);

/**
 * Creates a new OTP log entry.
 * @param {Object} data - OTP data
 * @returns {Promise<Object>} Created log entry
 */
const createLog = async (data) => {
    const log = new OtpLog(data);
    return await log.save();
};

/**
 * Finds the latest OTP logs.
 * @param {number} limit - Number of logs to retrieve
 * @returns {Promise<Array>} List of logs
 */
const findLatest = async (limit = 50) => {
    return await OtpLog.find().sort({ createdAt: -1 }).limit(limit);
};

module.exports = {
    createLog,
    findLatest,
    model: OtpLog
};
