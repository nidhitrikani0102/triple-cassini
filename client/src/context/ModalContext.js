import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

    const openModal = (mode = 'login') => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    const closeModal = () => {
        setShowAuthModal(false);
    };

    return (
        <ModalContext.Provider value={{ showAuthModal, authMode, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};
