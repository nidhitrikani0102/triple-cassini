import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RSVPPage = () => {
    const { guestId } = useParams();
    const [status, setStatus] = useState(null); // 'Accepted', 'Declined', or null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRSVP = async (response) => {
        setLoading(true);
        setError(null);
        try {
            await axios.post(`http://localhost:5000/api/guests/rsvp/${guestId}`, { status: response });
            setStatus(response);
        } catch (err) {
            console.error(err);
            setError('Failed to submit RSVP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (status) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
                <Card className="text-center shadow-sm border-0" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
                    <Card.Body>
                        <div className="mb-4">
                            {status === 'Accepted' ? (
                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                            ) : (
                                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                            )}
                        </div>
                        <h2 className="mb-3">{status === 'Accepted' ? 'See you there!' : 'Maybe next time!'}</h2>
                        <p className="text-muted">
                            {status === 'Accepted'
                                ? "Thank you for accepting the invitation. We're excited to see you!"
                                : "Thank you for letting us know. We'll miss you!"}
                        </p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Card className="text-center shadow-lg border-0" style={{ maxWidth: '500px', width: '100%', borderRadius: '20px' }}>
                <Card.Body className="p-5">
                    <h1 className="display-6 fw-bold mb-4">RSVP</h1>
                    <p className="lead mb-5">Please confirm your attendance.</p>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="d-grid gap-3">
                        <Button
                            variant="success"
                            size="lg"
                            onClick={() => handleRSVP('Accepted')}
                            disabled={loading}
                            className="py-3 fw-bold"
                        >
                            {loading ? 'Processing...' : '✅ Accept Invitation'}
                        </Button>
                        <Button
                            variant="outline-danger"
                            size="lg"
                            onClick={() => handleRSVP('Declined')}
                            disabled={loading}
                            className="py-3 fw-bold"
                        >
                            {loading ? 'Processing...' : '❌ Decline Invitation'}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RSVPPage;
