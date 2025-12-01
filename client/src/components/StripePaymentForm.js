import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const StripePaymentForm = ({ amount, onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is not needed for this flow as we handle it inline, 
                // but Stripe requires it for some payment methods.
                return_url: 'http://localhost:3000/dashboard',
            },
            redirect: 'if_required',
        });

        if (error) {
            setError(error.message);
            setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment succeeded!
            onSuccess(paymentIntent); // Pass the intent back to parent
            setProcessing(false);
        } else {
            setError("Unexpected payment status.");
            setProcessing(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <div className="mb-4">
                <PaymentElement />
            </div>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            <div className="d-flex gap-3 justify-content-end mt-4">
                <Button variant="light" onClick={onCancel} disabled={processing} className="rounded-pill px-4">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || processing}
                    className="px-4 fw-bold rounded-pill"
                    style={{ background: '#635bff', border: 'none' }} // Stripe Blurple
                >
                    {processing ? <Spinner animation="border" size="sm" /> : `Pay ₹${amount.toLocaleString('en-IN')}`}
                </Button>
            </div>
        </Form>
    );
};

export default StripePaymentForm;
