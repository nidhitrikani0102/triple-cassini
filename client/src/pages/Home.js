import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import people1 from '../assets/Images/people1.jpg';
import people2 from '../assets/Images/people2.jpg';
import people3 from '../assets/Images/people3.jpg';
import people4 from '../assets/Images/people4.jpg';

const Home = () => {
    const [stats, setStats] = useState({ users: 0, vendors: 0, events: 0 });

    // Fetch public statistics when the component mounts
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get the count of users, events, and vendors from the public API
                const res = await axios.get('http://localhost:5000/api/stats/public');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    const testimonials = [
        {
            img: people1,
            text: "EventEmpire made planning my wedding so much easier! The budget tracker is a lifesaver.",
            name: "Sarah J.",
            role: "Bride",
            stars: 5
        },
        {
            img: people2,
            text: "As a corporate event planner, finding vendors used to be a hassle. Now it's just a click away.",
            name: "Mike T.",
            role: "Event Coordinator",
            stars: 4.5
        },
        {
            img: people3,
            text: "I love the guest list management feature. It kept everything organized for my birthday bash!",
            name: "Emily R.",
            role: "Party Host",
            stars: 5
        },
        {
            img: people4,
            text: "The vendor directory is amazing. I found the perfect photographer for our anniversary.",
            name: "David K.",
            role: "Anniversary Planner",
            stars: 5
        }
    ];

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<i key={i} className="bi bi-star-fill text-warning me-1"></i>);
            } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                stars.push(<i key={i} className="bi bi-star-half text-warning me-1"></i>);
            } else {
                stars.push(<i key={i} className="bi bi-star text-warning me-1"></i>);
            }
        }
        return stars;
    };

    return (
        <div className="d-flex flex-column min-vh-100 overflow-hidden">
            {/* Hero Section */}
            <div className="position-relative bg-light text-center py-5 mb-5" style={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                {/* Animated Background Shapes */}
                <div className="bg-shape shape-1 floating floating-delay-1"></div>
                <div className="bg-shape shape-2 floating floating-delay-2"></div>

                <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
                    <div className="d-inline-block mb-3">
                        <h1 className="display-3 fw-bold fade-in-up">Plan Your Dream Event</h1>
                    </div>
                    <p className="lead mb-4 fade-in-up fade-delay-1">
                        The all-in-one platform to manage guests, budgets, and vendors for weddings, parties, and corporate events.
                    </p>
                    <div className="d-grid gap-2 d-sm-flex justify-content-sm-center fade-in-up fade-delay-2">
                        <Button variant="light" size="lg" as={Link} to="/register" className="px-4 gap-3 fw-bold text-primary shadow-sm transform-hover">
                            Get Started Free
                        </Button>
                        <Button variant="outline-light" size="lg" as={Link} to="/login" className="px-4 shadow-sm transform-hover">
                            Login
                        </Button>
                    </div>
                </Container>
            </div>

            {/* Stats Section */}
            <Container className="mb-5">
                <div className="text-center mb-5">
                    <h2 className="fw-bold gradient-text d-inline-block" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Our Growing Community</h2>
                    <p className="text-muted">Join thousands of others planning their dream events.</p>
                </div>
                <Row className="g-4 justify-content-center">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-white text-center transform-hover" style={{ background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)' }}>
                            <Card.Body className="p-5">
                                <div className="display-4 fw-bold mb-2">{stats.users}</div>
                                <div className="fs-5">Happy Users</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-white text-center transform-hover" style={{ background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' }}>
                            <Card.Body className="p-5">
                                <div className="display-4 fw-bold mb-2">{stats.vendors}</div>
                                <div className="fs-5">Trusted Vendors</div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm text-white text-center transform-hover" style={{ background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' }}>
                            <Card.Body className="p-5">
                                <div className="display-4 fw-bold mb-2">{stats.events}</div>
                                <div className="fs-5">Events Planned</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Features Section */}
            <Container className="mb-5">
                <Row className="text-center g-4">
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0 transform-hover">
                            <Card.Body className="p-4">
                                <div className="display-4 text-primary mb-3">
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <Card.Title as="h3">Event Management</Card.Title>
                                <Card.Text>
                                    Create and manage multiple events. Track dates, locations, and guest lists with ease.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0 transform-hover">
                            <Card.Body className="p-4">
                                <div className="display-4 text-primary mb-3">
                                    <i className="bi bi-shop"></i>
                                </div>
                                <Card.Title as="h3">Vendor Discovery</Card.Title>
                                <Card.Text>
                                    Find and connect with top-rated vendors for catering, photography, venues, and more.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm border-0 transform-hover">
                            <Card.Body className="p-4">
                                <div className="display-4 text-primary mb-3">
                                    <i className="bi bi-cash-coin"></i>
                                </div>
                                <Card.Title as="h3">Budget Tracking</Card.Title>
                                <Card.Text>
                                    Keep your finances in check. Set budgets, track expenses, and never overspend again.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Testimonials Carousel */}
            <div className="bg-light py-5 mb-5 position-relative overflow-hidden">
                {/* Decorative Circle */}
                <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-primary opacity-10" style={{ width: '300px', height: '300px' }}></div>
                <div className="position-absolute bottom-0 end-0 translate-middle rounded-circle bg-warning opacity-10" style={{ width: '200px', height: '200px' }}></div>

                <Container className="position-relative" style={{ zIndex: 1 }}>
                    <h2 className="text-center fw-bold mb-5">What Our Users Say</h2>
                    <Carousel className="text-center" indicators={true} interval={4000} variant="dark">
                        {testimonials.map((t, index) => (
                            <Carousel.Item key={index} className="pb-5">
                                <div className="d-flex justify-content-center">
                                    <Card className="border-0 shadow-lg mx-3" style={{ marginTop: '100px', maxWidth: '700px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)', overflow: 'visible' }}>
                                        <div className="position-absolute top-0 start-50 translate-middle">
                                            <img
                                                src={t.img}
                                                alt={t.name}
                                                className="rounded-circle shadow-lg border border-4 border-white"
                                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <Card.Body className="p-4" style={{ paddingTop: '100px' }}>
                                            <div className="mt-3">
                                                <div className="mb-3 fs-1 text-primary opacity-25">
                                                    <i className="bi bi-quote"></i>
                                                </div>
                                                <Card.Text className="fs-5 fst-italic mb-4 text-dark">
                                                    "{t.text}"
                                                </Card.Text>
                                                <div className="mb-3">
                                                    {renderStars(t.stars)}
                                                </div>
                                                <h5 className="fw-bold mb-1">{t.name}</h5>
                                                <small className="text-muted text-uppercase letter-spacing-2">{t.role}</small>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Container>
            </div>

            {/* Footer */}
            <footer className="mt-auto py-3 bg-dark text-white text-center">
                <Container>
                    <p className="mb-0">&copy; 2023 EventEmpire. All rights reserved.</p>
                </Container>
            </footer>
        </div>
    );
};

export default Home;
