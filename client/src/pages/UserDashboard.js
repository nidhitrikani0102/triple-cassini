import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import PaginationControl from '../components/PaginationControl';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

// Assets
import eventVideo from '../assets/Event Video2.mp4';
import wedding1 from '../assets/wedding1.jpg';
import wedding3 from '../assets/wedding3.jpg';
import wedding4 from '../assets/wedding4.jpg';
import corporate1 from '../assets/corporate event1.jpg';
import corporate2 from '../assets/corporate event2.jpg';
import corporate3 from '../assets/corporate event3.jpg';
import birthday1 from '../assets/birthday1.jpg';
import birthday2 from '../assets/birthday2.jpg';
import birthday3 from '../assets/birthday3.jpg';
import social1 from '../assets/social1.jpg';
import event1 from '../assets/event1.jpg';
import event2 from '../assets/event2.jpg';
import event3 from '../assets/event3.jpg';
import event4 from '../assets/event4.jpg';
import event5 from '../assets/event5.jpg';
import event6 from '../assets/Event6.jpg';
import event7 from '../assets/event7.jpg';

import event9 from '../assets/event9.jpg';
import event10 from '../assets/event10.jpg';

const UserDashboard = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [paginatedEvents, setPaginatedEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [open, setOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: '', date: '', time: '', location: '', mapLink: '', type: '', description: '', organizerName: ''
    });
    const [message, setMessage] = useState(null);
    const [vendorCount, setVendorCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 9;

    // Payment & Assignment State
    const [assignments, setAssignments] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Strict Image Mapping
    const weddingImages = [wedding1, wedding3, wedding4];
    const corporateImages = [corporate1, corporate2, corporate3];
    const birthdayImages = [birthday1, birthday2, birthday3];
    const socialImages = [social1]; // Can add more if available

    // Generic "Inspiration" Images
    const inspirationImages = [event1, event2, event3, event4, event5, event6, event7, event9, event10];

    const getRandomImage = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const getEventImage = (event) => {
        switch (event.type) {
            case 'Wedding': return getRandomImage(weddingImages);
            case 'Birthday': return getRandomImage(birthdayImages);
            case 'Corporate': return getRandomImage(corporateImages);
            case 'Social': return getRandomImage(socialImages);
            default: return getRandomImage(inspirationImages);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/events?limit=all`, config);
            setEvents(res.data.events);
        } catch (err) {
            console.error('Error fetching events:', err);
            setMessage({ type: 'danger', text: 'Failed to fetch events.' });
        }
    };

    const fetchVendorCount = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/stats/public');
            setVendorCount(res.data.vendors);
        } catch (err) {
            console.error('Error fetching vendor count:', err);
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments/user/my-assignments', config);
            setAssignments(res.data);
        } catch (err) {
            console.error('Error fetching assignments:', err);
        }
    };

    useEffect(() => {
        if (!token) { navigate('/login'); return; }
        fetchEvents();
        fetchVendorCount();
        fetchAssignments();
        if (user) setNewEvent(prev => ({ ...prev, organizerName: user.name }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token, navigate]);

    useEffect(() => {
        const result = events.filter(event => {
            const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || event.type === filterType;
            return matchesSearch && matchesType;
        });
        setFilteredEvents(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1);
    }, [searchTerm, filterType, events]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedEvents(filteredEvents.slice(startIndex, endIndex));
    }, [filteredEvents, currentPage]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/events', newEvent, config);
            // Reset filters and fetch fresh data to ensure the new event is visible and sorted correctly
            setFilterType('All');
            setSearchTerm('');
            fetchEvents();
            setOpen(false);
            setNewEvent({ name: '', date: '', time: '', location: '', mapLink: '', type: '', description: '', organizerName: user.name });
            setMessage({ type: 'success', text: 'Event created successfully!' });
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to create event.' });
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${eventId}`, config);
                setEvents(events.filter(event => event._id !== eventId));
                setMessage({ type: 'success', text: 'Event deleted successfully' });
            } catch (err) {
                setMessage({ type: 'danger', text: 'Failed to delete event' });
            }
        }
    };

    const handlePaymentSuccess = () => {
        fetchAssignments();
        setShowPaymentModal(false);
        setMessage({ type: 'success', text: 'Payment processed successfully!' });
    };

    const upcomingCount = events.filter(e => new Date(e.date) >= new Date()).length;

    // Styles
    const heroStyle = {
        position: 'relative',
        height: '75vh',
        width: '100%',
        overflow: 'hidden',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        marginBottom: '0'
    };

    const videoStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.4)', // Clean overlay for high-quality video
        zIndex: 1
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        padding: '20px'
    };

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
        height: '100%',
        transition: 'transform 0.3s ease'
    };

    const scrollContainerStyle = {
        display: 'flex',
        overflowX: 'auto',
        gap: '20px',
        padding: '20px 0',
        scrollbarWidth: 'none', // Hide scrollbar Firefox
        msOverflowStyle: 'none'  // Hide scrollbar IE/Edge
    };

    return (
        <div style={{ background: 'linear-gradient(to bottom, #fdfbf7, #f4f4f4)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: '1' }}>
                {message && (
                    <Container className="pt-3">
                        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>{message.text}</Alert>
                    </Container>
                )}

                {/* Full Width Hero Section */}
                <div style={heroStyle}>
                    <video autoPlay loop muted style={videoStyle}>
                        <source src={eventVideo} type="video/mp4" />
                    </video>
                    <div style={overlayStyle}></div>
                    <div style={contentStyle} className="fade-in-up">
                        <h1 className="display-2 fw-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                            Welcome back, {user?.name}
                        </h1>
                        <p className="fs-4 mb-5 opacity-90 fw-light">
                            Curating your perfect moments, one detail at a time.
                        </p>
                        <Button variant="light" size="lg" className="px-5 py-3 rounded-pill fw-bold shadow-lg transform-hover" onClick={() => setOpen(true)}>
                            <i className="bi bi-magic me-2"></i> Start Planning
                        </Button>
                    </div>
                </div>

                <Container className="mb-5 position-relative" style={{ marginTop: '-100px', zIndex: 10 }}>
                    {/* Glass Stats - Overlapping */}
                    <Row className="g-4 mb-5">
                        <Col md={4}>
                            <Card style={glassCardStyle} className="text-center p-4 border-0 transform-hover">
                                <Card.Body>
                                    <div className="mb-3 text-gold">
                                        <i className="bi bi-calendar-check fs-1"></i>
                                    </div>
                                    <h2 className="fw-bold display-6 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{upcomingCount}</h2>
                                    <p className="text-muted small text-uppercase tracking-wider">Upcoming Events</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card style={glassCardStyle} className="text-center p-4 border-0 transform-hover">
                                <Card.Body>
                                    <div className="mb-3 text-rose">
                                        <i className="bi bi-shop fs-1"></i>
                                    </div>
                                    <h2 className="fw-bold display-6 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{vendorCount}</h2>
                                    <p className="text-muted small text-uppercase tracking-wider">Curated Vendors</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card style={glassCardStyle} className="text-center p-4 border-0 transform-hover">
                                <Card.Body>
                                    <div className="mb-3 text-navy">
                                        <i className="bi bi-wallet2 fs-1"></i>
                                    </div>
                                    <h2 className="fw-bold display-6 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>Track</h2>
                                    <p className="text-muted small text-uppercase tracking-wider">Budget & Expenses</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Pending Payments Section */}
                    {assignments.some(a => a.status === 'Completed') && (
                        <div className="mb-5">
                            <h3 className="fw-bold display-6 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Pending Payments</h3>
                            <Row className="g-4">
                                {assignments.filter(a => a.status === 'Completed').map(assignment => (
                                    <Col key={assignment._id} md={6} lg={4}>
                                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '20px' }}>
                                            <Card.Body className="p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="fw-bold mb-1">{assignment.vendor?.user?.name || 'Vendor'}</h5>
                                                        <small className="text-muted">{assignment.event?.name}</small>
                                                    </div>
                                                    <Badge bg="info" className="rounded-pill">Completed</Badge>
                                                </div>
                                                <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center">
                                                    <span className="text-muted small text-uppercase fw-bold">Amount Due</span>
                                                    <span className="fw-bold fs-5">₹{assignment.amount.toFixed(2)}</span>
                                                </div>
                                                <Button
                                                    variant="success"
                                                    className="w-100 rounded-pill fw-bold shadow-sm"
                                                    onClick={() => {
                                                        setSelectedBooking(assignment);
                                                        setShowPaymentModal(true);
                                                    }}
                                                >
                                                    <i className="bi bi-credit-card me-2"></i> Pay Now
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}

                    {/* Plan Your Event Carousel */}
                    <div className="mb-5">
                        <h3 className="mb-4 fw-bold display-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>What are you celebrating?</h3>
                        <p className="text-center text-muted mb-5" style={{ maxWidth: '600px', margin: '0 auto' }}>Select a category to begin crafting your next unforgettable experience.</p>

                        <Row className="g-4">
                            <Col md={3}>
                                <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => { setNewEvent({ ...newEvent, type: 'Wedding' }); setOpen(true); }}>
                                    <div style={{ height: '300px', overflow: 'hidden' }}>
                                        <Card.Img src={getRandomImage(weddingImages)} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                                    </div>
                                    <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                        <h4 className="text-white mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>Wedding</h4>
                                    </div>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => { setNewEvent({ ...newEvent, type: 'Corporate' }); setOpen(true); }}>
                                    <div style={{ height: '300px', overflow: 'hidden' }}>
                                        <Card.Img src={getRandomImage(corporateImages)} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                                    </div>
                                    <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                        <h4 className="text-white mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>Corporate</h4>
                                    </div>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => { setNewEvent({ ...newEvent, type: 'Birthday' }); setOpen(true); }}>
                                    <div style={{ height: '300px', overflow: 'hidden' }}>
                                        <Card.Img src={getRandomImage(birthdayImages)} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                                    </div>
                                    <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                        <h4 className="text-white mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>Birthday</h4>
                                    </div>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px', cursor: 'pointer' }} onClick={() => { setNewEvent({ ...newEvent, type: 'Social' }); setOpen(true); }}>
                                    <div style={{ height: '300px', overflow: 'hidden' }}>
                                        <Card.Img src={getRandomImage(socialImages)} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                                    </div>
                                    <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                        <h4 className="text-white mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>Social</h4>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* NEW: Curated Inspirations Gallery (Using event1-10) */}
                    <div className="mb-5">
                        <div className="d-flex justify-content-between align-items-end mb-4">
                            <div>
                                <h3 className="fw-bold display-6 mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>Curated Inspirations</h3>
                                <p className="text-muted mb-0 small">Trending styles and real events to spark your imagination.</p>
                            </div>
                            <Button variant="link" className="text-dark text-decoration-none fw-bold">View Gallery <i className="bi bi-arrow-right"></i></Button>
                        </div>

                        <div style={scrollContainerStyle} className="hide-scrollbar">
                            {inspirationImages.map((img, index) => (
                                <div key={index} style={{ minWidth: '280px', height: '350px', position: 'relative', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer' }} className="shadow-sm transform-hover">
                                    <img src={img} alt={`Inspiration ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="hover-zoom" />
                                    <div className="position-absolute top-0 end-0 p-3">
                                        <Badge bg="light" text="dark" className="rounded-circle p-2 shadow-sm"><i className="bi bi-heart-fill text-danger"></i></Badge>
                                    </div>
                                    <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                                        <p className="text-white mb-0 fw-bold small">Style #{100 + index}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Your Events Grid with Filters */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-end mb-4 border-bottom pb-3 gap-3">
                        <div>
                            <h3 className="fw-bold display-6 mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>Your Memories</h3>
                            <p className="text-muted mb-0 small">Manage your upcoming and past events</p>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            <div className="d-flex gap-2">
                                {['All', 'Wedding', 'Birthday', 'Corporate', 'Social'].map(type => (
                                    <Button
                                        key={type}
                                        variant={filterType === type ? 'dark' : 'light'}
                                        size="sm"
                                        className="rounded-pill px-3 fw-bold shadow-sm"
                                        onClick={() => setFilterType(type)}
                                        style={filterType === type ? { background: 'var(--navy-deep)', border: 'none' } : {}}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>
                            <InputGroup style={{ maxWidth: '250px' }} className="shadow-sm rounded-pill overflow-hidden">
                                <InputGroup.Text className="bg-white border-0 ps-3"><i className="bi bi-search text-muted"></i></InputGroup.Text>
                                <Form.Control placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border-0 shadow-none" />
                            </InputGroup>
                        </div>
                    </div>

                    <Row className="g-4">
                        {paginatedEvents.length > 0 ? (
                            paginatedEvents.map(event => (
                                <Col key={event._id} md={4}>
                                    <Card className="h-100 border-0 shadow-sm transform-hover" style={{ borderRadius: '20px', overflow: 'hidden', background: 'white' }}>
                                        <div className="position-relative">
                                            <Card.Img variant="top" src={getEventImage(event)} style={{ height: '220px', objectFit: 'cover' }} />
                                            <Badge bg="white" text="dark" className="position-absolute top-0 end-0 m-3 shadow-sm px-3 py-2 rounded-pill fw-normal">{event.type}</Badge>
                                        </div>
                                        <Card.Body className="p-4">
                                            <Card.Title className="fw-bold fs-4 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{event.name}</Card.Title>
                                            <div className="d-flex align-items-center text-muted mb-2">
                                                <i className="bi bi-calendar-event me-2 text-gold"></i>
                                                <span className="small">{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="d-flex align-items-center text-muted">
                                                <i className="bi bi-geo-alt me-2 text-rose"></i>
                                                <span className="small">{event.location}</span>
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className="bg-white border-top-0 p-4 pt-0">
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-dark" className="flex-grow-1 rounded-pill py-2" onClick={() => navigate(`/events/${event._id}`)}>Manage Details</Button>
                                                <Button variant="light" className="rounded-circle" style={{ width: '42px', height: '42px' }} onClick={() => handleDeleteEvent(event._id)}><i className="bi bi-trash text-danger"></i></Button>
                                            </div>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col><Alert variant="light" className="text-center py-5 border-0 shadow-sm" style={{ borderRadius: '20px' }}>No events found matching your criteria.</Alert></Col>
                        )}
                    </Row>

                    {/* Pagination Controls */}
                    <PaginationControl
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />

                    {/* Create Modal */}
                    <Modal show={open} onHide={() => setOpen(false)} centered size="lg" backdrop="static">
                        <Modal.Header closeButton className="border-0 pb-0 ps-4 pe-4 pt-4">
                            <Modal.Title className="fw-bold display-6" style={{ fontFamily: 'Playfair Display, serif' }}>Create New Event</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            <Form>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Group className="p-3 bg-light rounded-3">
                                            <Form.Label className="text-muted small text-uppercase fw-bold mb-2">Event Name</Form.Label>
                                            <Form.Control size="lg" type="text" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="e.g., Sarah's Dream Wedding" className="border-0 bg-transparent shadow-none fw-bold p-0" style={{ fontFamily: 'Playfair Display, serif' }} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="text-muted small text-uppercase fw-bold">Date</Form.Label>
                                            <Form.Control type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="border-light bg-light rounded-3 p-3" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="text-muted small text-uppercase fw-bold">Time</Form.Label>
                                            <Form.Control type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="border-light bg-light rounded-3 p-3" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="text-muted small text-uppercase fw-bold">Location</Form.Label>
                                            <Form.Control type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Venue Address" className="border-light bg-light rounded-3 p-3" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="text-muted small text-uppercase fw-bold">Google Map Link</Form.Label>
                                            <Form.Control type="text" value={newEvent.mapLink} onChange={(e) => setNewEvent({ ...newEvent, mapLink: e.target.value })} placeholder="Paste Google Maps URL" className="border-light bg-light rounded-3 p-3" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="text-muted small text-uppercase fw-bold">Type</Form.Label>
                                            <Form.Select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })} className="border-light bg-light rounded-3 p-3">
                                                <option value="">Select Type</option>
                                                <option value="Wedding">Wedding</option>
                                                <option value="Birthday">Birthday</option>
                                                <option value="Corporate">Corporate</option>
                                                <option value="Social">Social</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="text-muted small text-uppercase fw-bold">Description</Form.Label>
                                            <Form.Control as="textarea" rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="border-light bg-light rounded-3 p-3" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer className="border-0 pt-0 pb-4 pe-4">
                            <Button variant="light" onClick={() => setOpen(false)} className="rounded-pill px-4 py-2">Cancel</Button>
                            <Button variant="dark" onClick={handleCreateEvent} className="rounded-pill px-5 py-2 fw-bold" style={{ background: 'var(--navy-deep)', border: 'none' }}>Create Event</Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </div>

            {/* Footer Section */}
            <footer className="bg-dark text-white py-5 mt-auto">
                <Container>
                    <Row className="g-4">
                        <Col md={4}>
                            <h4 className="fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>EventEmpire</h4>
                            <p className="text-white-50 small">
                                Crafting unforgettable moments with precision and passion. Your dream event, perfectly planned.
                            </p>
                            <div className="d-flex gap-3 mt-3">
                                <a href="#" className="text-white-50 hover-white"><i className="bi bi-facebook fs-5"></i></a>
                                <a href="#" className="text-white-50 hover-white"><i className="bi bi-instagram fs-5"></i></a>
                                <a href="#" className="text-white-50 hover-white"><i className="bi bi-twitter fs-5"></i></a>
                                <a href="#" className="text-white-50 hover-white"><i className="bi bi-linkedin fs-5"></i></a>
                            </div>
                        </Col>
                        <Col md={4}>
                            <h5 className="fw-bold mb-3 text-gold">Contact Us</h5>
                            <ul className="list-unstyled text-white-50 small">
                                <li className="mb-2"><i className="bi bi-geo-alt me-2"></i> 123 Event Horizon Blvd, Creative City</li>
                                <li className="mb-2"><i className="bi bi-envelope me-2"></i> hello@eventempire.com</li>
                                <li className="mb-2"><i className="bi bi-telephone me-2"></i> +1 (555) 123-4567</li>
                            </ul>
                        </Col>
                        <Col md={4}>
                            <h5 className="fw-bold mb-3 text-rose">Quick Links</h5>
                            <ul className="list-unstyled text-white-50 small">
                                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">About Us</a></li>
                                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Find Vendors</a></li>
                                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Privacy Policy</a></li>
                                <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none">Terms of Service</a></li>
                            </ul>
                        </Col>
                    </Row>
                    <div className="border-top border-secondary mt-4 pt-4 text-center text-white-50 small">
                        &copy; {new Date().getFullYear()} EventEmpire. All rights reserved.
                    </div>
                </Container>
            </footer>
            <PaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                booking={selectedBooking}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default UserDashboard;
