const User = require('../models/User');
const OtpLog = require('../models/OtpLog');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { validateRegister, validateLogin } = require('../validators/authValidator');

/**
 * Auth Service
 * Handles user authentication, registration, and password management.
 */

/**
 * Generates a JWT token for a user.
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * Registers a new user.
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user and token
 */
const registerUser = async (userData) => {
    try {
        // Validate user data
        const errors = validateRegister(userData);
        if (errors.length > 0) {
            const err = new Error(errors.join(', '));
            err.status = 400;
            throw err;
        }

        const { name, email, password, role } = userData;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            const err = new Error('User already exists');
            err.status = 400;
            throw err;
        }

        // Create new user via DAL
        const user = await User.createOne({
            name,
            email,
            password,
            role,
        });

        // Send welcome email (mock implementation)
        console.log(`Sending welcome email to ${email}`);

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Authenticates a user (Login).
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} User data and token if successful
 */
const loginUser = async (credentials) => {
    try {
        // Validate login data
        const errors = validateLogin(credentials);
        if (errors.length > 0) {
            const err = new Error(errors.join(', '));
            err.status = 400;
            throw err;
        }

        const { email, password } = credentials;

        // Check for user email
        const user = await User.findOne({ email });

        // Validate user and password
        if (user && (await user.matchPassword(password))) {

            // Check if user is blocked
            if (user.isBlocked) {
                const err = new Error('Your account has been blocked. Please contact support.');
                err.status = 403;
                throw err;
            }

            // Check if user is deleted
            if (user.isDeleted) {
                const err = new Error('Invalid credentials');
                err.status = 401;
                throw err;
            }

            // BYPASS OTP FOR ADMINS
            if (user.role === 'admin') {
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                };
            }

            // Generate OTP for 2FA (mock)
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save();

            // TRIPLE CHANNEL OTP DELIVERY
            // 1. Console
            console.log('==================================================');
            console.log(`[OTP GENERATED] User: ${email} | OTP: ${otp}`);
            console.log('==================================================');

            // 2. Admin Log (DB)
            try {
                await OtpLog.createLog({
                    email: user.email,
                    otp: otp,
                    type: 'Login'
                });
            } catch (logError) {
                console.error('Failed to log OTP to DB:', logError.message);
            }

            // 3. Email (Safe Send)
            await sendEmail({
                email: user.email,
                subject: 'Login OTP',
                message: `Your OTP for login is ${otp}`,
            });

            return { message: 'OTP sent to email', userId: user._id, requiresOtp: true };
        } else {
            const err = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Verifies the OTP sent to the user.
 * @param {string} userId - User ID
 * @param {string} otp - OTP to verify
 * @returns {Promise<Object>} Success message
 */
const verifyLoginOtp = async (userId, otp) => {
    try {
        const user = await User.findById(userId);

        if (!user || user.isDeleted) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }

        if (user.otp === otp && user.otpExpires > Date.now()) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            };
        } else {
            const err = new Error('Invalid or expired OTP');
            err.status = 400;
            throw err;
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Initiates password reset process.
 * @param {string} email - User's email
 * @returns {Promise<Object>} Success message
 */
const forgotPassword = async (email) => {
    try {
        const user = await User.findOne({ email });

        if (!user || user.isDeleted) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.otp = resetToken; // Reusing OTP field for simplicity
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // TRIPLE CHANNEL OTP DELIVERY
        // 1. Console
        console.log('==================================================');
        console.log(`[RESET TOKEN] User: ${email} | Token: ${resetToken}`);
        console.log('==================================================');

        // 2. Admin Log (DB)
        try {
            await OtpLog.createLog({
                email: user.email,
                otp: resetToken,
                type: 'Reset'
            });
        } catch (logError) {
            console.error('Failed to log Reset Token to DB:', logError.message);
        }

        // 3. Email (Safe Send)
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message: `You requested a password reset. Use this token: ${resetToken}`,
        });

        return { message: 'Password reset email sent' };
    } catch (error) {
        throw error;
    }
};

/**
 * Resets the user's password.
 * @param {string} email - User's email
 * @param {string} otp - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success message
 */
const resetPassword = async (email, otp, newPassword) => {
    try {
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() },
        });

        if (!user || user.isDeleted) {
            const err = new Error('Invalid token or email');
            err.status = 400;
            throw err;
        }

        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return { message: 'Password reset successful' };
    } catch (error) {
        throw error;
    }
};

/**
 * Updates user profile.
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
const updateProfile = async (userId, updateData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }

        // Update fields if provided
        if (updateData.name) user.name = updateData.name;
        if (updateData.phone) user.phone = updateData.phone;
        if (updateData.bio) user.bio = updateData.bio;
        if (updateData.location) user.location = updateData.location;
        if (updateData.avatar) user.avatar = updateData.avatar;

        // Note: Email updates should ideally require re-verification, so we skip it for now or handle it carefully.
        // For this iteration, we won't allow email updates to prevent security issues.

        const updatedUser = await user.save();

        return {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            location: updatedUser.location,
            avatar: updatedUser.avatar,
            token: generateToken(updatedUser._id),
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves user details by ID.
 * Used to fetch the current user's profile information.
 * 
 * @param {string} userId - The ID of the user to find
 * @returns {Promise<Object>} The user document (excluding sensitive fields)
 * @returns {Promise<Object>} The user document (excluding sensitive fields)
 */
const getUserById = async (userId) => {
    try {
        // Find the user in the database by their ID
        // .select('-password ...') excludes the password and OTP fields from the result for security
        const user = await User.findById(userId).select('-password -otp -otpExpires');

        if (!user) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }
        return user;
    } catch (error) {
        throw error; // Propagate error to the controller
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyLoginOtp,
    forgotPassword,
    resetPassword,
    getUserById,
    updateProfile,
};
