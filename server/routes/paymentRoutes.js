const express = require('express');
const router = express.Router();
const { createStripeIntent, processMockPayment, confirmStripePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All payment routes should be protected
router.post('/create-stripe-intent', protect, createStripeIntent);
router.post('/mock-process', protect, processMockPayment);
router.post('/confirm-stripe', protect, confirmStripePayment);

module.exports = router;
