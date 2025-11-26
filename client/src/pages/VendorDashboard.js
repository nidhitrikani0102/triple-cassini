import React, { useEffect, useState, useContext } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Tab, Nav, Image, Modal, Badge } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';


const VendorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        serviceType: '',
        location: '',
        pricing: '',
        description: '',
    });
    const [message, setMessage] = useState(null);
    const [newImage, setNewImage] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);

    // Job Requests State
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProfile();
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Filter jobs based on search and status
    useEffect(() => {
        let result = jobs;

        if (filterStatus !== 'All') {
            result = result.filter(job => job.status === filterStatus);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(job =>
                job.event.name.toLowerCase().includes(lowerTerm) ||
                job.event.location.toLowerCase().includes(lowerTerm) ||
                job.amount.toString().includes(lowerTerm)
            );
        }

        setFilteredJobs(result);
    }, [jobs, searchTerm, filterStatus]);

    // Function to fetch the vendor's profile from the backend
    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vendors/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            // Pre-fill the form with existing data if available
            if (res.data) {
                setFormData({
                    serviceType: res.data.serviceType || '',
                    location: res.data.location || '',
                    pricing: res.data.pricing || '',
                    description: res.data.description || '',
                });
            }
        } catch (err) {
            console.log('No profile found'); // It's okay if no profile exists yet
        }
    };

    // Fetch vendor jobs
    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments/vendor/my-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        }
    };

    // Handle job status update
    const handleUpdateStatus = async (jobId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/assignments/${jobId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchJobs();
            setMessage({ type: 'success', text: `Job marked as ${status}` });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error updating status' });
        }
    };

    // Function to save or update the profile
    const handleSave = async () => {
        // Client-side validation
        if (!formData.serviceType || !formData.location || !formData.description || !formData.pricing) {
            setMessage({ type: 'danger', text: 'Please fill in all mandatory fields: Service Type, Location, Pricing, and Description.' });
            return;
        }

        try {
            // We send the form data to the backend to create or update the profile
            const res = await axios.post('http://localhost:5000/api/vendors/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setIsEditing(false); // Exit edit mode
            setMessage({ type: 'success', text: 'Profile saved successfully' });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.message || 'Error saving profile';
            setMessage({ type: 'danger', text: errorMsg });
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);

    // Handle file selection from the input
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // Function to handle image upload (Portfolio)
    const handleAddImage = async () => {
        try {
            let imageUrl = newImage; // Start with the URL entered in the text box (if any)

            // If a file was selected, upload it first
            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);

                // Send the file to the upload endpoint
                const uploadRes = await axios.post('http://localhost:5000/api/vendors/upload', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data' // Required for file uploads
                    }
                });
                imageUrl = uploadRes.data.imageUrl; // Get the returned URL of the uploaded image
            }

            if (!imageUrl) {
                setMessage({ type: 'danger', text: 'Please provide an image URL or upload a file' });
                return;
            }

            // Save the image URL to the vendor's portfolio
            const res = await axios.post('http://localhost:5000/api/vendors/portfolio', { imageUrl }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data); // Update local profile state
            setNewImage(''); // Clear input
            setSelectedFile(null); // Clear file selection
            setShowImageModal(false); // Close modal
            setMessage({ type: 'success', text: 'Image added to portfolio' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error adding image' });
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Vendor Dashboard</h2>
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                    {message.text}
                </Alert>
            )}

            <Tab.Container defaultActiveKey="profile">
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="profile">Profile</Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link eventKey="jobs">Job Requests</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="portfolio">Portfolio</Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content>
                    <Tab.Pane eventKey="profile">
                        <Row>
                            <Col md={8}>
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        {!profile && !isEditing && (
                                            <Alert variant="info">You haven't set up your profile yet.</Alert>
                                        )}

                                        {isEditing ? (
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Service Type</Form.Label>
                                                    <Form.Select
                                                        value={formData.serviceType}
                                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                                    >
                                                        <option value="">Select Service Type</option>
                                                        <option value="Catering">Catering</option>
                                                        <option value="Photography">Photography</option>
                                                        <option value="Venue">Venue</option>
                                                        <option value="Decor">Decor</option>
                                                        <option value="Music">Music</option>
                                                        <option value="Other">Other</option>
                                                    </Form.Select>
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Location</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Pricing</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.pricing}
                                                        onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Description</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        placeholder="Describe your services..."
                                                    />
                                                </Form.Group>
                                                <Button variant="success" onClick={handleSave} className="me-2">
                                                    Save Profile
                                                </Button>
                                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                                    Cancel
                                                </Button>
                                            </Form>
                                        ) : (
                                            <div>
                                                <p><strong>Service Type:</strong> {profile?.serviceType || 'N/A'}</p>
                                                <p><strong>Location:</strong> {profile?.location || 'N/A'}</p>
                                                <p><strong>Pricing:</strong> {profile?.pricing || 'N/A'}</p>
                                                <p><strong>Description:</strong> {profile?.description || 'N/A'}</p>
                                                <p><strong>Pricing:</strong> {profile?.pricing || 'N/A'}</p>
                                                <Button variant="primary" onClick={() => setIsEditing(true)}>
                                                    Edit Profile
                                                </Button>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Tab.Pane>



                    <Tab.Pane eventKey="jobs">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold gradient-text" style={{ background: 'linear-gradient(45deg, #2193b0, #6dd5ed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Job Board
                            </h3>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ maxWidth: '250px', borderRadius: '20px' }}
                                />
                                <Form.Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    style={{ maxWidth: '150px', borderRadius: '20px' }}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Paid">Paid</option>
                                </Form.Select>
                            </div>
                        </div>

                        <Row xs={1} md={2} lg={3} className="g-4">
                            {filteredJobs.length === 0 ? (
                                <Col xs={12}>
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                                        <p>No jobs found matching your criteria.</p>
                                    </div>
                                </Col>
                            ) : (
                                filteredJobs.map(job => (
                                    <Col key={job._id}>
                                        <Card className="h-100 border-0 shadow-sm transform-hover" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                            <div className={`p-3 text-white d-flex justify-content-between align-items-center`}
                                                style={{
                                                    background: job.status === 'Pending' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                                                        job.status === 'In Progress' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                                                            job.status === 'Completed' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' :
                                                                'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' // Paid
                                                }}>
                                                <div className="fw-bold"><i className="bi bi-calendar-event me-2"></i>{new Date(job.event.date).toLocaleDateString()}</div>
                                                <Badge bg="white" text="dark" pill className="px-3">{job.status}</Badge>
                                            </div>
                                            <Card.Body>
                                                <Card.Title className="fw-bold mb-1">{job.event.name}</Card.Title>
                                                <Card.Text className="text-muted small mb-3">
                                                    <i className="bi bi-geo-alt me-1"></i> {job.event.location}
                                                </Card.Text>

                                                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                                                    <span className="text-muted small">Agreed Amount</span>
                                                    <span className="fw-bold text-success">₹{job.amount.toLocaleString()}</span>
                                                </div>

                                                <div className="d-grid gap-2">
                                                    {job.status === 'Pending' && (
                                                        <>
                                                            <Button variant="outline-success" className="rounded-pill" onClick={() => handleUpdateStatus(job._id, 'In Progress')}>
                                                                <i className="bi bi-check-lg me-2"></i> Accept Job
                                                            </Button>
                                                            <Button variant="outline-danger" className="rounded-pill">
                                                                <i className="bi bi-x-lg me-2"></i> Decline
                                                            </Button>
                                                        </>
                                                    )}
                                                    {job.status === 'In Progress' && (
                                                        <Button variant="primary" className="rounded-pill" onClick={() => handleUpdateStatus(job._id, 'Completed')}>
                                                            <i className="bi bi-check-circle me-2"></i> Mark Completed
                                                        </Button>
                                                    )}
                                                    {job.status === 'Completed' && (
                                                        <Button variant="secondary" disabled className="rounded-pill opacity-75">
                                                            <i className="bi bi-clock me-2"></i> Waiting for Payment
                                                        </Button>
                                                    )}
                                                    {job.status === 'Paid' && (
                                                        <Button variant="success" disabled className="rounded-pill opacity-75">
                                                            <i className="bi bi-cash-stack me-2"></i> Payment Received
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>
                    </Tab.Pane>

                    <Tab.Pane eventKey="portfolio">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4>My Portfolio</h4>
                            <Button onClick={() => setShowImageModal(true)}>Add Image</Button>
                        </div>
                        <Row xs={1} md={3} className="g-4">
                            {profile?.portfolio?.map((img, idx) => (
                                <Col key={idx}>
                                    <Card>
                                        <Card.Img variant="top" src={img} style={{ height: '200px', objectFit: 'cover' }} />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        {(!profile?.portfolio || profile.portfolio.length === 0) && (
                            <p className="text-muted">No images in portfolio yet.</p>
                        )}
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Add Image Modal */}
            <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Portfolio Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </Form.Group>
                    <div className="text-center mb-3">OR</div>
                    <Form.Group>
                        <Form.Label>Image URL</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowImageModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddImage}>Add</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default VendorDashboard;
