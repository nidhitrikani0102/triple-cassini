const Stripe = require('stripe');
const Payment = require('../models/Payment');
const VendorAssignment = require('../models/VendorAssignment');
const Event = require('../models/Event');
const budgetService = require('../services/budgetService');

// Initialize Stripe with secret key from env
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Payment Intent
 * @route POST /api/payments/create-stripe-intent
 */
const createStripeIntent = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;

        if (!amount || !bookingId) {
            return res.status(400).json({ message: 'Amount and Booking ID are required' });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit (paise for INR)
            currency: 'inr',
            metadata: { bookingId },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Process Mock Payment (EventEmpire Pay)
 * @route POST /api/payments/mock-process
 */
const processMockPayment = async (req, res) => {
    try {
        const { amount, method, details, bookingId } = req.body;

        if (!amount || !method || !bookingId) {
            return res.status(400).json({ message: 'Missing required payment details' });
        }

        // Simulate processing delay (1.5 seconds)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate a mock transaction ID
        const transactionId = `MOCK_${method.toUpperCase()}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Create Payment Record
        const payment = new Payment({
            bookingId,
            amount,
            currency: 'INR',
            paymentMethod: `mock_${method}`,
            transactionId,
            status: 'success'
        });

        await payment.save();

        // Update VendorAssignment Status
        const assignment = await VendorAssignment.findById(bookingId);
        if (assignment) {
            await VendorAssignment.updateStatus(bookingId, 'Paid');

            // Add Expense to Budget
            // We need the event ID and the user ID (organizer)
            // assignment.event is populated in findById
            if (assignment.event) {
                const eventId = assignment.event._id;
                // The event owner is the user who should have the expense added
                // We can get this from the event object itself
                const event = await Event.findById(eventId);

                if (event) {
                    await budgetService.addExpense(eventId, {
                        title: `Vendor Payment: ${assignment.vendor?.user?.name || 'Vendor'}`,
                        amount: Number(amount),
                        category: 'Vendor'
                    }, event.user.toString());
                }
            }
        }

        res.json({
            success: true,
            message: 'Payment processed successfully via EventEmpire Secure Pay',
            transactionId,
            payment
        });

    } catch (error) {
        console.error('Mock Payment Error:', error);
        res.status(500).json({ message: 'Payment processing failed' });
    }
};

/**
 * Confirm Stripe Payment
 * @route POST /api/payments/confirm-stripe
 */
const confirmStripePayment = async (req, res) => {
    try {
        const { paymentIntentId, bookingId } = req.body;

        if (!paymentIntentId || !bookingId) {
            return res.status(400).json({ message: 'Payment Intent ID and Booking ID are required' });
        }

        // Retrieve the PaymentIntent to verify status
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not successful' });
        }

        // Check if payment already recorded to avoid duplicates
        const existingPayment = await Payment.findOne({ transactionId: paymentIntentId });
        if (existingPayment) {
            return res.json({ success: true, message: 'Payment already recorded' });
        }

        // Create Payment Record
        const payment = new Payment({
            bookingId,
            amount: paymentIntent.amount / 100, // Convert back from paise
            currency: paymentIntent.currency.toUpperCase(),
            paymentMethod: 'stripe',
            transactionId: paymentIntentId,
            status: 'success'
        });

        await payment.save();

        // Update VendorAssignment Status
        const assignment = await VendorAssignment.findById(bookingId);
        if (assignment) {
            await VendorAssignment.updateStatus(bookingId, 'Paid');

            // Add Expense to Budget
            if (assignment.event) {
                const eventId = assignment.event._id;
                const event = await Event.findById(eventId);

                if (event) {
                    await budgetService.addExpense(eventId, {
                        title: `Vendor Payment: ${assignment.vendor?.user?.name || 'Vendor'} (Stripe)`,
                        amount: payment.amount,
                        category: 'Vendor'
                    }, event.user.toString());
                }
            }
        }

        res.json({
            success: true,
            message: 'Stripe payment confirmed and recorded',
            payment
        });

    } catch (error) {
        console.error('Confirm Stripe Payment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createStripeIntent, processMockPayment, confirmStripePayment };
