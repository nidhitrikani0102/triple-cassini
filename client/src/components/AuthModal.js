import React, { useState, useContext, useEffect } from 'react';
import { Modal, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AuthModal = ({ show, onHide, initialMode = 'login' }) => {
    const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', secret: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP (Login only)
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoginMode(initialMode === 'login');
        resetForm();
    }, [initialMode, show]);

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'user', secret: '' });
        setOtp('');
        setStep(1);
        setError('');
        setSuccess('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSwitchMode = () => {
        setIsLoginMode(!isLoginMode);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isLoginMode) {
                // --- LOGIN LOGIC ---
                if (step === 1) {
                    const res = await axios.post('http://localhost:5000/api/auth/login', {
                        email: formData.email,
                        password: formData.password
                    });

                    if (res.data.requiresOtp) {
                        setUserId(res.data.userId);
                        setStep(2);
                        setSuccess('OTP sent to your email.');
                    } else {
                        login(res.data.token, res.data);
                        handleRedirect(res.data.role);
                    }
                } else {
                    const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                        userId,
                        otp
                    });
                    login(res.data.token, res.data);
                    handleRedirect(res.data.role);
                }
            } else {
                // --- REGISTER LOGIC ---
                await register(formData);
                setSuccess('Registration successful! Please login.');
                setIsLoginMode(true); // Switch to login after success
                setFormData({ ...formData, password: '' }); // Clear password
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    const handleRedirect = (role) => {
        onHide(); // Close modal
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'vendor') navigate('/vendor-dashboard');
        else navigate('/dashboard');
    };

    // Styles
    const modalStyle = {
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    };

    const contentStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        border: 'none',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
    };

    const inputStyle = {
        backgroundColor: '#f8f9fa',
        border: '1px solid #ced4da',
        color: '#212529'
    };

    return (
        <Modal show={show} onHide={onHide} centered style={modalStyle} contentClassName="bg-transparent border-0">
            <div style={contentStyle} className="p-4">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {isLoginMode ? 'Welcome Back' : 'Join EventEmpire'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                    {success && <Alert variant="success" className="py-2 small">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        {!isLoginMode && (
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted text-uppercase fw-bold">Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    required
                                    className="rounded-pill px-3 py-2"
                                    style={inputStyle}
                                />
                            </Form.Group>
                        )}

                        {step === 1 && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted text-uppercase fw-bold">Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        required
                                        className="rounded-pill px-3 py-2"
                                        style={inputStyle}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted text-uppercase fw-bold">Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        required
                                        className="rounded-pill px-3 py-2"
                                        style={inputStyle}
                                    />
                                </Form.Group>
                            </>
                        )}

                        {!isLoginMode && (
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted text-uppercase fw-bold">I am a...</Form.Label>
                                <Form.Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="rounded-pill px-3 py-2"
                                    style={inputStyle}
                                >
                                    <option value="user">User (Event Planner)</option>
                                    <option value="vendor">Vendor (Service Provider)</option>
                                    <option value="admin">Admin (Platform Manager)</option>
                                </Form.Select>
                            </Form.Group>
                        )}

                        {/* Admin Secret (Register only) */}
                        {!isLoginMode && formData.role === 'admin' && (
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted text-uppercase fw-bold">Admin Secret Key</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="secret"
                                    value={formData.secret}
                                    onChange={handleChange}
                                    className="rounded-pill px-3 py-2"
                                    style={inputStyle}
                                />
                            </Form.Group>
                        )}

                        {/* OTP Step (Login only) */}
                        {isLoginMode && step === 2 && (
                            <Form.Group className="mb-3">
                                <Form.Label className="small text-muted text-uppercase fw-bold">Enter OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="rounded-pill px-3 py-2 text-center letter-spacing-2 fw-bold"
                                    style={inputStyle}
                                />
                            </Form.Group>
                        )}

                        <Button variant="primary" type="submit" className="w-100 rounded-pill py-2 fw-bold shadow-sm mt-2">
                            {isLoginMode ? (step === 1 ? 'Login' : 'Verify OTP') : 'Create Account'}
                        </Button>
                    </Form>

                    <div className="text-center mt-4 pt-3 border-top">
                        <p className="mb-0 text-muted small">
                            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                            <Button variant="link" className="p-0 ms-1 fw-bold text-decoration-none" onClick={handleSwitchMode}>
                                {isLoginMode ? 'Register' : 'Login'}
                            </Button>
                        </p>
                        {isLoginMode && step === 1 && (
                            <div className="mt-2">
                                <Button variant="link" className="p-0 text-muted small text-decoration-none" onClick={() => { onHide(); navigate('/forgot-password'); }}>
                                    Forgot Password?
                                </Button>
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </div>
        </Modal>
    );
};

export default AuthModal;
