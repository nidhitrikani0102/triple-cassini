import React, { useEffect, useState, useContext } from 'react';
import { Container, Table, Button, Card, Tab, Nav, Badge, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [otpLogs, setOtpLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const { logout } = useContext(AuthContext);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', email: '' });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchData = async () => {
        try {
            const [usersRes, vendorsRes, otpRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/users', config),
                axios.get('http://localhost:5000/api/admin/vendors', config),
                axios.get('http://localhost:5000/api/admin/otps', config)
            ]);
            setUsers(usersRes.data);
            setVendors(vendorsRes.data);
            setOtpLogs(otpRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error fetching data' });
            setLoading(false);
        }
    };

    const handleBlockToggle = async (user) => {
        try {
            const updatedStatus = !user.isBlocked;
            const res = await axios.put(`http://localhost:5000/api/admin/users/${user._id}`, { isBlocked: updatedStatus }, config);

            // Update local state
            const updateState = (list) => list.map(u => u._id === user._id ? { ...u, isBlocked: res.data.isBlocked } : u);
            setUsers(updateState(users));
            setVendors(updateState(vendors));

            setMessage({ type: 'success', text: `User ${updatedStatus ? 'blocked' : 'unblocked'} successfully` });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error updating user status' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
                setUsers(users.filter(u => u._id !== id));
                setVendors(vendors.filter(u => u._id !== id));
                setMessage({ type: 'success', text: 'User deleted successfully' });
            } catch (err) {
                setMessage({ type: 'danger', text: 'Error deleting user' });
            }
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditFormData({ name: user.name, email: user.email });
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/admin/users/${editingUser._id}`, editFormData, config);

            const updateState = (list) => list.map(u => u._id === editingUser._id ? { ...u, name: res.data.name, email: res.data.email } : u);
            setUsers(updateState(users));
            setVendors(updateState(vendors));

            setShowEditModal(false);
            setMessage({ type: 'success', text: 'User updated successfully' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error updating user' });
        }
    };

    const UserTable = ({ data }) => (
        <Table striped bordered hover responsive className="mt-3">
            <thead className="bg-light">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {data.map((u) => (
                    <tr key={u._id}>
                        <td><small>{u._id}</small></td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                            <Badge bg={u.isBlocked ? 'danger' : 'success'}>
                                {u.isBlocked ? 'Blocked' : 'Active'}
                            </Badge>
                        </td>
                        <td>
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(u)}>
                                <i className="bi bi-pencil"></i> Edit
                            </Button>
                            <Button
                                variant={u.isBlocked ? "outline-success" : "outline-warning"}
                                size="sm"
                                className="me-2"
                                onClick={() => handleBlockToggle(u)}
                            >
                                <i className={`bi bi-${u.isBlocked ? 'check-circle' : 'slash-circle'}`}></i> {u.isBlocked ? 'Unblock' : 'Block'}
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(u._id)}>
                                <i className="bi bi-trash"></i> Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                {data.length === 0 && <tr><td colSpan="5" className="text-center">No records found</td></tr>}
            </tbody>
        </Table>
    );

    const OtpLogTable = ({ data }) => (
        <Table striped bordered hover responsive className="mt-3">
            <thead className="bg-light">
                <tr>
                    <th>Time</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>OTP/Token</th>
                </tr>
            </thead>
            <tbody>
                {data.map((log) => (
                    <tr key={log._id}>
                        <td><small>{new Date(log.createdAt).toLocaleString()}</small></td>
                        <td>{log.email}</td>
                        <td>
                            <Badge bg={log.type === 'Login' ? 'info' : 'warning'}>
                                {log.type}
                            </Badge>
                        </td>
                        <td className="font-monospace">{log.otp}</td>
                    </tr>
                ))}
                {data.length === 0 && <tr><td colSpan="4" className="text-center">No logs found</td></tr>}
            </tbody>
        </Table>
    );

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="bi bi-shield-lock me-2"></i>Admin Dashboard</h2>
            </div>

            {message && <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}

            <Card className="shadow-sm">
                <Card.Body>
                    <Tab.Container defaultActiveKey="users">
                        <Nav variant="tabs" className="mb-3">
                            <Nav.Item>
                                <Nav.Link eventKey="users">Users ({users.length})</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="vendors">Vendors ({vendors.length})</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="otps">OTP Logs</Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey="users">
                                <UserTable data={users} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="vendors">
                                <UserTable data={vendors} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="otps">
                                <OtpLogTable data={otpLogs} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </Card.Body>
            </Card>

            {/* Edit User Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password (leave blank to keep current)</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter new password"
                                value={editFormData.password || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleEditSubmit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminDashboard;
