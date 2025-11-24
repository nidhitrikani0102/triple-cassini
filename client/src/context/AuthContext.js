import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the AuthContext
// This acts like a global container for authentication data (user, token)
// Any component in the app can access this data without passing props down manually
export const AuthContext = createContext();

// AuthProvider Component
// This component wraps the entire application (in App.js)
// It provides the 'user', 'login', 'logout', etc. to all children components
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores the current logged-in user's data
    const [loading, setLoading] = useState(true); // Tracks if we are still checking for a logged-in user

    // useEffect runs once when the app starts
    // It checks if there is a saved token in localStorage to keep the user logged in
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                // If a token exists, we retrieve the user data saved in localStorage
                // In a production app, we would verify this token with the backend (/api/auth/me)
                const storedUser = JSON.parse(localStorage.getItem('user'));
                setUser(storedUser);
            }
            setLoading(false); // We are done checking
        };
        checkLoggedIn();
    }, []);

    // Function to handle Login
    // Saves the token and user data to localStorage and updates the state
    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    // Function to handle Registration
    // Sends the user data to the backend API
    const register = async (userData) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', userData);
        return res.data;
    };

    // Function to handle Logout
    // Clears the token and user data from localStorage and state
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Function to update user data locally (e.g., after profile update)
    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    // The Provider component passes these values to all children
    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
