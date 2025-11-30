import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';

const NavigationBar = () => {
    const { user, logout } = useContext(AuthContext);
    const { openModal } = useContext(ModalContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Scroll Effect Listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowMobileMenu(false);
    };

    const handleNavClick = (path) => {
        setShowMobileMenu(false);
        if (path.startsWith('#')) {
            const element = document.querySelector(path);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Define menu items based on role
    const getMenuItems = () => {
        if (!user) {
            return [
                { label: 'Features', path: '#expertise' },
                { label: 'Testimonials', path: '#testimonials' },
                { label: 'Gallery', path: '#real-magic' },
                { label: 'Contact', path: '#contact' },
            ];
        }
        if (user.role === 'vendor') {
            return [
                { label: 'Dashboard', path: '/vendor-dashboard' },
                { label: 'Messages', path: '/messages' },
            ];
        }
        if (user.role === 'admin') {
            return [];
        }
        return [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Invitations', path: '/invitations' },
            { label: 'Find Vendors', path: '/find-vendors' },
            { label: 'Messages', path: '/messages' },
        ];
    };

    const menuItems = getMenuItems();
    const isHome = location.pathname === '/';

    // Navbar Styles
    const navbarStyle = {
        background: scrolled || !isHome ? 'rgba(0, 0, 0, 0.85)' : 'transparent',
        backdropFilter: scrolled || !isHome ? 'blur(15px)' : 'none',
        borderBottom: scrolled || !isHome ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'all 0.4s ease',
        padding: scrolled ? '15px 0' : '25px 0',
        boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.1)' : 'none',
    };

    const linkStyle = {
        fontFamily: "'Montserrat', sans-serif",
        fontSize: '0.9rem',
        fontWeight: '500',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: 'white',
        position: 'relative',
        opacity: 0.9,
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    };

    return (
        <Navbar fixed="top" expand="lg" style={navbarStyle} variant="dark">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 font-cinzel text-gradient-gold" style={{ letterSpacing: '2px' }}>
                    EventEmpire
                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="offcanvasNavbar"
                    onClick={() => setShowMobileMenu(true)}
                    className="border-0 shadow-none"
                >
                    <i className="bi bi-list fs-1 text-white"></i>
                </Navbar.Toggle>

                <Navbar.Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="end"
                    show={showMobileMenu}
                    onHide={() => setShowMobileMenu(false)}
                    style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)' }}
                >
                    <Offcanvas.Header closeButton closeVariant="white">
                        <Offcanvas.Title id="offcanvasNavbarLabel" className="font-cinzel text-gradient-gold fs-2">
                            EventEmpire
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="justify-content-end flex-grow-1 pe-3 align-items-center gap-4">
                            {menuItems.map((item) => (
                                item.path.startsWith('#') ? (
                                    <Nav.Link
                                        key={item.label}
                                        href={item.path}
                                        style={linkStyle}
                                        className="nav-hover-effect"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(item.path);
                                        }}
                                    >
                                        {item.label}
                                    </Nav.Link>
                                ) : (
                                    <Nav.Link
                                        key={item.label}
                                        as={Link}
                                        to={item.path}
                                        style={linkStyle}
                                        className="nav-hover-effect"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        {item.label}
                                    </Nav.Link>
                                )
                            ))}

                            {!user ? (
                                <>
                                    <Nav.Link
                                        style={linkStyle}
                                        onClick={() => {
                                            setShowMobileMenu(false);
                                            openModal('login');
                                        }}
                                    >
                                        Login
                                    </Nav.Link>
                                    <Button
                                        variant="light"
                                        className="rounded-pill px-4 py-2 fw-bold font-montserrat shadow-lg hover-scale"
                                        style={{ background: 'linear-gradient(45deg, #FFD700, #FDB931)', border: 'none', color: '#000' }}
                                        onClick={() => {
                                            setShowMobileMenu(false);
                                            openModal('register');
                                        }}
                                    >
                                        Get Started
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {user.role !== 'admin' && (
                                        <Button
                                            variant="outline-light"
                                            as={Link}
                                            to="/profile"
                                            className="rounded-pill px-4 py-2 font-montserrat hover-scale"
                                            style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            Profile
                                        </Button>
                                    )}
                                    <Button
                                        variant="link"
                                        onClick={handleLogout}
                                        className="text-white text-decoration-none font-montserrat opacity-75 hover-opacity-100"
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
