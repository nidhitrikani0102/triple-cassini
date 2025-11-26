import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Tab, Nav, Card, Button, Form, Modal, ListGroup, Alert, ProgressBar, Table, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
                    setVendorSearchResults(res.data);
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
            setGuests(res.data);
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
            setVendors(res.data);
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
    const progressVariant = remainingBudget < 0 ? 'danger' : remainingBudget < (budget?.totalBudget * 0.2) ? 'warning' : 'success';
    const progressPercentage = budget?.totalBudget ? Math.min((totalSpent / budget.totalBudget) * 100, 100) : 0;

    return (
        <Container className="mt-4">
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                    {message.text}
                </Alert>
            )}
            {/* Show persistent warning if budget is exceeded */}
            {remainingBudget < 0 && (
                <Alert variant="danger" className="mb-4">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Budget Exceeded!</strong> You have spent ₹{Math.abs(remainingBudget).toFixed(2)} over your budget.
                </Alert>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{event.name}</h1>
                <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="details">Details</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="guests">Guests & Invitations</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="budget">Budget</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="vendors">Vendors</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="details">
                        <Card className="shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <Card.Title className="fs-4">Event Details</Card.Title>
                                    <Button variant="primary" onClick={() => setShowEditModal(true)}>
                                        <i className="bi bi-pencil me-2"></i> Edit Event
                                    </Button>
                                </div>
                                <div className="mb-3">
                                    <Button variant="outline-primary" className="me-2" onClick={() => setActiveTab('vendors')}>
                                        <i className="bi bi-people me-2"></i> Manage Vendors
                                    </Button>
                                    <Button variant="outline-success" onClick={() => setActiveTab('budget')}>
                                        <i className="bi bi-cash-coin me-2"></i> View Budget
                                    </Button>
                                </div>
                                <Row>
                                    <Col md={6}>
                                        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                                        <p><strong>Time:</strong> {event.time}</p>
                                        <p><strong>Location:</strong> {event.location}</p>
                                        {event.mapLink && (
                                            <p><strong>Map:</strong> <a href={event.mapLink} target="_blank" rel="noopener noreferrer">View on Google Maps</a></p>
                                        )}
                                        <p><strong>Type:</strong> {event.type}</p>
                                        <p><strong>Organizer:</strong> {event.organizerName}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p><strong>Description:</strong></p>
                                        <p>{event.description}</p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>

                    <Tab.Pane eventKey="guests">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Guest List & Invitations</h3>
                            <div>
                                <Button variant="outline-primary" className="me-2" onClick={() => setShowInvitationModal(true)}>
                                    <i className="bi bi-palette me-2"></i> Design Invitation
                                </Button>
                                <Button variant="primary" onClick={() => setShowGuestModal(true)}>
                                    <i className="bi bi-envelope me-2"></i> Send Invitation
                                </Button>
                            </div>
                        </div>
                        <ListGroup>
                            {guests.length === 0 ? (
                                <ListGroup.Item>No guests invited yet. Click "Send Invitation" to start!</ListGroup.Item>
                            ) : (
                                guests.map((guest, index) => (
                                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{guest.name}</strong> ({guest.email})
                                            <div className="mt-1">
                                                {guest.status === 'Accepted' && <span className="badge bg-success me-2">Accepted</span>}
                                                {guest.status === 'Declined' && <span className="badge bg-danger me-2">Declined</span>}
                                                {guest.status === 'Pending' && <span className="badge bg-warning text-dark me-2">Pending</span>}
                                                {!guest.isInvited && <span className="badge bg-secondary">Not Invited</span>}
                                            </div>
                                        </div>
                                        <div>
                                            {/* Show Resend button only if status is Pending or Declined */}
                                            {(guest.status === 'Pending' || guest.status === 'Declined') && (
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleResendInvitation(guest._id)}
                                                    title="Resend Invitation"
                                                >
                                                    <i className="bi bi-arrow-repeat"></i> Resend Invitation
                                                </Button>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    </Tab.Pane>


                    <Tab.Pane eventKey="budget">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Budget Management</h3>
                            <Button variant="success" onClick={() => setShowBudgetModal(true)}>
                                <i className="bi bi-plus-circle me-2"></i> Add Expense
                            </Button>
                        </div>

                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <Row className="align-items-end">
                                    <Col md={4}>
                                        <Form.Group>
                                            <Form.Label><strong>Total Budget</strong></Form.Label>
                                            <div className="d-flex gap-2">
                                                <Form.Control
                                                    type="number"
                                                    value={totalBudget}
                                                    onChange={(e) => setTotalBudget(e.target.value)}
                                                />
                                                <Button onClick={handleUpdateBudget}>Set</Button>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="text-center">
                                        <h5>Total Spent</h5>
                                        <h3 className="text-danger">₹{totalSpent.toFixed(2)}</h3>
                                    </Col>
                                    <Col md={4} className="text-center">
                                        <h5>Remaining</h5>
                                        <h3 className={`text-${remainingBudget < 0 ? 'danger' : 'success'}`}>
                                            ₹{remainingBudget.toFixed(2)}
                                        </h3>
                                    </Col>
                                </Row>
                                <div className="mt-3">
                                    <ProgressBar now={progressPercentage} variant={progressVariant} label={`${progressPercentage.toFixed(0)}%`} />
                                </div>
                            </Card.Body>
                        </Card>

                        <h4>Expenses</h4>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {budget?.expenses?.length > 0 ? (
                                    budget.expenses.map((expense, index) => (
                                        <tr key={index}>
                                            <td>{expense.title}</td>
                                            <td>{expense.category}</td>
                                            <td>₹{expense.amount.toFixed(2)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">No expenses recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Tab.Pane>

                    <Tab.Pane eventKey="vendors">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3>Vendor Management</h3>
                            <Button variant="primary" onClick={() => setShowVendorModal(true)}>
                                <i className="bi bi-person-plus me-2"></i> Assign Vendor
                            </Button>
                        </div>

                        <Row>
                            {vendors.length === 0 ? (
                                <Col>
                                    <Alert variant="info">No vendors assigned yet. Click "Assign Vendor" to start.</Alert>
                                </Col>
                            ) : (
                                vendors.map((assignment) => (
                                    <Col md={6} lg={4} key={assignment._id} className="mb-4">
                                        <Card className="h-100 shadow-sm">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <Card.Title>{assignment.vendor.businessName}</Card.Title>
                                                    <Badge bg={
                                                        assignment.status === 'Paid' ? 'success' :
                                                            assignment.status === 'Completed' ? 'info' :
                                                                assignment.status === 'In Progress' ? 'primary' : 'warning'
                                                    }>
                                                        {assignment.status}
                                                    </Badge>
                                                </div>
                                                <Card.Subtitle className="mb-2 text-muted">{assignment.serviceType}</Card.Subtitle>
                                                <Card.Text>
                                                    <strong>Amount:</strong> ₹{assignment.amount.toFixed(2)}
                                                </Card.Text>

                                                {assignment.status === 'Completed' && (
                                                    <div className="d-grid mt-3">
                                                        <Button variant="success" onClick={() => handleProcessPayment(assignment._id)}>
                                                            <i className="bi bi-credit-card me-2"></i> Pay Now
                                                        </Button>
                                                        <Form.Text className="text-muted text-center mt-1">
                                                            Adds expense to budget automatically
                                                        </Form.Text>
                                                    </div>
                                                )}
                                                {assignment.status === 'Paid' && (
                                                    <div className="text-center mt-3 text-success">
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

            {/* Edit Event Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
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
                    <Button variant="primary" onClick={handleAssignVendor}>
                        Assign Vendor
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container >
    );
};

export default EventPage;
