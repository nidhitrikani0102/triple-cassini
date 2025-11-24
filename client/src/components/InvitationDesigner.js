import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';

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
        { id: 'classic', name: 'Classic Elegant', bg: '#f8f9fa', border: '2px solid #343a40', font: 'serif' },
        { id: 'floral', name: 'Floral Romance', bg: '#fff0f5', border: '2px dashed #d63384', font: 'cursive' },
        { id: 'modern', name: 'Modern Minimal', bg: '#ffffff', border: '4px solid #0d6efd', font: 'sans-serif' },
        { id: 'party', name: 'Party Vibes', bg: '#212529', border: '2px solid #ffc107', font: 'fantasy', color: '#fff' }
    ];

    const currentTheme = themes.find(t => t.id === config.theme) || themes[0];

    const handleSave = () => {
        onSave(config);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Design Your Invitation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={4}>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Select Theme</Form.Label>
                                <Form.Select
                                    value={config.theme}
                                    onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                                >
                                    {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Custom Message</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={config.customMessage}
                                    onChange={(e) => setConfig({ ...config, customMessage: e.target.value })}
                                    placeholder="Add a personal note..."
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    label="Show Map Link"
                                    checked={config.showMap}
                                    onChange={(e) => setConfig({ ...config, showMap: e.target.checked })}
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col md={8}>
                        <h5 className="text-center mb-3">Live Preview</h5>
                        <Card
                            className="p-4 shadow text-center h-100 d-flex flex-column justify-content-center"
                            style={{
                                backgroundColor: currentTheme.bg,
                                border: currentTheme.border,
                                fontFamily: currentTheme.font,
                                color: currentTheme.color || '#000'
                            }}
                        >
                            <h2 className="mb-4">You're Invited!</h2>
                            <h3 className="mb-2">{event?.name || 'Event Name'}</h3>
                            <p className="lead">{new Date(event?.date).toLocaleDateString()} at {event?.time}</p>
                            <p className="mb-4">{event?.location}</p>

                            {config.customMessage && (
                                <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '10px' }}>
                                    <em>"{config.customMessage}"</em>
                                </div>
                            )}

                            {config.showMap && (
                                <Button variant="outline-primary" size="sm" className="mt-auto mx-auto" style={{ maxWidth: '200px' }}>
                                    View Map
                                </Button>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
                <Button variant="primary" onClick={handleSave}>Save Design</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InvitationDesigner;
