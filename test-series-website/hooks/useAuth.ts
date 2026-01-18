import { useState, useEffect } from 'react';
import { login as loginService, signup as signupService } from '../services/authService';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for existing user session or token
        const existingUser = localStorage.getItem('user');
        if (existingUser) {
            setUser(JSON.parse(existingUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const userData = await loginService(credentials);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        setLoading(true);
        try {
            const newUser = await signupService(userData);
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return {
        user,
        loading,
        error,
        login,
        signup,
        logout,
    };
};

export default useAuth;