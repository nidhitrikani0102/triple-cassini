import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventPage from './pages/EventPage';
import FindVendors from './pages/FindVendors';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import RSVPPage from './pages/RSVPPage';
import ForgotPassword from './pages/ForgotPassword';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

// Helper component to conditionally render Navbar
const Layout = ({ children }) => {
    const location = useLocation();
    // Don't show Navbar on RSVP pages
    const showNavbar = !location.pathname.startsWith('/rsvp');

    return (
        <>
            {showNavbar && <Navbar />}
            {children}
        </>
    );
};

function App() {
    return (
        // AuthProvider wraps the app to provide authentication state (user, login, logout) to all components
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        {/* Public Routes: Accessible by anyone */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/rsvp/:guestId" element={<RSVPPage />} />

                        {/* Protected Routes: Accessible only by logged-in users with specific roles */}
                        {/* PrivateRoute checks if the user is logged in and has the required role */}

                        {/* User Dashboard: Only for 'user' role */}
                        <Route path="/dashboard" element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />

                        {/* Event Details: Only for 'user' role */}
                        <Route path="/events/:id" element={<PrivateRoute roles={['user']}><EventPage /></PrivateRoute>} />

                        {/* Find Vendors: Only for 'user' role */}
                        <Route path="/find-vendors" element={<PrivateRoute roles={['user']}><FindVendors /></PrivateRoute>} />

                        {/* Messages: Accessible by both 'user' and 'vendor' */}
                        <Route path="/messages" element={<PrivateRoute roles={['user', 'vendor']}><Messages /></PrivateRoute>} />

                        {/* Vendor Dashboard: Only for 'vendor' role */}
                        <Route path="/vendor-dashboard" element={<PrivateRoute roles={['vendor']}><VendorDashboard /></PrivateRoute>} />

                        {/* Admin Dashboard: Only for 'admin' role */}
                        <Route path="/admin-dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />

                        {/* Profile: Accessible by all authenticated roles */}
                        <Route path="/profile" element={<PrivateRoute roles={['user', 'vendor', 'admin']}><Profile /></PrivateRoute>} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;
