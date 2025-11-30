import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventPage from './pages/EventPage';
import FindVendors from './pages/FindVendors';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import RSVPPage from './pages/RSVPPage';
import InvitationView from './pages/InvitationView';
import InvitationsPage from './pages/InvitationsPage';
import ForgotPassword from './pages/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider, ModalContext } from './context/ModalContext';

// Helper component to conditionally render Navbar and Global Modal
const Layout = ({ children }) => {
    const location = useLocation();
    const { showAuthModal, closeModal, authMode } = useContext(ModalContext);

    // Don't show Navbar on RSVP pages
    const showNavbar = !location.pathname.startsWith('/rsvp');

    return (
        <>
            {showNavbar && <Navbar />}
            <AuthModal show={showAuthModal} onHide={closeModal} initialMode={authMode} />
            {children}
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <ModalProvider>
                <Router>
                    <Layout>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/rsvp/:guestId" element={<RSVPPage />} />
                            <Route path="/invitation/:guestId" element={<InvitationView />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />
                            <Route path="/invitations" element={<PrivateRoute roles={['user']}><InvitationsPage /></PrivateRoute>} />
                            <Route path="/events/:id" element={<PrivateRoute roles={['user']}><EventPage /></PrivateRoute>} />
                            <Route path="/find-vendors" element={<PrivateRoute roles={['user']}><FindVendors /></PrivateRoute>} />
                            <Route path="/messages" element={<PrivateRoute roles={['user', 'vendor']}><Messages /></PrivateRoute>} />
                            <Route path="/vendor-dashboard" element={<PrivateRoute roles={['vendor']}><VendorDashboard /></PrivateRoute>} />
                            <Route path="/admin-dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                            <Route path="/profile" element={<PrivateRoute roles={['user', 'vendor', 'admin']}><Profile /></PrivateRoute>} />
                        </Routes>
                    </Layout>
                </Router>
            </ModalProvider>
        </AuthProvider>
    );
}

export default App;
