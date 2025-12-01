import React, { useEffect, useState, useContext } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Tab, Nav, Modal, Badge, Tabs } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import vendorHero from '../assets/VendorDashboard.png'; // New Hero Image
import PaginationControl from '../components/PaginationControl';

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
    const [newVideo, setNewVideo] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Job Requests State
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [paginatedJobs, setPaginatedJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterEventType, setFilterEventType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 9;

    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchProfile();
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        let result = jobs;

        // Filter by Status
        if (filterStatus !== 'All') {
            result = result.filter(job => job.status === filterStatus);
        }

        // Filter by Event Type
        if (filterEventType !== 'All') {
            result = result.filter(job => job.event.type === filterEventType);
        }

        // Filter by Search Term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(job =>
                job.event.name.toLowerCase().includes(lowerTerm) ||
                job.event.location.toLowerCase().includes(lowerTerm) ||
                job.amount.toString().includes(lowerTerm)
            );
        }

        setFilteredJobs(result);
        setTotalPages(Math.ceil(result.length / itemsPerPage));
        setCurrentPage(1); // Reset to first page on filter change
    }, [jobs, searchTerm, filterStatus, filterEventType]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedJobs(filteredJobs.slice(startIndex, endIndex));
    }, [filteredJobs, currentPage]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vendors/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            if (res.data) {
                setFormData({
                    serviceType: res.data.serviceType || '',
                    location: res.data.location || '',
                    pricing: res.data.pricing || '',
                    description: res.data.description || '',
                });
            }
        } catch (err) {
            console.log('No profile found');
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/assignments/vendor/my-jobs?limit=all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data.assignments);
        } catch (err) {
            console.error("Error fetching jobs:", err);
        }
    };

    const handleUpdateStatus = async (jobId, status) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/assignments/${jobId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(jobs.map(job => job._id === jobId ? res.data : job));
            setMessage({ type: 'success', text: `Job marked as ${status}` });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Failed to update status' });
        }
    };

    const handleSave = async () => {
        if (!formData.serviceType || !formData.location || !formData.description || !formData.pricing) {
            setMessage({ type: 'danger', text: 'Please fill in all mandatory fields.' });
            return;
        }
        try {
            const res = await axios.post('http://localhost:5000/api/vendors/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error saving profile' });
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAddImage = async () => {
        try {
            let mediaUrl = newImage;

            if (newVideo) {
                mediaUrl = newVideo;
            }

            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);
                const uploadRes = await axios.post('http://localhost:5000/api/vendors/upload', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                mediaUrl = uploadRes.data.imageUrl;
            }

            if (!mediaUrl) {
                setMessage({ type: 'danger', text: 'Please provide an image/video URL or upload a file' });
                return;
            }

            const res = await axios.post('http://localhost:5000/api/vendors/portfolio', { imageUrl: mediaUrl }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setNewImage('');
            setNewVideo('');
            setSelectedFile(null);
            setShowImageModal(false);
            setMessage({ type: 'success', text: 'Media added to portfolio' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error adding media' });
        }
    };

    // --- Creative Styles & Animations ---
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Montserrat:wght@300;400;600&display=swap');

        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        .hover-3d {
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .hover-3d:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 30px 60px rgba(0,0,0,0.15) !important;
        }

        .gradient-mesh {
            background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%);
            background-size: 200% 200%;
            animation: gradientMove 15s ease infinite;
        }

        @keyframes gradientMove {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
        }

        .floating-icon {
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0% { transform: translateY(0px) rotate(-15deg); }
            50% { transform: translateY(-15px) rotate(-10deg); }
            100% { transform: translateY(0px) rotate(-15deg); }
        }

        .nav-pills .nav-link.active {
            background: linear-gradient(45deg, #1a1a1a, #333) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
    `;

    const heroStyle = {
        position: 'relative',
        height: '70vh',
        width: '100%',
        overflow: 'hidden',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        marginBottom: '0',
        backgroundAttachment: 'fixed',
        backgroundImage: `url(${vendorHero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
    };

    const contentStyle = {
        position: 'relative',
        zIndex: 2,
        maxWidth: '900px',
        padding: '20px'
    };

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
        height: '100%',
        overflow: 'hidden'
    };

    const statCardStyle = {
        ...glassCardStyle,
        position: 'relative',
        overflow: 'hidden'
    };

    const statIconStyle = {
        position: 'absolute',
        right: '-10px',
        bottom: '-10px',
        fontSize: '7rem',
        opacity: '0.08',
        zIndex: 0
    };

    return (
        <div className="font-montserrat" style={{ background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <style>{styles}</style>

            {/* Hero Section */}
            <div style={heroStyle}>
                <div style={overlayStyle} className="gradient-mesh"></div>
                <div style={contentStyle} className="fade-in-up">
                    <Badge bg="light" text="dark" className="mb-4 px-4 py-2 rounded-pill text-uppercase tracking-wider shadow-lg fw-bold">Vendor Portal</Badge>
                    <h1 className="display-1 fw-bold mb-3 font-cinzel" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        Welcome back, {user?.name}
                    </h1>
                    <p className="fs-4 opacity-90 fw-light font-montserrat" style={{ maxWidth: '600px', margin: '0 auto', letterSpacing: '1px' }}>
                        Curate your legacy. Manage your empire.
                    </p>
                </div>
            </div>

            <Container className="mb-5 position-relative" style={{ marginTop: '-120px', zIndex: 10 }}>
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="mb-4 shadow-lg border-0 rounded-3">
                        {message.text}
                    </Alert>
                )}

                {/* Stats Row - Creative */}
                <Row className="g-4 mb-5">
                    <Col md={3}>
                        <Card style={statCardStyle} className="text-center p-4 border-0 hover-3d">
                            <Card.Body className="position-relative z-1">
                                <h2 className="fw-bold display-4 mb-0 font-cinzel" style={{ background: 'linear-gradient(45deg, #2193b0, #6dd5ed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{jobs.length}</h2>
                                <p className="text-muted small text-uppercase fw-bold tracking-wider mt-2">Total Jobs</p>
                            </Card.Body>
                            <i className="bi bi-briefcase-fill floating-icon" style={statIconStyle}></i>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card style={statCardStyle} className="text-center p-4 border-0 hover-3d">
                            <Card.Body className="position-relative z-1">
                                <h2 className="fw-bold display-4 mb-0 font-cinzel" style={{ background: 'linear-gradient(45deg, #f12711, #f5af19)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{jobs.filter(j => j.status === 'Pending').length}</h2>
                                <p className="text-muted small text-uppercase fw-bold tracking-wider mt-2">Pending</p>
                            </Card.Body>
                            <i className="bi bi-hourglass-split floating-icon" style={{ ...statIconStyle, animationDelay: '1s' }}></i>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card style={statCardStyle} className="text-center p-4 border-0 hover-3d">
                            <Card.Body className="position-relative z-1">
                                <h2 className="fw-bold display-4 mb-0 font-cinzel" style={{ background: 'linear-gradient(45deg, #11998e, #38ef7d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{jobs.filter(j => ['Completed', 'Paid'].includes(j.status)).length}</h2>
                                <p className="text-muted small text-uppercase fw-bold tracking-wider mt-2">Completed</p>
                            </Card.Body>
                            <i className="bi bi-check-circle-fill floating-icon" style={{ ...statIconStyle, animationDelay: '2s' }}></i>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card style={statCardStyle} className="text-center p-4 border-0 hover-3d">
                            <Card.Body className="position-relative z-1">
                                <h2 className="fw-bold display-4 mb-0 font-cinzel" style={{ background: 'linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹{jobs.reduce((acc, curr) => acc + (['Completed', 'Paid'].includes(curr.status) ? curr.amount : 0), 0).toLocaleString()}</h2>
                                <p className="text-muted small text-uppercase fw-bold tracking-wider mt-2">Earnings</p>
                            </Card.Body>
                            <i className="bi bi-wallet-fill floating-icon" style={{ ...statIconStyle, animationDelay: '3s' }}></i>
                        </Card>
                    </Col>
                </Row>

                {/* Main Content Tabs - Floating Pills */}
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <div className="d-flex justify-content-center mb-5">
                        <Nav variant="pills" className="bg-white p-2 rounded-pill shadow-lg gap-2">
                            <Nav.Item>
                                <Nav.Link eventKey="profile" className={`rounded-pill px-5 py-3 fw-bold transition-all ${activeTab === 'profile' ? 'text-white' : 'text-muted hover-bg-light'}`}>
                                    <i className="bi bi-person-badge me-2"></i> Profile
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="jobs" className={`rounded-pill px-5 py-3 fw-bold transition-all ${activeTab === 'jobs' ? 'text-white' : 'text-muted hover-bg-light'}`}>
                                    <i className="bi bi-briefcase me-2"></i> Job Board
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="portfolio" className={`rounded-pill px-5 py-3 fw-bold transition-all ${activeTab === 'portfolio' ? 'text-white' : 'text-muted hover-bg-light'}`}>
                                    <i className="bi bi-images me-2"></i> Portfolio
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    <Tab.Content>
                        <Tab.Pane eventKey="profile">
                            <Row className="justify-content-center">
                                <Col md={10} lg={8}>
                                    <Card style={glassCardStyle} className="border-0 overflow-hidden hover-3d">
                                        <div style={{ height: '220px', background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' }}></div>
                                        <div className="px-4 px-md-5 pb-4 pb-md-5 position-relative">
                                            <div className="position-absolute top-0 start-50 translate-middle">
                                                <div className="bg-white p-2 rounded-circle shadow-lg">
                                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '140px', height: '140px' }}>
                                                        <i className="bi bi-person-circle fs-1 text-secondary"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 pt-5 text-center mb-5">
                                                <h3 className="fw-bold mb-2 display-5 font-cinzel">{profile?.serviceType || 'Vendor Profile'}</h3>
                                                <p className="text-muted fs-5"><i className="bi bi-geo-alt-fill me-1 text-danger"></i> {profile?.location || 'Location not set'}</p>
                                            </div>

                                            {!profile && !isEditing && (
                                                <Alert variant="info" className="mb-4">You haven't set up your profile yet.</Alert>
                                            )}

                                            {isEditing ? (
                                                <Form>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="small fw-bold text-muted text-uppercase">Service Type</Form.Label>
                                                                <Form.Select
                                                                    value={formData.serviceType}
                                                                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                                                    className="rounded-pill border-0 shadow-sm bg-light py-3"
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
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="small fw-bold text-muted text-uppercase">Location</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    value={formData.location}
                                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                                    className="rounded-pill border-0 shadow-sm bg-light py-3"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="small fw-bold text-muted text-uppercase">Pricing</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={formData.pricing}
                                                            onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                                                            className="rounded-pill border-0 shadow-sm bg-light py-3"
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="small fw-bold text-muted text-uppercase">Description</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            value={formData.description}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            className="rounded-4 border-0 shadow-sm bg-light p-3"
                                                            placeholder="Describe your services..."
                                                        />
                                                    </Form.Group>
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button variant="light" onClick={() => setIsEditing(false)} className="rounded-pill px-4 py-2">
                                                            Cancel
                                                        </Button>
                                                        <Button variant="dark" onClick={handleSave} className="rounded-pill px-4 py-2 shadow-lg">
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                </Form>
                                            ) : (
                                                <div className="row g-4">
                                                    <div className="col-md-6">
                                                        <div className="p-4 bg-light rounded-4 h-100 border border-white shadow-sm hover-3d">
                                                            <small className="text-muted text-uppercase fw-bold d-block mb-2 tracking-wider">Service Type</small>
                                                            <p className="mb-0 fw-bold fs-5">{profile?.serviceType || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="p-4 bg-light rounded-4 h-100 border border-white shadow-sm hover-3d">
                                                            <small className="text-muted text-uppercase fw-bold d-block mb-2 tracking-wider">Location</small>
                                                            <p className="mb-0 fw-bold fs-5">{profile?.location || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="p-4 bg-light rounded-4 border border-white shadow-sm hover-3d">
                                                            <small className="text-muted text-uppercase fw-bold d-block mb-2 tracking-wider">Pricing</small>
                                                            <p className="mb-0 fw-bold fs-5">{profile?.pricing || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="p-4 bg-light rounded-4 border border-white shadow-sm hover-3d">
                                                            <small className="text-muted text-uppercase fw-bold d-block mb-2 tracking-wider">About</small>
                                                            <p className="mb-0 text-secondary lh-lg">{profile?.description || 'No description provided.'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-12 text-center mt-4">
                                                        <Button variant="outline-dark" onClick={() => setIsEditing(true)} className="rounded-pill px-5 py-2 border-2 fw-bold hover-scale">
                                                            <i className="bi bi-pencil me-2"></i> Edit Profile
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Tab.Pane>

                        <Tab.Pane eventKey="jobs">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold display-6 font-cinzel">Job Board</h3>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search jobs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ maxWidth: '250px', borderRadius: '20px' }}
                                        className="border-0 shadow-sm bg-white"
                                    />
                                    <Form.Select
                                        value={filterEventType}
                                        onChange={(e) => setFilterEventType(e.target.value)}
                                        style={{ maxWidth: '150px', borderRadius: '20px' }}
                                        className="border-0 shadow-sm bg-white"
                                    >
                                        <option value="All">All Types</option>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Birthday">Birthday</option>
                                        <option value="Corporate">Corporate</option>
                                        <option value="Social">Social</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                    <Form.Select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        style={{ maxWidth: '150px', borderRadius: '20px' }}
                                        className="border-0 shadow-sm bg-white"
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
                                            <i className="bi bi-inbox fs-1 mb-3 d-block opacity-25"></i>
                                            <p className="lead">No jobs found matching your criteria.</p>
                                        </div>
                                    </Col>
                                ) : (
                                    paginatedJobs.map(job => (
                                        <Col key={job._id}>
                                            <Card style={glassCardStyle} className="border-0 hover-3d overflow-hidden h-100">
                                                <div className={`p-3 text-white d-flex justify-content-between align-items-center`}
                                                    style={{
                                                        background: job.status === 'Pending' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                                                            job.status === 'In Progress' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
                                                                job.status === 'Completed' ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' :
                                                                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                                                    }}>
                                                    <div className="fw-bold"><i className="bi bi-calendar-event me-2"></i>{new Date(job.event.date).toLocaleDateString()}</div>
                                                    <Badge bg="white" text="dark" pill className="px-3 shadow-sm">{job.status}</Badge>
                                                </div>
                                                <Card.Body className="d-flex flex-column">
                                                    <Card.Title className="fw-bold mb-1 fs-4 font-cinzel">{job.event.name}</Card.Title>
                                                    <Card.Text className="text-muted small mb-3">
                                                        <i className="bi bi-geo-alt me-1 text-danger"></i> {job.event.location}
                                                    </Card.Text>

                                                    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3 border border-white">
                                                        <span className="text-muted small text-uppercase fw-bold">Amount</span>
                                                        <span className="fw-bold text-success fs-5">₹{job.amount.toLocaleString()}</span>
                                                    </div>

                                                    <div className="mt-auto d-grid gap-2">
                                                        {job.status === 'Pending' && (
                                                            <>
                                                                <Button variant="outline-success" className="rounded-pill fw-bold" onClick={() => handleUpdateStatus(job._id, 'In Progress')}>
                                                                    <i className="bi bi-check-lg me-2"></i> Accept
                                                                </Button>
                                                                <Button variant="outline-danger" className="rounded-pill fw-bold" onClick={() => handleUpdateStatus(job._id, 'Declined')}>
                                                                    <i className="bi bi-x-lg me-2"></i> Decline
                                                                </Button>
                                                            </>
                                                        )}
                                                        {job.status === 'In Progress' && (
                                                            <Button variant="dark" className="rounded-pill fw-bold shadow-sm" onClick={() => handleUpdateStatus(job._id, 'Completed')}>
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
                            <PaginationControl
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </Tab.Pane>

                        <Tab.Pane eventKey="portfolio">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold display-6 font-cinzel">My Portfolio</h3>
                                <Button variant="dark" className="rounded-pill px-4 shadow-lg hover-scale" onClick={() => setShowImageModal(true)}>
                                    <i className="bi bi-plus-lg me-2"></i> Add Media
                                </Button>
                            </div>
                            <Row xs={1} md={2} lg={3} className="g-4">
                                {profile?.portfolio?.map((mediaUrl, idx) => {
                                    const isVideo = mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') || mediaUrl.includes('vimeo.com') || mediaUrl.endsWith('.mp4');
                                    return (
                                        <Col key={idx}>
                                            <Card style={glassCardStyle} className="border-0 overflow-hidden hover-3d h-100">
                                                {isVideo ? (
                                                    <div className="video-container bg-dark h-100" style={{ minHeight: '250px' }}>
                                                        {mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ? (
                                                            <iframe
                                                                src={mediaUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                                title={`Portfolio Video ${idx}`}
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                                style={{ width: '100%', height: '100%' }}
                                                            ></iframe>
                                                        ) : (
                                                            <video src={mediaUrl} controls className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Card.Img variant="top" src={mediaUrl} style={{ height: '250px', objectFit: 'cover' }} />
                                                )}
                                                <div className="card-img-overlay d-flex align-items-end p-0">
                                                    <div className="w-100 p-3 bg-gradient-to-t from-black to-transparent text-white opacity-0 hover:opacity-100 transition-opacity">
                                                        <small className="fw-bold">Media #{idx + 1}</small>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                            {(!profile?.portfolio || profile.portfolio.length === 0) && (
                                <div className="text-center py-5">
                                    <div className="display-1 text-muted opacity-25 mb-3"><i className="bi bi-images"></i></div>
                                    <p className="text-muted lead">Showcase your work. Add images or videos to your portfolio.</p>
                                </div>
                            )}
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>

                {/* Add Image/Video Modal */}
                <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered contentClassName="border-0 shadow-lg" style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.8)' }}>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold font-cinzel">Add to Portfolio</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs defaultActiveKey="image" className="mb-3 nav-pills nav-fill">
                            <Tab eventKey="image" title="Image">
                                <Form.Group className="mb-3 mt-3">
                                    <Form.Label className="fw-bold small text-uppercase text-muted">Upload Image</Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="rounded-pill border-0 shadow-sm bg-light"
                                    />
                                </Form.Group>
                                <div className="text-center mb-3 text-muted small fw-bold">- OR -</div>
                                <Form.Group>
                                    <Form.Label className="fw-bold small text-uppercase text-muted">Image URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="https://example.com/image.jpg"
                                        value={newImage}
                                        onChange={(e) => setNewImage(e.target.value)}
                                        className="rounded-pill border-0 shadow-sm bg-light"
                                    />
                                </Form.Group>
                            </Tab>
                            <Tab eventKey="video" title="Video">
                                <Form.Group className="mt-3">
                                    <Form.Label className="fw-bold small text-uppercase text-muted">Video URL (YouTube/Vimeo/MP4)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={newVideo}
                                        onChange={(e) => setNewVideo(e.target.value)}
                                        className="rounded-pill border-0 shadow-sm bg-light"
                                    />
                                    <Form.Text className="text-muted small">
                                        Paste a direct link or embeddable URL.
                                    </Form.Text>
                                </Form.Group>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowImageModal(false)} className="rounded-pill px-4">Cancel</Button>
                        <Button variant="dark" onClick={handleAddImage} className="rounded-pill px-4 shadow-lg">Add Media</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default VendorDashboard;
