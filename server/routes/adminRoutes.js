const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Admin Routes
 * Handles administrative actions.
 * Base URL: /api/admin
 */

// Middleware: Protect all routes (Login required) and restrict to 'admin' role
// 1. authMiddleware.protect: Checks for a valid JWT token (user is logged in)
// 2. authMiddleware.admin: Checks if the user's role is 'admin' (user has permission)
router.use(authMiddleware.protect);
router.use(authMiddleware.admin);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
/**
 * @route   GET /api/admin/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/users', async (req, res, next) => {
    try {
        const users = await adminService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/vendors
 * @desc    Get all vendors (Admin only)
 * @access  Private/Admin
 */
router.get('/vendors', async (req, res, next) => {
    try {
        const vendors = await adminService.getAllVendors();
        res.json(vendors);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update a user (e.g., block/unblock) (Admin only)
 * @access  Private/Admin
 */
router.put('/users/:id', async (req, res, next) => {
    try {
        const updatedUser = await adminService.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user (Admin only)
 * @access  Private/Admin
 */
router.delete('/users/:id', async (req, res, next) => {
    try {
        const result = await adminService.deleteUser(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
