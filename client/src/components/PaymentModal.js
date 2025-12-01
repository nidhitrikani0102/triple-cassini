import React, { useState, useEffect } from 'react';
import { Modal, Button, Tab, Nav, Alert } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import StripePaymentForm from './StripePaymentForm';
import MockPaymentForm from './MockPaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentModal = ({ show, onHide, booking, onSuccess }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show && booking) {
            // Create PaymentIntent as soon as the modal opens
            const createPaymentIntent = async () => {
                setLoading(true);
                setError(null);
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };

                    const res = await axios.post('http://localhost:5000/api/payments/create-stripe-intent', {
                        amount: booking.amount,
                        bookingId: booking._id
                    }, config);

                    setClientSecret(res.data.clientSecret);
                } catch (err) {
                    console.error("Error initializing Stripe:", err);
                    setError("Failed to initialize secure gateway. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            createPaymentIntent();
        }
    }, [show, booking]);

    const handleStripeSuccess = async (paymentIntent) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Confirm payment on backend to update status and budget
            await axios.post('http://localhost:5000/api/payments/confirm-stripe', {
                paymentIntentId: paymentIntent.id,
                bookingId: booking._id
            }, config);

            onSuccess();
        } catch (err) {
            console.error("Error confirming payment:", err);
            setError("Payment successful, but failed to update records. Please contact support.");
        }
    };

    if (!booking) return null;

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Complete Payment
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="mb-4 text-center">
                    <h2 className="display-4 fw-bold text-success">₹{booking.amount.toLocaleString('en-IN')}</h2>
                    <p className="text-muted">Total Amount Due</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Tab.Container defaultActiveKey="mock">
                    <Nav variant="pills" className="justify-content-center mb-4 gap-2">
                        <Nav.Item>
                            <Nav.Link eventKey="mock" className="rounded-pill px-4 fw-bold">
                                <i className="bi bi-wallet2 me-2"></i> EventEmpire Pay
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="stripe" className="rounded-pill px-4 fw-bold">
                                <i className="bi bi-credit-card me-2"></i> Card / UPI (Stripe)
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        <Tab.Pane eventKey="mock">
                            <MockPaymentForm
                                amount={booking.amount}
                                bookingId={booking._id}
                                onSuccess={onSuccess}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="stripe">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Initializing Secure Gateway...</p>
                                </div>
                            ) : clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <StripePaymentForm
                                        amount={booking.amount}
                                        onSuccess={handleStripeSuccess}
                                        onCancel={onHide}
                                    />
                                </Elements>
                            ) : (
                                <div className="text-center py-5 text-danger">
                                    <i className="bi bi-exclamation-circle fs-1 mb-2"></i>
                                    <p>Gateway initialization failed.</p>
                                    <Button variant="outline-danger" size="sm" onClick={onHide}>Close</Button>
                                </div>
                            )}
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
};

export default PaymentModal;
