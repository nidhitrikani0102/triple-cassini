import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const InvitationsPage = () => {
    const [invitations, setInvitations] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedInvite, setSelectedInvite] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    const { user } = useContext(AuthContext);
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
        } catch (err) {
            console.error(err);
            setMessage('Failed to fetch invitations');
        }
    };

    const handleRSVP = async (guestId, status) => {
        try {
            await axios.post(`http://localhost:5000/api/guests/rsvp/${guestId}`, { status });
            setMessage(`Successfully ${status} invitation!`);

            setInvitations(invitations.map(inv =>
                inv._id === guestId ? { ...inv, status } : inv
            ));

            setTimeout(() => setMessage(''), 3000);
            if (selectedInvite && selectedInvite._id === guestId) {
                setSelectedInvite(prev => ({ ...prev, status }));
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to update status');
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

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInvitations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInvitations.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getThemeStyles = (theme) => {
        switch (theme) {
            case 'floral': return { bg: '#fff0f5', header: '#d63384', text: '#4a4a4a', border: '2px solid #f8bbd0' };
            case 'modern': return { bg: '#ffffff', header: '#0d6efd', text: '#212529', border: '1px solid #dee2e6' };
            case 'party': return { bg: '#212529', header: '#ffc107', text: '#ffffff', border: '2px solid #ffc107' };
            default: return { bg: '#f8f9fa', header: '#343a40', text: '#212529', border: '1px solid #dee2e6' };
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4"><i className="bi bi-envelope-paper-heart me-2"></i>My Invitations</h2>
            {message && <Alert variant="info">{message}</Alert>}

            {/* Search and Filter Controls */}
            <Card className="mb-4 shadow-sm border-0 bg-light">
                <Card.Body>
                    <Row className="g-3 align-items-center">
                        <Col md={6}>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search events, locations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex gap-2 justify-content-md-end overflow-auto">
                                {['All', 'Pending', 'Accepted', 'Declined'].map(status => (
                                    <Button
                                        key={status}
                                        variant={filterStatus === status ? 'primary' : 'outline-secondary'}
                                        size="sm"
                                        onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                                        className="rounded-pill px-3"
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {filteredInvitations.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <p className="lead text-muted mt-3">No invitations found matching your criteria.</p>
                </div>
            ) : (
                <>
                    <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                        {currentItems.map((invite) => {
                            const theme = invite.event?.invitationConfig?.theme || 'classic';
                            const styles = getThemeStyles(theme);

                            return (
                                <Col key={invite._id}>
                                    <Card className="h-100 shadow-sm" style={{ border: styles.border }}>
                                        <div style={{ backgroundColor: styles.header, height: '10px' }}></div>
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Badge bg="secondary">{invite.event?.type || 'Event'}</Badge>
                                                <small className="text-muted">{new Date(invite.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <Card.Title className="mb-3">{invite.event?.name || 'Unknown Event'}</Card.Title>
                                            <Card.Subtitle className="mb-3 text-muted">
                                                <i className="bi bi-calendar-event me-2"></i>
                                                {new Date(invite.event?.date).toLocaleDateString()} at {invite.event?.time}
                                            </Card.Subtitle>
                                            <Card.Text>
                                                <i className="bi bi-geo-alt me-2"></i>{invite.event?.location}
                                            </Card.Text>

                                            <div className="d-grid gap-2 mt-4">
                                                <Button variant="outline-primary" onClick={() => setSelectedInvite(invite)}>
                                                    <i className="bi bi-eye me-2"></i>View Full Invitation
                                                </Button>

                                                {invite.status === 'Pending' ? (
                                                    <div className="d-flex gap-2">
                                                        <Button variant="success" className="flex-grow-1" onClick={() => handleRSVP(invite._id, 'Accepted')}>
                                                            Accept
                                                        </Button>
                                                        <Button variant="danger" className="flex-grow-1" onClick={() => handleRSVP(invite._id, 'Declined')}>
                                                            Decline
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Badge bg={invite.status === 'Accepted' ? 'success' : 'danger'} className="p-2">
                                                        <i className={`bi bi-${invite.status === 'Accepted' ? 'check-circle' : 'x-circle'} me-2`}></i>
                                                        {invite.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                                    </li>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            )}

            {/* Creative Invitation Modal */}
            {selectedInvite && (
                <Modal show={true} onHide={() => setSelectedInvite(null)} size="lg" centered>
                    <Modal.Body className="p-0">
                        {(() => {
                            const theme = selectedInvite.event?.invitationConfig?.theme || 'classic';
                            const styles = getThemeStyles(theme);
                            const config = selectedInvite.event?.invitationConfig || {};

                            // Map Link Logic: Use provided link OR generate Google Maps Search link
                            const mapUrl = selectedInvite.event?.mapLink ||
                                (selectedInvite.event?.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedInvite.event.location)}` : null);

                            return (
                                <div style={{ backgroundColor: styles.bg, color: styles.text, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                                    <div className="p-4 text-center" style={{ backgroundColor: styles.header, color: '#fff' }}>
                                        <h1 className="display-5 mb-0" style={{ fontFamily: 'Georgia, serif' }}>You're Invited!</h1>
                                        <p className="lead mb-0 mt-2">to the {selectedInvite.event?.type}</p>
                                    </div>

                                    <div className="p-5 flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
                                        <h2 className="mb-4">{selectedInvite.event?.name}</h2>

                                        {config.customMessage && (
                                            <div className="mb-4 p-3 fst-italic position-relative" style={{ maxWidth: '80%' }}>
                                                <i className="bi bi-quote fs-1 position-absolute top-0 start-0 opacity-25"></i>
                                                <p className="mb-0 fs-5">{config.customMessage}</p>
                                            </div>
                                        )}

                                        <div className="my-4 p-4 rounded shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.1)' }}>
                                            <p className="fs-5 mb-2">
                                                <i className="bi bi-calendar3 me-2"></i>
                                                {new Date(selectedInvite.event?.date).toLocaleDateString()}
                                            </p>
                                            <p className="fs-5 mb-2">
                                                <i className="bi bi-clock me-2"></i>
                                                {selectedInvite.event?.time}
                                            </p>
                                            <p className="fs-5 mb-0">
                                                <i className="bi bi-geo-alt-fill me-2"></i>
                                                {selectedInvite.event?.location}
                                            </p>
                                        </div>

                                        {(config.showMap !== false) && mapUrl && (
                                            <a href={mapUrl} target="_blank" rel="noreferrer" className="btn btn-outline-danger btn-sm mt-2">
                                                <i className="bi bi-map me-2"></i>
                                                {selectedInvite.event?.mapLink ? 'View Map Location' : 'Search Location on Maps'}
                                            </a>
                                        )}
                                    </div>

                                    <div className="p-3 text-center border-top bg-light">
                                        {selectedInvite.status === 'Pending' ? (
                                            <div className="d-flex justify-content-center gap-3">
                                                <Button variant="success" size="lg" onClick={() => handleRSVP(selectedInvite._id, 'Accepted')}>
                                                    Accept Invitation
                                                </Button>
                                                <Button variant="danger" size="lg" onClick={() => handleRSVP(selectedInvite._id, 'Declined')}>
                                                    Decline
                                                </Button>
                                            </div>
                                        ) : (
                                            <h4 className={`text-${selectedInvite.status === 'Accepted' ? 'success' : 'danger'}`}>
                                                You have {selectedInvite.status} this invitation
                                            </h4>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
};

export default InvitationsPage;
