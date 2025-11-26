const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Search users by name or email
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
    try {
        const { query } = req.query;
        console.log(`[SEARCH DEBUG] User search query: "${query}"`);
        if (!query) {
            return res.json([]);
        }

        // Search by name or email, case-insensitive, exclude current user
        const users = await User.findWithSelect({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user._id } // Exclude self
        }, 'name email _id'); // Only return necessary fields

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
