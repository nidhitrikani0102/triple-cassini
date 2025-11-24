const express = require('express'); // Import Express framework
const router = express.Router(); // Create a new Router object to handle routes
const authService = require('../services/authService'); // Import the service that contains the business logic
const authMiddleware = require('../middleware/authMiddleware'); // Import middleware for security

/**
 * Auth Routes
 * Handles user authentication and registration.
 * Base URL: /api/auth
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public (Anyone can access this)
 */
router.post('/register', async (req, res, next) => {
    try {
        // req.body contains the data sent from the frontend (name, email, password)
        // We pass this data to the authService to handle the registration logic
        const user = await authService.registerUser(req.body);

        // If successful, we send back a 201 (Created) status and the user data
        res.status(201).json(user);
    } catch (error) {
        // If an error occurs (e.g., email already exists), we pass it to the error handler middleware
        next(error);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get token
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
    try {
        // We pass the login credentials (email, password) from req.body to the service
        const result = await authService.loginUser(req.body);

        // If login is successful, we return the user data and the JWT token
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify 2FA OTP
 * @access  Private (Requires valid token)
 */
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { userId, otp } = req.body;
        const result = await authService.verifyLoginOtp(userId, otp);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const result = await authService.resetPassword(email, otp, newPassword);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/auth/:id
 * @desc    Get user details by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
