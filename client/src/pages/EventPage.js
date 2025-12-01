import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Tab, Nav, Card, Button, Form, Modal, ListGroup, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import InvitationDesigner from '../components/InvitationDesigner';

const EventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [event, setEvent] = useState(null);
    const [guests, setGuests] = useState([]);
    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [newGuest, setNewGuest] = useState({ name: '', email: '' });
    const [invitationType, setInvitationType] = useState('Email'); // 'Email' or 'InApp'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    // Invitation Designer State
    const [showInvitationModal, setShowInvitationModal] = useState(false);

    // Edit Event State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editEventData, setEditEventData] = useState({
        name: '',
        date: '',
        time: '',
        location: '',
        mapLink: '',
        type: '',
        description: '',
    });

    // Budget State
    const [totalBudget, setTotalBudget] = useState(0);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: '' });
    const [showBudgetModal, setShowBudgetModal] = useState(false);

    // Vendor Assignment State
    const [vendors, setVendors] = useState([]);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ vendorId: '', amount: '', serviceType: '' });
    const [vendorSearchQuery, setVendorSearchQuery] = useState('');
    const [vendorSearchResults, setVendorSearchResults] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    // State for editing assignment
    const [isEditingAssignment, setIsEditingAssignment] = useState(false);
    const [editingAssignmentId, setEditingAssignmentId] = useState(null);
    const [vendorSearchPage, setVendorSearchPage] = useState(1);
    const [vendorSearchTotalPages, setVendorSearchTotalPages] = useState(1);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchEventDetails();
        fetchGuests();
        fetchBudgetDetails();
        fetchAssignments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Debounced User Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2 && invitationType === 'InApp') {
                try {
                    const res = await axios.get(`http://localhost:5000/api/users/search?query=${searchQuery}`, config);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error("Search failed", err);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, invitationType]);

    // Debounced Vendor Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (vendorSearchQuery.length > 2) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/vendors/search?query=${vendorSearchQuery}`, config);
                    // Check if response is array or object with vendors property
                    if (Array.isArray(res.data)) {
                        setVendorSearchResults(res.data);
                    } else if (res.data && Array.isArray(res.data.vendors)) {
                        setVendorSearchResults(res.data.vendors);
                    } else {
                        setVendorSearchResults([]);
                    }
                } catch (err) {
                    console.error("Vendor search failed", err);
                }
            } else {
                setVendorSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [vendorSearchQuery]);

    // Fetch event details from the backend
    const fetchEventDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/events/${id}`, config);
            setEvent(res.data);
            // Pre-fill the edit form with the fetched data
            setEditEventData({
                name: res.data.name,
                date: res.data.date.split('T')[0], // Format date for HTML input (YYYY-MM-DD)
                time: res.data.time,
                location: res.data.location,
                mapLink: res.data.mapLink || '',
                type: res.data.type,
                description: res.data.description,
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setMessage({ type: 'danger', text: 'Error fetching event details' });
        }
    };

    // Fetch the list of guests for this event
    const fetchGuests = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/guests/${id}`, config);
            // Check if response is array or object with guests property
            if (Array.isArray(res.data)) {
                setGuests(res.data);
            } else if (res.data && Array.isArray(res.data.guests)) {
                setGuests(res.data.guests);
            } else {
                setGuests([]);
            }
        } catch (err) {
            console.error("Error fetching guests:", err);
        }
    };

    // Fetch budget details for this event
    const fetchBudgetDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/budget/${id}`, config);
            if (res.data) {
                setBudget(res.data);
                setTotalBudget(res.data.totalBudget);
            }
        } catch (err) {
            console.error("Error fetching budget:", err);
        }
    };

    // Fetch assignments for this event
    const fetchAssignments = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/assignments/event/${id}`, config);
            // Check if response is array or object with assignments property
            if (Array.isArray(res.data)) {
                setVendors(res.data);
            } else if (res.data && Array.isArray(res.data.assignments)) {
                setVendors(res.data.assignments);
            } else {
                setVendors([]);
            }
        } catch (err) {
            console.error("Error fetching assignments:", err);
        }
    };

    // Handle updating event details
    const handleUpdateEvent = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/events/${id}`, editEventData, config);
            setEvent(res.data);
            setShowEditModal(false);
            setMessage({ type: 'success', text: 'Event updated successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error updating event' });
        }
    };

    // Handle adding a new guest
    const handleAddGuest = async () => {
        try {
            let guestPayload = { ...newGuest, invitationType };

            if (invitationType === 'InApp') {
                if (selectedUsers.length === 0) {
                    setMessage({ type: 'danger', text: 'Please select at least one user' });
                    return;
                }
                // Prepare array of guests for bulk insert
                guestPayload = selectedUsers.map(u => ({
                    name: u.name,
                    email: u.email,
                    userId: u._id,
                    invitationType: 'InApp'
                }));
            }

            await axios.post(`http://localhost:5000/api/guests/${id}`, guestPayload, config);
            fetchGuests(); // Refresh guests list to show the new guest
            setShowGuestModal(false);
            setNewGuest({ name: '', email: '' });
            setSelectedUsers([]);
            setSearchQuery('');
            setMessage({ type: 'success', text: 'Invitations sent successfully' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error adding guest' });
        }
    };

    // Handle resending invitation
    const handleResendInvitation = async (guestId) => {
        try {
            await axios.post(`http://localhost:5000/api/guests/resend/${guestId}`, {}, config);
            setMessage({ type: 'success', text: 'Invitation resent successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error resending invitation' });
        }
    };

    // Handle saving the invitation design
    const handleSaveInvitation = async (invitationConfig) => {
        try {
            // Update the event with the new invitation configuration
            const res = await axios.put(`http://localhost:5000/api/events/${id}`, { invitationConfig }, config);
            setEvent(res.data);
            setShowInvitationModal(false);
            setMessage({ type: 'success', text: 'Invitation design saved successfully!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error saving invitation design' });
        }
    };

    // Handle updating the total budget amount
    const handleUpdateBudget = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/budget/${id}`, { totalBudget: Number(totalBudget) }, config);
            setBudget(res.data);
            setMessage({ type: 'success', text: 'Budget updated successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error updating budget' });
        }
    };

    // Handle adding a new expense
    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:5000/api/budget/${id}/expenses`, {
                title: newExpense.title,
                amount: Number(newExpense.amount),
                category: newExpense.category
            }, config);

            // The backend returns the updated budget and an alert flag if over budget
            setBudget(res.data.budget);
            setNewExpense({ title: '', amount: '', category: '' });
            setShowBudgetModal(false);

            if (res.data.alert) {
                setMessage({ type: 'warning', text: 'Warning: You are close to or have exceeded your budget limit!' });
            } else {
                setMessage({ type: 'success', text: 'Expense added successfully' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error adding expense' });
        }
    };

    // Handle assigning a vendor
    const handleAssignVendor = async () => {
        try {
            if (!selectedVendor || !newAssignment.amount) {
                setMessage({ type: 'danger', text: 'Please select a vendor and enter amount' });
                return;
            }

            if (isEventPassed) {
                setMessage({ type: 'danger', text: 'Cannot assign vendors to past events' });
                return;
            }

            await axios.post('http://localhost:5000/api/assignments', {
                eventId: id,
                vendorId: selectedVendor._id,
                amount: Number(newAssignment.amount),
                serviceType: selectedVendor.serviceType // Default to vendor's service type
            }, config);

            fetchAssignments();
            setShowVendorModal(false);
            setNewAssignment({ vendorId: '', amount: '', serviceType: '' });
            setSelectedVendor(null);
            setVendorSearchQuery('');
            setMessage({ type: 'success', text: 'Vendor assigned successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error assigning vendor' });
        }
    };

    // Handle processing payment
    const handleProcessPayment = async (assignmentId) => {
        try {
            await axios.put(`http://localhost:5000/api/assignments/${assignmentId}/status`, { status: 'Paid' }, config);
            fetchAssignments();
            fetchBudgetDetails(); // Refresh budget to show new expense
            setMessage({ type: 'success', text: 'Payment processed and expense added to budget!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error processing payment' });
        }
    };

    if (loading) return <Container className="mt-4">Loading...</Container>;
    if (!event) return <Container className="mt-4">Event not found</Container>;

    // Budget Calculations
    const totalSpent = budget?.expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const remainingBudget = (budget?.totalBudget || 0) - totalSpent;

    // Helper for Countdown
    const calculateTimeLeft = () => {
        if (!event?.date) return {};
        const difference = +new Date(event.date) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return timeLeft;
    };
    const timeLeft = calculateTimeLeft();
    const isEventPassed = new Date(event.date) < new Date();

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '50px' }}>
            {/* Hero Section */}
            <div className="position-relative mb-5" style={{ height: '400px', overflow: 'hidden', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)' }}>
                <div className="position-absolute w-100 h-100" style={{ background: 'rgba(0,0,0,0.4)' }}></div>
                <Container className="position-relative h-100 d-flex flex-column justify-content-center text-white">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <Badge bg="warning" text="dark" className="mb-3 px-3 py-2 rounded-pill text-uppercase fw-bold tracking-wider">
                                {event.type} Event
                            </Badge>
                            <h1 className="display-3 fw-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>{event.name}</h1>
                            <p className="fs-5 opacity-75"><i className="bi bi-geo-alt me-2"></i>{event.location} &bull; {new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="light" className="rounded-pill px-4 fw-bold shadow-lg" onClick={() => setShowEditModal(true)}>
                            <i className="bi bi-pencil me-2"></i> Edit Details
                        </Button>
                    </div>

                    {/* Countdown Timer */}
                    <div className="d-flex gap-4 mt-4">
                        <div className="text-center">
                            <h2 className="fw-bold display-5 mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>{timeLeft.days || 0}</h2>
                            <small className="text-uppercase tracking-wider opacity-75">Days</small>
                        </div>
                        <div className="text-center">
                            <h2 className="fw-bold display-5 mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>{timeLeft.hours || 0}</h2>
                            <small className="text-uppercase tracking-wider opacity-75">Hours</small>
                        </div>
                        <div className="text-center">
                            <h2 className="fw-bold display-5 mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>{timeLeft.minutes || 0}</h2>
                            <small className="text-uppercase tracking-wider opacity-75">Minutes</small>
                        </div>
                    </div>
                </Container>
            </div>

            <Container style={{ marginTop: '-80px' }}>
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="mb-4 shadow-sm">
                        {message.text}
                    </Alert>
                )}

                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    {/* Navigation Pills */}
                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '50px', padding: '10px', background: 'white' }}>
                        <Nav variant="pills" className="justify-content-center gap-2">
                            <Nav.Item>
                                <Nav.Link eventKey="details" className="rounded-pill px-4 py-2 fw-bold">
                                    <i className="bi bi-grid me-2"></i> Overview
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="guests" className="rounded-pill px-4 py-2 fw-bold">
                                    <i className="bi bi-people me-2"></i> Guests
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="budget" className="rounded-pill px-4 py-2 fw-bold">
                                    <i className="bi bi-wallet2 me-2"></i> Budget
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="vendors" className="rounded-pill px-4 py-2 fw-bold">
                                    <i className="bi bi-shop me-2"></i> Vendors
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card>

                    <Tab.Content>
                        {/* Overview Tab */}
                        <Tab.Pane eventKey="details">
                            <Row className="g-4">
                                <Col md={4}>
                                    <Card style={glassCardStyle} className="h-100 border-0">
                                        <Card.Body className="text-center p-5">
                                            <div className="mb-3 text-primary display-4"><i className="bi bi-people"></i></div>
                                            <h3 className="fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>{guests.length}</h3>
                                            <p className="text-muted">Total Guests</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card style={glassCardStyle} className="h-100 border-0">
                                        <Card.Body className="text-center p-5">
                                            <div className="mb-3 text-success display-4"><i className="bi bi-check-circle"></i></div>
                                            <h3 className="fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>{guests.filter(g => g.status === 'Accepted').length}</h3>
                                            <p className="text-muted">Confirmed</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card style={glassCardStyle} className="h-100 border-0">
                                        <Card.Body className="text-center p-5">
                                            <div className="mb-3 text-warning display-4"><i className="bi bi-pie-chart"></i></div>
                                            <h3 className="fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>{Math.round((totalSpent / (totalBudget || 1)) * 100)}%</h3>
                                            <p className="text-muted">Budget Used</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab.Pane>

                        {/* Guests Tab */}
                        <Tab.Pane eventKey="guests">
                            <Row>
                                <Col md={8}>
                                    <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                                        <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                            <h4 className="fw-bold mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>Guest List</h4>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="rounded-pill"
                                                onClick={() => setShowGuestModal(true)}
                                                disabled={isEventPassed}
                                            >
                                                <i className="bi bi-plus-lg me-1"></i> Add Guest
                                            </Button>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            <ListGroup variant="flush">
                                                {guests.length === 0 ? (
                                                    <div className="text-center py-5 text-muted">No guests yet.</div>
                                                ) : (
                                                    guests.map((guest, index) => (
                                                        <ListGroup.Item key={index} className="px-4 py-3 border-light d-flex justify-content-between align-items-center">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                                    <span className="fw-bold text-muted">{guest.name.charAt(0)}</span>
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-0 fw-bold">{guest.name}</h6>
                                                                    <small className="text-muted">{guest.email}</small>
                                                                    {/* Extended Details */}
                                                                    {(guest.dietaryRestrictions || guest.plusOne) && (
                                                                        <div className="mt-1 small">
                                                                            {guest.dietaryRestrictions && (
                                                                                <span className="me-3 text-warning">
                                                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                                                    {guest.dietaryRestrictions}
                                                                                </span>
                                                                            )}
                                                                            {guest.plusOne && (
                                                                                <span className="text-info">
                                                                                    <i className="bi bi-person-plus-fill me-1"></i>
                                                                                    +1: {guest.plusOneName}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {guest.message && (
                                                                        <div className="mt-1 text-muted small fst-italic">
                                                                            <i className="bi bi-chat-quote-fill me-1"></i> "{guest.message}"
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-3">
                                                                {guest.status === 'Accepted' && <Badge bg="success" className="rounded-pill px-3">Going</Badge>}
                                                                {guest.status === 'Declined' && <Badge bg="danger" className="rounded-pill px-3">Declined</Badge>}
                                                                {guest.status === 'Pending' && <Badge bg="warning" text="dark" className="rounded-pill px-3">Pending</Badge>}

                                                                {(guest.status === 'Pending' || guest.status === 'Declined') && (
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        className="rounded-circle"
                                                                        onClick={() => handleResendInvitation(guest._id)}
                                                                        title="Resend"
                                                                        disabled={isEventPassed}
                                                                    >
                                                                        <i className="bi bi-send"></i>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))
                                                )}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border-0 shadow-sm bg-dark text-white h-100" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #2c3e50, #4ca1af)' }}>
                                        <Card.Body className="p-4 d-flex flex-column justify-content-center text-center">
                                            <div className="mb-4 display-1"><i className="bi bi-envelope-paper-heart"></i></div>
                                            <h3 className="fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Send Invitations</h3>
                                            <p className="opacity-75 mb-4">Design beautiful invitations and send them to your guest list instantly.</p>
                                            <Button
                                                variant="light"
                                                size="lg"
                                                className="rounded-pill fw-bold text-primary w-100"
                                                onClick={() => setShowInvitationModal(true)}
                                                disabled={isEventPassed}
                                            >
                                                Open Designer
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab.Pane>

                        {/* Budget Tab */}
                        <Tab.Pane eventKey="budget">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3>Budget Management</h3>
                                <Button variant="success" onClick={() => setShowBudgetModal(true)}>
                                    <i className="bi bi-plus-circle me-2"></i> Add Expense
                                </Button>
                            </div>

                            <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '20px' }}>
                                <Card.Body className="p-4">
                                    <Row className="align-items-center">
                                        <Col md={4}>
                                            <div className="p-3 bg-light rounded-3 text-center">
                                                <small className="text-uppercase text-muted fw-bold">Total Budget</small>
                                                <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                                                    <Form.Control
                                                        type="number"
                                                        value={totalBudget}
                                                        onChange={(e) => setTotalBudget(e.target.value)}
                                                        className="border-0 bg-transparent text-center fw-bold fs-4 p-0 shadow-none"
                                                        style={{ maxWidth: '120px' }}
                                                    />
                                                    <Button variant="outline-dark" size="sm" className="rounded-circle" onClick={handleUpdateBudget}><i className="bi bi-check-lg"></i></Button>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={4} className="text-center">
                                            <div className="position-relative d-inline-block">
                                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '10px solid #f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: `10px solid ${remainingBudget < 0 ? '#dc3545' : '#198754'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span className="fw-bold fs-5">{Math.round((totalSpent / (totalBudget || 1)) * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={4} className="text-center">
                                            <h5 className="text-muted mb-1">Remaining</h5>
                                            <h2 className={`fw-bold ${remainingBudget < 0 ? 'text-danger' : 'text-success'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                                                ₹{remainingBudget.toFixed(2)}
                                            </h2>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <h5 className="fw-bold mb-3">Expenses</h5>
                            <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                                <ListGroup variant="flush">
                                    {budget?.expenses?.length > 0 ? (
                                        budget.expenses.map((expense, index) => (
                                            <ListGroup.Item key={index} className="px-4 py-3 d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                        <i className="bi bi-receipt text-muted"></i>
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-0 fw-bold">{expense.title}</h6>
                                                        <small className="text-muted">{expense.category}</small>
                                                    </div>
                                                </div>
                                                <span className="fw-bold">₹{expense.amount.toFixed(2)}</span>
                                            </ListGroup.Item>
                                        ))
                                    ) : (
                                        <div className="text-center py-5 text-muted">No expenses recorded yet.</div>
                                    )}
                                </ListGroup>
                            </Card>
                        </Tab.Pane>

                        {/* Vendors Tab */}
                        <Tab.Pane eventKey="vendors">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3>Vendor Management</h3>
                                <Button variant="primary" onClick={() => setShowVendorModal(true)}>
                                    <i className="bi bi-person-plus me-2"></i> Assign Vendor
                                </Button>
                            </div>

                            <Row className="g-4">
                                {vendors.length === 0 ? (
                                    <Col>
                                        <Alert variant="info" className="border-0 shadow-sm rounded-3">No vendors assigned yet. Click "Assign Vendor" to start.</Alert>
                                    </Col>
                                ) : (
                                    vendors.map((assignment) => (
                                        <Col md={6} lg={4} key={assignment._id}>
                                            <Card className="h-100 border-0 shadow-sm transform-hover" style={{ borderRadius: '20px' }}>
                                                <Card.Body className="p-4">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                                                <span className="fw-bold fs-5 text-primary">{assignment.vendor?.user?.name?.charAt(0) || 'V'}</span>
                                                            </div>
                                                            <div>
                                                                <h5 className="fw-bold mb-0">{assignment.vendor?.user?.name || 'Unknown Vendor'}</h5>
                                                                <small className="text-muted">{assignment.serviceType}</small>
                                                            </div>
                                                        </div>
                                                        <Badge bg={
                                                            assignment.status === 'Paid' ? 'success' :
                                                                assignment.status === 'Completed' ? 'info' :
                                                                    assignment.status === 'In Progress' ? 'primary' : 'warning'
                                                        } className="rounded-pill px-3">
                                                            {assignment.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center">
                                                        <span className="text-muted small text-uppercase fw-bold">Agreed Amount</span>
                                                        <span className="fw-bold fs-5">₹{assignment.amount.toFixed(2)}</span>
                                                    </div>

                                                    {assignment.status === 'Completed' && (
                                                        <Button variant="success" className="w-100 rounded-pill fw-bold shadow-sm" onClick={() => handleProcessPayment(assignment._id)}>
                                                            <i className="bi bi-credit-card me-2"></i> Pay Now
                                                        </Button>
                                                    )}
                                                    {assignment.status === 'Paid' && (
                                                        <div className="text-center text-success fw-bold">
                                                            <i className="bi bi-check-circle-fill me-2"></i> Payment Complete
                                                        </div>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                )}
                            </Row>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Container>

            {/* Modals placed outside the main layout structure for cleanliness */}

            {/* Edit Event Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Event</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Event Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editEventData.name}
                                onChange={(e) => setEditEventData({ ...editEventData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editEventData.date}
                                        onChange={(e) => setEditEventData({ ...editEventData, date: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        value={editEventData.time}
                                        onChange={(e) => setEditEventData({ ...editEventData, time: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                value={editEventData.location}
                                onChange={(e) => setEditEventData({ ...editEventData, location: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Google Map Link</Form.Label>
                            <Form.Control
                                type="text"
                                value={editEventData.mapLink}
                                onChange={(e) => setEditEventData({ ...editEventData, mapLink: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select
                                value={editEventData.type}
                                onChange={(e) => setEditEventData({ ...editEventData, type: e.target.value })}
                            >
                                <option value="Wedding">Wedding</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Corporate">Corporate</option>
                                <option value="Social">Social</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editEventData.description}
                                onChange={(e) => setEditEventData({ ...editEventData, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpdateEvent}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Guest Modal */}
            <Modal show={showGuestModal} onHide={() => setShowGuestModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Invite Guest</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tab.Container activeKey={invitationType} onSelect={(k) => setInvitationType(k)}>
                        <Nav variant="pills" className="mb-3 justify-content-center">
                            <Nav.Item>
                                <Nav.Link eventKey="Email">External (Email)</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="InApp">EventEmpire User</Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey="Email">
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={newGuest.name}
                                            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                                            placeholder="Guest Name"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={newGuest.email}
                                            onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                                            placeholder="guest@example.com"
                                        />
                                    </Form.Group>
                                </Form>
                            </Tab.Pane>
                            <Tab.Pane eventKey="InApp">
                                <Form.Group className="mb-3">
                                    <Form.Label>Search EventEmpire Users</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <Button
                                                variant="link"
                                                className="position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none"
                                                onClick={() => setSearchQuery('')}
                                                style={{ zIndex: 10 }}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Selected Users Chips/Cards */}
                                    {selectedUsers.length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mt-3 mb-3">
                                            {selectedUsers.map(u => (
                                                <div key={u._id} className="d-flex align-items-center bg-white border rounded-pill ps-2 pe-3 py-1 shadow-sm">
                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="me-2 small fw-bold">{u.name}</span>
                                                    <i
                                                        className="bi bi-x-circle-fill text-danger cursor-pointer"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => setSelectedUsers(selectedUsers.filter(user => user._id !== u._id))}
                                                    ></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <ListGroup className="mt-2 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {searchResults.map(user => {
                                                const isSelected = selectedUsers.some(u => u._id === user._id);
                                                return (
                                                    <ListGroup.Item
                                                        key={user._id}
                                                        action
                                                        onClick={() => {
                                                            if (!isSelected) {
                                                                setSelectedUsers([...selectedUsers, user]);
                                                                setSearchQuery('');
                                                                setSearchResults([]);
                                                            }
                                                        }}
                                                        className={`d-flex align-items-center justify-content-between ${isSelected ? 'bg-light opacity-50' : ''}`}
                                                        disabled={isSelected}
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px' }}>
                                                                <i className="bi bi-person-fill"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold small">{user.name}</div>
                                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</small>
                                                            </div>
                                                        </div>
                                                        {isSelected ? <i className="bi bi-check-circle-fill text-success"></i> : <i className="bi bi-plus-circle text-primary"></i>}
                                                    </ListGroup.Item>
                                                );
                                            })}
                                        </ListGroup>
                                    )}
                                </Form.Group>
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGuestModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAddGuest} disabled={invitationType === 'InApp' && selectedUsers.length === 0}>
                        Send Invitations ({invitationType === 'InApp' ? selectedUsers.length : 1})
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Invitation Designer Modal */}
            <InvitationDesigner
                show={showInvitationModal}
                onHide={() => setShowInvitationModal(false)}
                event={event}
                onSave={handleSaveInvitation}
            />

            {/* Add Expense Modal */}
            <Modal show={showBudgetModal} onHide={() => setShowBudgetModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Expense</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddExpense}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={newExpense.title}
                                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Venue">Venue</option>
                                <option value="Catering">Catering</option>
                                <option value="Decoration">Decoration</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowBudgetModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                Add Expense
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Assign Vendor Modal */}
            <Modal show={showVendorModal} onHide={() => setShowVendorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Vendor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!selectedVendor ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Search Vendor</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by business name or service..."
                                    value={vendorSearchQuery}
                                    onChange={(e) => setVendorSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <Form.Text className="text-muted">
                                    Try searching for "Catering", "Photography", or a specific name.
                                </Form.Text>
                            </Form.Group>
                            {vendorSearchResults.length > 0 ? (
                                <ListGroup className="shadow-sm">
                                    {vendorSearchResults.map(vendor => (
                                        <ListGroup.Item
                                            key={vendor._id}
                                            action
                                            onClick={() => {
                                                setSelectedVendor(vendor);
                                                setNewAssignment({ ...newAssignment, vendorId: vendor._id, serviceType: vendor.serviceType });
                                            }}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <div className="fw-bold">{vendor.businessName || vendor.user?.name || 'Unnamed Vendor'}</div>
                                                <div className="text-muted small">
                                                    <i className="bi bi-briefcase me-1"></i>{vendor.serviceType}
                                                    <span className="mx-2">|</span>
                                                    <i className="bi bi-geo-alt me-1"></i>{vendor.location}
                                                </div>
                                            </div>
                                            <Button variant="outline-primary" size="sm">Select</Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                vendorSearchQuery.length > 2 && <p className="text-muted text-center mt-3">No vendors found matching "{vendorSearchQuery}".</p>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded border">
                                <div>
                                    <h5 className="mb-1">{selectedVendor.businessName || selectedVendor.user?.name}</h5>
                                    <Badge bg="info">{selectedVendor.serviceType}</Badge>
                                    <div className="text-muted small mt-1">{selectedVendor.location}</div>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => setSelectedVendor(null)}>
                                    Change Vendor
                                </Button>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label>Agreed Amount (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={newAssignment.amount}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, amount: e.target.value })}
                                    placeholder="Enter agreed amount"
                                    min="0"
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowVendorModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAssignVendor} disabled={isEventPassed}>
                        {isEditingAssignment ? 'Update Offer' : 'Assign Vendor'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EventPage;
