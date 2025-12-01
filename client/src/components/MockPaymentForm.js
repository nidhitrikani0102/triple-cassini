import React, { useState } from 'react';
import { Form, Button, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

const MockPaymentForm = ({ amount, bookingId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [method, setMethod] = useState('card'); // card, upi, cash

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post('http://localhost:5000/api/payments/mock-process', {
                amount,
                bookingId,
                method,
                details: { mock: true }
            }, config);

            onSuccess();
        } catch (err) {
            console.error(err);
            setError('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}

            <div className="mb-4">
                <Form.Label className="fw-bold text-muted small text-uppercase">Select Payment Method</Form.Label>
                <Row className="g-3">
                    <Col xs={4}>
                        <Card
                            className={`text-center p-3 border-0 shadow-sm cursor-pointer ${method === 'card' ? 'bg-primary text-white' : 'bg-light'}`}
                            onClick={() => setMethod('card')}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <i className="bi bi-credit-card-2-front fs-3 mb-1"></i>
                            <small className="d-block fw-bold">Card</small>
                        </Card>
                    </Col>
                    <Col xs={4}>
                        <Card
                            className={`text-center p-3 border-0 shadow-sm cursor-pointer ${method === 'upi' ? 'bg-success text-white' : 'bg-light'}`}
                            onClick={() => setMethod('upi')}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <i className="bi bi-phone fs-3 mb-1"></i>
                            <small className="d-block fw-bold">UPI</small>
                        </Card>
                    </Col>
                    <Col xs={4}>
                        <Card
                            className={`text-center p-3 border-0 shadow-sm cursor-pointer ${method === 'cash' ? 'bg-warning text-dark' : 'bg-light'}`}
                            onClick={() => setMethod('cash')}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <i className="bi bi-cash-stack fs-3 mb-1"></i>
                            <small className="d-block fw-bold">Cash</small>
                        </Card>
                    </Col>
                </Row>
            </div>

            {method === 'card' && (
                <div className="p-3 bg-light rounded-3 mb-4 animate-fade-in">
                    <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">Card Number</Form.Label>
                        <Form.Control type="text" placeholder="0000 0000 0000 0000" disabled className="bg-white" />
                    </Form.Group>
                    <Row>
                        <Col>
                            <Form.Group>
                                <Form.Label className="small text-muted">Expiry</Form.Label>
                                <Form.Control type="text" placeholder="MM/YY" disabled className="bg-white" />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label className="small text-muted">CVV</Form.Label>
                                <Form.Control type="text" placeholder="123" disabled className="bg-white" />
                            </Form.Group>
                        </Col>
                    </Row>
                    <small className="text-muted mt-2 d-block fst-italic">* This is a mock payment simulation.</small>
                </div>
            )}

            {method === 'upi' && (
                <div className="p-3 bg-light rounded-3 mb-4 animate-fade-in text-center">
                    <i className="bi bi-qr-code-scan fs-1 text-muted mb-2"></i>
                    <p className="mb-0 text-muted">Scan QR or enter UPI ID to pay</p>
                </div>
            )}

            <div className="d-grid">
                <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="px-4 fw-bold py-3 rounded-pill shadow-sm"
                    style={{ background: 'linear-gradient(45deg, #FFD700, #FDB931)', border: 'none', color: '#000' }}
                >
                    {loading ? <Spinner animation="border" size="sm" /> : `Pay ₹${amount.toLocaleString('en-IN')}`}
                </Button>
            </div>
        </Form>
    );
};

export default MockPaymentForm;
