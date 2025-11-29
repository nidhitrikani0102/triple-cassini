import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Card, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import confetti from 'canvas-confetti';

const InvitationView = () => {
    const { guestId } = useParams();
    const [searchParams] = useSearchParams();
    const initialStatus = searchParams.get('status');

    const [guest, setGuest] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // RSVP Form State
    const [status, setStatus] = useState(initialStatus || 'Pending');
    const [dietaryRestrictions, setDietaryRestrictions] = useState('');
    const [plusOne, setPlusOne] = useState(false);
    const [plusOneName, setPlusOneName] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/guests/public/${guestId}`);
                setGuest(res.data.guest);
                setEvent(res.data.event);

                if (res.data.guest.dietaryRestrictions) setDietaryRestrictions(res.data.guest.dietaryRestrictions);
                if (res.data.guest.plusOne) setPlusOne(true);
                if (res.data.guest.plusOneName) setPlusOneName(res.data.guest.plusOneName);

                if (res.data.guest.status !== 'Pending') {
                    setSubmitted(true); // Lock if already responded
                    setStatus(res.data.guest.status);
                } else {
                    setStatus('Pending');
                }

                // Check for Event Expiry
                if (new Date(res.data.event.date) < new Date()) {
                    setError('This event has already passed.');
                }

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Invalid invitation link or event has passed.');
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [guestId, initialStatus]);

    const handleOpenEnvelope = () => {
        setIsOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/guests/rsvp/${guestId}`, {
                status,
                dietaryRestrictions,
                plusOne,
                plusOneName,
                message
            });
            setSubmitted(true);
            if (status === 'Accepted') {
                triggerConfetti();
            }
        } catch (err) {
            console.error(err);
            setError('Failed to submit RSVP. Please try again.');
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#B76E79', '#ffffff']
        });
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">{error}</Alert>
        </Container>
    );

    if (submitted) return (
        <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Card className="text-center p-5 shadow-lg border-0 premium-card fade-in-up" style={{ maxWidth: '500px', borderRadius: '20px' }}>
                <div className={`mb-4 display-1 ${status === 'Accepted' ? 'text-success' : 'text-muted'}`}>
                    <i className={`bi ${status === 'Accepted' ? 'bi-check-circle-fill' : 'bi-envelope-check'}`}></i>
                </div>
                <h2 className="mb-3 fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {status === 'Accepted' ? 'Thank You!' : 'Response Sent'}
                </h2>
                <p className="lead text-muted">
                    {status === 'Accepted'
                        ? <span>Your RSVP has been sent to <strong>{event.user.name}</strong>.</span>
                        : <span>We're sorry you can't make it, but thank you for letting us know.</span>
                    }
                </p>
                {status === 'Accepted' && (
                    <div className="mt-4 p-3 bg-light rounded-3">
                        <p className="mb-0">We can't wait to see you there!</p>
                        <p className="fw-bold mb-0">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                    </div>
                )}

                {/* Back to Dashboard Button for Logged-in Users */}
                {localStorage.getItem('token') && (
                    <div className="mt-4 pt-3 border-top">
                        <Button variant="outline-dark" className="rounded-pill px-4" onClick={() => window.location.href = '/dashboard'}>
                            <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
                        </Button>
                    </div>
                )}
            </Card>
        </Container>
    );

    // Theme Styles
    const themeStyles = {
        classic: { bg: '#f8f9fa', border: 'none', font: 'Playfair Display, serif' },
        floral: { bg: '#fff0f5', border: '2px dashed #d63384', font: 'Dancing Script, cursive' },
        modern: { bg: '#ffffff', border: '4px solid #0d6efd', font: 'Roboto, sans-serif' },
        luxury: { bg: '#1a1a1a', border: '2px solid #ffd700', font: 'Cinzel, serif', color: '#ffd700' },
        rustic: { bg: '#f5f5dc', border: '4px double #8b4513', font: 'Courier New, monospace' },
        party: { bg: '#212529', border: '2px solid #ffc107', font: 'Pacifico, cursive', color: '#fff' }
    };

    const currentTheme = themeStyles[event.invitationConfig?.theme] || themeStyles.classic;

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#e9ecef', padding: '20px', overflow: 'hidden' }}>

            {/* Envelope Container */}
            <div className={`envelope-wrapper ${isOpen ? 'open' : ''}`} style={{ maxWidth: '800px', width: '100%', height: isOpen ? 'auto' : '500px' }} onClick={!isOpen ? handleOpenEnvelope : undefined}>

                {/* The Envelope (Visible only when closed or opening) */}
                <div className={`envelope ${isOpen ? 'open' : ''}`} style={{ display: isOpen ? 'none' : 'block' }}>
                    <div className="envelope-flap"></div>
                    <div className="envelope-body d-flex justify-content-center align-items-center flex-column">
                        <div className="text-center p-4">
                            <h3 className="text-muted mb-3" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '2px' }}>A Special Invitation For</h3>
                            <h1 className="display-4 fw-bold text-dark">{guest.name}</h1>
                            <p className="mt-4 text-muted small text-uppercase">Tap to Open</p>
                        </div>
                    </div>
                </div>

                {/* The Invitation Card (Revealed) */}
                <div className={`invitation-card-slide ${isOpen ? 'fade-in-up' : ''}`} style={{ display: isOpen ? 'block' : 'none' }}>
                    <div className="shadow-lg overflow-hidden premium-card" style={{ borderRadius: '15px', background: 'white' }}>

                        {/* Invitation Header */}
                        <div className="p-5 text-center position-relative" style={{
                            backgroundColor: currentTheme.bg,
                            borderBottom: currentTheme.border,
                            fontFamily: currentTheme.font,
                            color: currentTheme.color || '#212529'
                        }}>
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-shape shape-1"></div>
                            <div className="position-absolute bottom-0 end-0 w-100 h-100 bg-shape shape-2"></div>

                            <small className="text-uppercase tracking-widest opacity-75 position-relative z-1">You Are Cordially Invited To</small>
                            <h1 className="display-3 fw-bold my-4 position-relative z-1">{event.name}</h1>
                            <div className="d-flex justify-content-center gap-4 mb-4 position-relative z-1">
                                <div>
                                    <i className="bi bi-calendar-event fs-4 d-block mb-1"></i>
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <i className="bi bi-clock fs-4 d-block mb-1"></i>
                                    <span>{event.time}</span>
                                </div>
                            </div>
                            <p className="mb-0 fs-5 position-relative z-1"><i className="bi bi-geo-alt-fill me-2"></i>{event.location}</p>

                            {event.invitationConfig?.customMessage && (
                                <div className="mt-5 p-4 d-inline-block position-relative z-1" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '10px', backdropFilter: 'blur(5px)' }}>
                                    <em className="fs-5">"{event.invitationConfig.customMessage}"</em>
                                </div>
                            )}
                        </div>

                        {/* RSVP Form */}
                        <div className="p-5 bg-white">
                            <h3 className="text-center fw-bold mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>RSVP</h3>
                            <Form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div className="d-flex justify-content-center gap-4 mb-5">
                                    <Button
                                        variant={status === 'Accepted' ? 'success' : 'outline-success'}
                                        className={`px-5 py-3 rounded-pill fw-bold flex-grow-1 transform-hover ${status === 'Accepted' ? 'ring-4 ring-success shadow-lg scale-105' : ''}`}
                                        onClick={() => setStatus('Accepted')}
                                        style={{ transition: 'all 0.3s ease', transform: status === 'Accepted' ? 'scale(1.05)' : 'scale(1)' }}
                                    >
                                        <i className="bi bi-check-lg me-2"></i> Joyfully Accept
                                    </Button>
                                    <Button
                                        variant={status === 'Declined' ? 'danger' : 'outline-danger'}
                                        className={`px-5 py-3 rounded-pill fw-bold flex-grow-1 transform-hover ${status === 'Declined' ? 'ring-4 ring-danger shadow-lg scale-105' : ''}`}
                                        onClick={() => setStatus('Declined')}
                                        style={{ transition: 'all 0.3s ease', transform: status === 'Declined' ? 'scale(1.05)' : 'scale(1)' }}
                                    >
                                        <i className="bi bi-x-lg me-2"></i> Regretfully Decline
                                    </Button>
                                </div>

                                {status === 'Accepted' && (
                                    <div className="fade-in-up">
                                        <Row>
                                            <Col md={12}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-bold text-muted small text-uppercase">Dietary Restrictions</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Any allergies or preferences?"
                                                        value={dietaryRestrictions}
                                                        onChange={(e) => setDietaryRestrictions(e.target.value)}
                                                        className="border-light bg-light p-3 rounded-3"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group className="mb-4">
                                                    <Form.Check
                                                        type="switch"
                                                        id="plus-one-switch"
                                                        label="Bringing a Plus One?"
                                                        checked={plusOne}
                                                        onChange={(e) => setPlusOne(e.target.checked)}
                                                        className="fs-5"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            {plusOne && (
                                                <Col md={12}>
                                                    <Form.Group className="mb-4 fade-in-up">
                                                        <Form.Label className="fw-bold text-muted small text-uppercase">Plus One Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Name of your guest"
                                                            value={plusOneName}
                                                            onChange={(e) => setPlusOneName(e.target.value)}
                                                            required
                                                            className="border-light bg-light p-3 rounded-3"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            )}
                                        </Row>
                                    </div>
                                )}

                                <Form.Group className="mb-5">
                                    <Form.Label className="fw-bold text-muted small text-uppercase">Message for the Host (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="border-light bg-light p-3 rounded-3"
                                        placeholder="Send your best wishes..."
                                    />
                                </Form.Group>

                                <div className="text-center">
                                    <Button type="submit" variant="dark" size="lg" className="rounded-pill px-5 py-3 shadow-lg transform-hover">
                                        Confirm RSVP
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvitationView;
