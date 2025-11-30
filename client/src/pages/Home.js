import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

// Assets
import mainVideo from '../assets/homeeventmainvideo1.mp4';
import subVideo from '../assets/homeeventsubvideo1.mp4';
import homeEvent1 from '../assets/homeevent1.jpg';
import homeEvent2 from '../assets/homeevent2.jpg';
import homeEvent3 from '../assets/homeevent3.jpg';
import homeEvent4 from '../assets/homeevent4.jpg';
import homeEvent5 from '../assets/homeevent5.jpg';
import homeEvent6 from '../assets/homeevent6.jpg';
import homeEvent7 from '../assets/homeevent7.jpg';
import homeEvent8 from '../assets/homeevent8.jpg';
import homeEvent9 from '../assets/homeevent9.jpg';

// Specific Event Type Images
import weddingImg from '../assets/wedding1.jpg';
import corporateImg from '../assets/corporate event1.jpg';
import birthdayImg from '../assets/birthday1.jpg';
import socialImg from '../assets/social1.jpg';

import people1 from '../assets/Images/people1.jpg';
import people2 from '../assets/Images/people2.jpg';
import people3 from '../assets/Images/people3.jpg';
import people4 from '../assets/Images/people4.jpg';

// Simple CountUp Component for animation
const CountUp = ({ end, duration }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = currentTime - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(ease * end));

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count}</span>;
};

const Home = () => {
    const { user } = useContext(AuthContext);
    const { openModal } = useContext(ModalContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, vendors: 0, events: 0 });

    // Redirect logged-in users
    useEffect(() => {
        if (user) {
            if (user.role === 'vendor') navigate('/vendor-dashboard');
            else if (user.role === 'admin') navigate('/admin-dashboard');
            else navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/stats/public');
                setStats(res.data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    const galleryImages = [homeEvent1, homeEvent2, homeEvent3, homeEvent4, homeEvent5, homeEvent6, homeEvent7, homeEvent8, homeEvent9];

    const testimonials = [
        { img: people1, text: "EventEmpire made planning my wedding so much easier! The budget tracker is a lifesaver.", name: "Sarah J.", role: "Bride", stars: 5 },
        { img: people2, text: "As a corporate event planner, finding vendors used to be a hassle. Now it's just a click away.", name: "Mike T.", role: "Event Coordinator", stars: 4.5 },
        { img: people3, text: "I love the guest list management feature. It kept everything organized for my birthday bash!", name: "Emily R.", role: "Party Host", stars: 5 },
        { img: people4, text: "The vendor directory is amazing. I found the perfect photographer for our anniversary.", name: "David K.", role: "Anniversary Planner", stars: 5 }
    ];

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) stars.push(<i key={i} className="bi bi-star-fill text-warning me-1"></i>);
            else if (i === Math.ceil(rating) && !Number.isInteger(rating)) stars.push(<i key={i} className="bi bi-star-half text-warning me-1"></i>);
            else stars.push(<i key={i} className="bi bi-star text-warning me-1"></i>);
        }
        return stars;
    };

    // Styles
    const heroStyle = {
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center'
    };

    const videoBgStyle = {
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
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1
    };

    const glassBarStyle = {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '30px',
        marginTop: '-80px',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
    };

    const featureCardStyle = {
        border: 'none',
        background: 'white',
        borderRadius: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    };

    return (
        <div className="d-flex flex-column min-vh-100 overflow-hidden" style={{ background: '#f8f9fa' }}>

            {/* 1. Hero Section */}
            <div style={heroStyle}>
                <video autoPlay loop muted style={videoBgStyle}>
                    <source src={mainVideo} type="video/mp4" />
                </video>
                <div style={overlayStyle}></div>
                <Container style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="display-1 fw-bold mb-4 fade-in-up" style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                        Celebrate Life's<br />Grandest Moments
                    </h1>
                    <p className="lead mb-5 fade-in-up fade-delay-1 fs-3 fw-light opacity-90">
                        The all-in-one platform for weddings, corporate galas, and private parties.
                    </p>
                    <div className="d-flex justify-content-center gap-3 fade-in-up fade-delay-2">
                        <Button variant="light" size="lg" onClick={() => openModal('register')} className="px-5 py-3 rounded-pill fw-bold shadow-lg transform-hover text-dark">
                            Start Planning
                        </Button>
                        <Button variant="outline-light" size="lg" onClick={() => openModal('login')} className="px-5 py-3 rounded-pill fw-bold shadow-lg transform-hover">
                            Login
                        </Button>
                    </div>
                </Container>
            </div>

            {/* 2. Glass Stats Strip */}
            <Container className="mb-5">
                <div style={glassBarStyle}>
                    <Row className="text-center text-dark align-items-center">
                        <Col md={4} className="border-end border-secondary border-opacity-25">
                            <div className="mb-2 text-primary opacity-75"><i className="bi bi-people-fill fs-3"></i></div>
                            <h2 className="display-4 fw-bold mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
                                <CountUp end={stats.users} duration={2000} />+
                            </h2>
                            <p className="text-muted text-uppercase small letter-spacing-2 mb-0 fw-bold">Happy Users</p>
                        </Col>
                        <Col md={4} className="border-end border-secondary border-opacity-25">
                            <div className="mb-2 text-gold opacity-75"><i className="bi bi-briefcase-fill fs-3"></i></div>
                            <h2 className="display-4 fw-bold mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
                                <CountUp end={stats.vendors} duration={2000} />+
                            </h2>
                            <p className="text-muted text-uppercase small letter-spacing-2 mb-0 fw-bold">Trusted Vendors</p>
                        </Col>
                        <Col md={4}>
                            <div className="mb-2 text-rose opacity-75"><i className="bi bi-calendar-heart-fill fs-3"></i></div>
                            <h2 className="display-4 fw-bold mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>
                                <CountUp end={stats.events} duration={2000} />+
                            </h2>
                            <p className="text-muted text-uppercase small letter-spacing-2 mb-0 fw-bold">Events Planned</p>
                        </Col>
                    </Row>
                </div>
            </Container>

            {/* 3. Features Section */}
            <Container className="py-5 mb-5">
                <div className="text-center mb-5">
                    <h2 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Everything You Need</h2>
                    <p className="text-muted fs-5">Powerful tools to make your event planning seamless.</p>
                </div>
                <Row className="g-4">
                    <Col md={4}>
                        <Card className="h-100 shadow-sm p-4 transform-hover" style={featureCardStyle}>
                            <Card.Body className="text-center">
                                <div className="mb-4 text-gold display-3"><i className="bi bi-calendar-check"></i></div>
                                <h3 className="fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Event Management</h3>
                                <p className="text-muted">Create and manage multiple events. Track dates, locations, and guest lists with ease.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm p-4 transform-hover" style={featureCardStyle}>
                            <Card.Body className="text-center">
                                <div className="mb-4 text-rose display-3"><i className="bi bi-shop"></i></div>
                                <h3 className="fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Vendor Discovery</h3>
                                <p className="text-muted">Find and connect with top-rated vendors for catering, photography, venues, and more.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 shadow-sm p-4 transform-hover" style={featureCardStyle}>
                            <Card.Body className="text-center">
                                <div className="mb-4 text-navy display-3"><i className="bi bi-cash-coin"></i></div>
                                <h3 className="fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Budget Tracking</h3>
                                <p className="text-muted">Keep your finances in check. Set budgets, track expenses, and never overspend again.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* 3.5. Expertise Section */}
            <Container className="mb-5" id="expertise">
                <div className="text-center mb-5">
                    <h2 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Our Expertise</h2>
                    <p className="text-muted fs-5">Tailored experiences for every occasion.</p>
                </div>
                <Row className="g-4">
                    <Col md={3}>
                        <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px' }}>
                            <div style={{ height: '250px', overflow: 'hidden' }}>
                                <Card.Img src={weddingImg} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                            </div>
                            <Card.Body className="text-center">
                                <h4 className="fw-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Weddings</h4>
                                <p className="text-muted small fst-italic">"Say 'I Do' to perfection."</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px' }}>
                            <div style={{ height: '250px', overflow: 'hidden' }}>
                                <Card.Img src={corporateImg} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                            </div>
                            <Card.Body className="text-center">
                                <h4 className="fw-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Corporate</h4>
                                <p className="text-muted small fst-italic">"Elevate your brand experience."</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px' }}>
                            <div style={{ height: '250px', overflow: 'hidden' }}>
                                <Card.Img src={socialImg} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                            </div>
                            <Card.Body className="text-center">
                                <h4 className="fw-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Social</h4>
                                <p className="text-muted small fst-italic">"Parties that pop."</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 border-0 shadow-sm overflow-hidden transform-hover" style={{ borderRadius: '20px' }}>
                            <div style={{ height: '250px', overflow: 'hidden' }}>
                                <Card.Img src={birthdayImg} style={{ height: '100%', width: '100%', objectFit: 'cover' }} className="hover-zoom" />
                            </div>
                            <Card.Body className="text-center">
                                <h4 className="fw-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Birthdays</h4>
                                <p className="text-muted small fst-italic">"Make a wish, we handle the rest."</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* 4. Sub-Video Section */}
            <div className="position-relative py-5 mb-5 bg-dark overflow-hidden" style={{ height: '600px' }}>
                <video autoPlay loop muted style={{ ...videoBgStyle, opacity: 0.6 }}>
                    <source src={subVideo} type="video/mp4" />
                </video>
                <div className="position-absolute top-0 left-0 w-100 h-100 d-flex align-items-center justify-content-center text-center text-white" style={{ zIndex: 2 }}>
                    <Container>
                        <h2 className="display-2 fw-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Experience the Vibe</h2>
                        <p className="fs-4 mb-5 opacity-90" style={{ maxWidth: '700px', margin: '0 auto' }}>
                            From intimate gatherings to grand celebrations, EventEmpire helps you create moments that last a lifetime.
                        </p>
                        <Button variant="outline-light" size="lg" onClick={() => openModal('register')} className="px-5 py-3 rounded-pill fw-bold">
                            Join the Community
                        </Button>
                    </Container>
                </div>
            </div>

            {/* 5. Gallery Teaser (Horizontal Scroll) */}
            <Container fluid className="px-0 mb-5" id="real-magic">
                <div className="text-center mb-5">
                    <h2 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Real Magic</h2>
                    <p className="text-muted fs-5">Get inspired by real events planned on EventEmpire.</p>
                </div>
                <div className="d-flex overflow-auto hide-scrollbar pb-4" style={{ gap: '2px' }}>
                    {galleryImages.map((img, index) => (
                        <div key={index} style={{ minWidth: '300px', height: '400px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }} className="gallery-item">
                            <img src={img} alt={`Event ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="hover-zoom-lg" />
                            <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark text-white opacity-0 hover-opacity-100 transition-opacity">
                                <p className="mb-0 fw-bold">Real Event #{index + 1}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>

            {/* 6. Testimonials */}
            <Container className="py-5 mb-5" id="testimonials">
                <div className="text-center mb-5">
                    <h2 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Loved by Thousands</h2>
                    <p className="text-muted fs-5">Don't just take our word for it. See what our community has to say.</p>
                </div>
                <Row className="g-4">
                    {testimonials.map((t, index) => (
                        <Col md={6} key={index}>
                            <Card className="h-100 border-0 shadow-sm p-4 transform-hover" style={{ background: 'white', borderRadius: '20px' }}>
                                <Card.Body className="d-flex align-items-start">
                                    <div className="me-4">
                                        <img src={t.img} alt={t.name} className="rounded-circle shadow-sm" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <div className="mb-2 text-gold fs-5">
                                            {renderStars(t.stars)}
                                        </div>
                                        <Card.Text className="fst-italic mb-3 text-dark opacity-75">"{t.text}"</Card.Text>
                                        <h5 className="fw-bold mb-0" style={{ fontFamily: 'Playfair Display, serif' }}>{t.name}</h5>
                                        <small className="text-muted text-uppercase letter-spacing-1" style={{ fontSize: '0.75rem' }}>{t.role}</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* 7. Footer */}
            <footer className="bg-dark text-white py-5 mt-auto" id="contact">
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
        </div>
    );
};

export default Home;
