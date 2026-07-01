import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            const cachedUser = localStorage.getItem('user');

            if (token) {
                setAccessToken(token);
                if (cachedUser) {
                    setUser(JSON.parse(cachedUser));
                }
                
                try {
                    // Fetch fresh profile from backend
                    const response = await axiosInstance.get('/auth/profile');
                    const freshUser = response.data.data.user;
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                } catch (error) {
                    console.error('Session validation failed:', error.message);
                    // Token might be expired, axios interceptor will try refreshing.
                    // If refresh fails, it redirects to login.
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Register User
    const register = async (name, email, password) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/register', { name, email, password });
            const { user: userData, accessToken: token } = response.data.data;

            setUser(userData);
            setAccessToken(token);
            localStorage.setItem('accessToken', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            toast.success('Registration successful! Welcome to ApexKey.');
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed';
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    // Login User
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            const { user: userData, accessToken: token } = response.data.data;

            setUser(userData);
            setAccessToken(token);
            localStorage.setItem('accessToken', token);
            localStorage.setItem('user', JSON.stringify(userData));

            toast.success(`Welcome back, ${userData.name}!`);
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed';
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    // Logout User
    const logout = async () => {
        setLoading(true);
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error.message);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            toast.success('Logged out successfully.');
            setLoading(false);
        }
    };

    // Update Profile
    const updateProfile = async (name, avatar) => {
        try {
            const response = await axiosInstance.put('/users/profile', { name, avatar });
            const updatedUser = response.data.data.user;

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
            return { success: false, error: msg };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                loading,
                login,
                register,
                logout,
                updateProfile,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
