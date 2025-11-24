import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Image, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FindVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [filters, setFilters] = useState({ location: '', serviceType: '' });
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchVendors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchVendors = async () => {
        try {
            const params = new URLSearchParams(filters).toString();
            const res = await axios.get(`http://localhost:5000/api/vendors/search?${params}`);
            setVendors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVendors();
    };

    const handleViewProfile = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    const handleMessage = (vendorId) => {
        navigate(`/messages?chatWith=${vendorId}`);
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Find Vendors</h2>

            <Form onSubmit={handleSearch} className="mb-4">
                <Row className="g-2">
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Location"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            placeholder="Service Type (e.g. Catering)"
                            value={filters.serviceType}
                            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                        />
                    </Col>
                    <Col md={2}>
                        <Button variant="primary" type="submit" className="w-100">Search</Button>
                    </Col>
                </Row>
            </Form>

            <Row xs={1} md={2} lg={3} className="g-4">
                {vendors.map((vendor) => (
                    <Col key={vendor._id}>
                        <Card className="h-100 border-0 shadow-sm hover-shadow transition-all" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-30px',
                                    left: '20px',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#764ba2',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    {(vendor.businessName || vendor.user?.name || 'V').charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <Card.Body className="pt-5">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <Card.Title className="fw-bold mb-0">{vendor.businessName || vendor.user?.name}</Card.Title>
                                    <Badge bg="light" text="dark" className="border">{vendor.serviceType}</Badge>
                                </div>
                                <Card.Text className="text-muted small mb-3">
                                    <i className="bi bi-geo-alt-fill text-danger me-1"></i> {vendor.location}
                                </Card.Text>
                                <Card.Text className="mb-4">
                                    <span className="fw-bold text-primary">{vendor.pricing}</span>
                                </Card.Text>
                                <div className="d-grid gap-2">
                                    <Button variant="outline-primary" className="rounded-pill" onClick={() => handleViewProfile(vendor)}>
                                        View Details
                                    </Button>
                                    <Button variant="primary" className="rounded-pill" onClick={() => handleMessage(vendor.user?._id)}>
                                        Message Vendor
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Vendor Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedVendor?.businessName || selectedVendor?.user?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <h5>Details</h5>
                            <p><strong>Service:</strong> {selectedVendor?.serviceType}</p>
                            <p><strong>Location:</strong> {selectedVendor?.location}</p>
                            <p><strong>Pricing:</strong> {selectedVendor?.pricing}</p>
                            <p><strong>Description:</strong></p>
                            <p>{selectedVendor?.description || 'No description available.'}</p>
                        </Col>
                        <Col md={6}>
                            <h5>Portfolio</h5>
                            <Row xs={2} className="g-2">
                                {selectedVendor?.portfolio?.length > 0 ? (
                                    selectedVendor.portfolio.map((img, idx) => (
                                        <Col key={idx}>
                                            <Image src={img} thumbnail style={{ height: '100px', objectFit: 'cover', width: '100%' }} />
                                        </Col>
                                    ))
                                ) : (
                                    <p className="text-muted">No images available.</p>
                                )}
                            </Row>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => handleMessage(selectedVendor?.user?._id)}>
                        Send Message
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default FindVendors;
