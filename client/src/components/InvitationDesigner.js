import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card, Badge } from 'react-bootstrap';

const InvitationDesigner = ({ show, onHide, event, onSave }) => {
    const [config, setConfig] = useState({
        theme: 'classic',
        customMessage: '',
        showMap: true
    });

    useEffect(() => {
        if (event && event.invitationConfig) {
            setConfig(event.invitationConfig);
        }
    }, [event]);

    const themes = [
        {
            id: 'classic',
            name: 'Classic Elegant',
            bg: '#f8f9fa',
            border: '2px solid #343a40',
            font: 'Playfair Display, serif',
            color: '#343a40',
            description: 'Timeless black and white elegance.'
        },
        {
            id: 'floral',
            name: 'Floral Romance',
            bg: '#fff0f5',
            border: '2px dashed #d63384',
            font: 'Dancing Script, cursive',
            color: '#d63384',
            description: 'Soft pinks for a romantic touch.'
        },
        {
            id: 'modern',
            name: 'Modern Minimal',
            bg: '#ffffff',
            border: '4px solid #0d6efd',
            font: 'Roboto, sans-serif',
            color: '#212529',
            description: 'Clean lines and bold typography.'
        },
        {
            id: 'luxury',
            name: 'Golden Luxury',
            bg: '#1a1a1a',
            border: '2px solid #ffd700',
            font: 'Cinzel, serif',
            color: '#ffd700',
            description: 'Premium dark mode with gold accents.'
        },
        {
            id: 'rustic',
            name: 'Rustic Charm',
            bg: '#f5f5dc',
            border: '4px double #8b4513',
            font: 'Courier New, monospace',
            color: '#5d4037',
            description: 'Vintage vibes with earth tones.'
        },
        {
            id: 'party',
            name: 'Party Vibes',
            bg: '#212529',
            border: '2px solid #ffc107',
            font: 'Pacifico, cursive',
            color: '#fff',
            description: 'Fun and energetic for celebrations.'
        }
    ];

    const currentTheme = themes.find(t => t.id === config.theme) || themes[0];

    const handleSave = () => {
        onSave(config);
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered dialogClassName="modal-90w">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold display-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Design Your Invitation
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row>
                    {/* Left Panel: Controls */}
                    <Col lg={4} className="border-end">
                        <h5 className="fw-bold mb-3">1. Choose a Theme</h5>
                        <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {themes.map(t => (
                                <Card
                                    key={t.id}
                                    className={`cursor-pointer transition-all ${config.theme === t.id ? 'border-primary shadow' : 'border-light'}`}
                                    onClick={() => setConfig({ ...config, theme: t.id })}
                                    style={{ cursor: 'pointer', borderWidth: config.theme === t.id ? '2px' : '1px' }}
                                >
                                    <Card.Body className="d-flex align-items-center gap-3 p-3">
                                        <div
                                            className="rounded-circle border"
                                            style={{ width: '40px', height: '40px', background: t.bg, borderColor: t.color }}
                                        ></div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">{t.name}</h6>
                                            <small className="text-muted">{t.description}</small>
                                        </div>
                                        {config.theme === t.id && <i className="bi bi-check-circle-fill text-primary ms-auto fs-5"></i>}
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>

                        <h5 className="fw-bold mb-3">2. Customize Content</h5>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Personal Message</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={config.customMessage}
                                    onChange={(e) => setConfig({ ...config, customMessage: e.target.value })}
                                    placeholder="Add a warm welcome message..."
                                    className="bg-light border-0"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="map-switch"
                                    label="Include Map Link"
                                    checked={config.showMap}
                                    onChange={(e) => setConfig({ ...config, showMap: e.target.checked })}
                                    className="fw-bold"
                                />
                            </Form.Group>
                        </Form>
                    </Col>

                    {/* Right Panel: Live Preview */}
                    <Col lg={8} className="d-flex align-items-center justify-content-center bg-light rounded-3 p-5 position-relative">
                        <Badge bg="dark" className="position-absolute top-0 end-0 m-3">Live Preview</Badge>

                        <div
                            className="shadow-lg p-5 text-center position-relative"
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                minHeight: '600px',
                                backgroundColor: currentTheme.bg,
                                border: currentTheme.border,
                                fontFamily: currentTheme.font,
                                color: currentTheme.color,
                                borderRadius: '10px',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Decorative Elements based on theme could go here */}

                            <div className="mb-5">
                                <small className="text-uppercase tracking-widest opacity-75">You Are Cordially Invited To</small>
                            </div>

                            <h1 className="display-4 fw-bold mb-4" style={{ wordBreak: 'break-word' }}>
                                {event?.name || 'Event Name'}
                            </h1>

                            <div className="my-4 py-3 border-top border-bottom" style={{ borderColor: currentTheme.color, opacity: 0.5 }}>
                                <p className="fs-4 mb-0">{new Date(event?.date).toLocaleDateString()}</p>
                                <p className="fs-5 mb-0">at {event?.time}</p>
                            </div>

                            <p className="fs-5 mb-4">{event?.location}</p>

                            {config.customMessage && (
                                <div className="mb-5 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                    <p className="mb-0 fst-italic" style={{ whiteSpace: 'pre-wrap' }}>"{config.customMessage}"</p>
                                </div>
                            )}

                            <div className="mt-auto">
                                <Button
                                    variant={config.theme === 'luxury' || config.theme === 'party' ? 'light' : 'dark'}
                                    size="lg"
                                    className="rounded-pill px-5 fw-bold"
                                >
                                    RSVP Now
                                </Button>
                                {config.showMap && (
                                    <div className="mt-3">
                                        <small className="text-decoration-underline cursor-pointer opacity-75">View on Map</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="light" onClick={onHide} className="rounded-pill px-4">Cancel</Button>
                <Button variant="primary" onClick={handleSave} className="rounded-pill px-5 fw-bold shadow">
                    Save & Send
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InvitationDesigner;
