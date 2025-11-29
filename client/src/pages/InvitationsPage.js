import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const InvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedInvite, setSelectedInvite] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchInvitations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInvitations = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/guests/my-invitations', config);
            setInvitations(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setMessage('Failed to fetch invitations');
            setLoading(false);
        }
    };

    // Filter and Search Logic
    const filteredInvitations = invitations.filter(invite => {
        const matchesSearch = (
            invite.event?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invite.event?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invite.event?.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = filterStatus === 'All' || invite.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getThemeStyles = (theme) => {
        switch (theme) {
            case 'floral': return { bg: '#fff0f5', accent: '#d63384', text: '#4a4a4a' };
            case 'modern': return { bg: '#ffffff', accent: '#0d6efd', text: '#212529' };
            case 'luxury': return { bg: '#1a1a1a', accent: '#ffd700', text: '#ffd700' };
            case 'party': return { bg: '#212529', accent: '#ffc107', text: '#ffffff' };
            default: return { bg: '#f8f9fa', accent: '#343a40', text: '#212529' };
        }
    };

    return (
        <Container className="mt-5 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="display-5 fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>My Event Wallet</h1>
                    <p className="text-muted">Manage your upcoming social calendar</p>
                </div>
                <div className="d-flex gap-2">
                    {['All', 'Pending', 'Accepted', 'Declined'].map(status => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'dark' : 'outline-secondary'}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                            className="rounded-pill px-3"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {message && <Alert variant="info">{message}</Alert>}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : filteredInvitations.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3">
                    <i className="bi bi-envelope-open display-1 text-muted opacity-25"></i>
                    <p className="lead text-muted mt-3">No invitations found.</p>
                </div>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {filteredInvitations.map((invite) => {
                        const theme = invite.event?.invitationConfig?.theme || 'classic';
                        const styles = getThemeStyles(theme);
                        const isDark = ['luxury', 'party'].includes(theme);

                        return (
                            <Col key={invite._id}>
                                <div
                                    className="position-relative h-100 transform-hover"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/invitation/${invite._id}`)}
                                >
                                    {/* Ticket Stub Effect */}
                                    <div className="position-absolute top-50 start-0 translate-middle-y bg-light rounded-circle" style={{ width: '20px', height: '20px', left: '-10px', zIndex: 1 }}></div>
                                    <div className="position-absolute top-50 end-0 translate-middle-y bg-light rounded-circle" style={{ width: '20px', height: '20px', right: '-10px', zIndex: 1 }}></div>

                                    <Card className="h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
                                        {/* Header Image/Color */}
                                        <div className="p-4 text-center position-relative" style={{ backgroundColor: styles.bg, color: styles.text, borderBottom: `2px dashed ${styles.accent}40` }}>
                                            <Badge bg="light" text="dark" className="position-absolute top-0 end-0 m-3 shadow-sm">
                                                {invite.event?.type}
                                            </Badge>

                                            <div className="mb-2 opacity-50 text-uppercase small tracking-widest">Invitation To</div>
                                            <h3 className="fw-bold mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>{invite.event?.name}</h3>
                                        </div>

                                        {/* Body */}
                                        <Card.Body className="p-4 bg-white">
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="rounded-circle bg-light p-2 me-3 text-center" style={{ width: '50px', height: '50px' }}>
                                                    <div className="fw-bold text-danger">{new Date(invite.event?.date).getDate()}</div>
                                                    <div className="small text-uppercase" style={{ fontSize: '0.6rem' }}>{new Date(invite.event?.date).toLocaleString('default', { month: 'short' })}</div>
                                                </div>
                                                <div>
                                                    <div className="fw-bold">{new Date(invite.event?.date).toLocaleDateString()}</div>
                                                    <div className="text-muted small">{invite.event?.time}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-start mb-4">
                                                <i className="bi bi-geo-alt text-danger me-3 mt-1"></i>
                                                <div className="text-muted small">{invite.event?.location}</div>
                                            </div>

                                            {/* Status Stamp */}
                                            <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                                <div className={`fw-bold text-uppercase small ${invite.status === 'Accepted' ? 'text-success' :
                                                        invite.status === 'Declined' ? 'text-danger' : 'text-warning'
                                                    }`}>
                                                    <i className={`bi bi-${invite.status === 'Accepted' ? 'check-circle-fill' :
                                                            invite.status === 'Declined' ? 'x-circle-fill' : 'clock-fill'
                                                        } me-2`}></i>
                                                    {invite.status}
                                                </div>
                                                <Button variant="link" className="text-decoration-none p-0 text-dark">
                                                    Open <i className="bi bi-arrow-right ms-1"></i>
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </Container>
    );
};

export default InvitationsPage;
