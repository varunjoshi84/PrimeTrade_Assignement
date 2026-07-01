import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoutes from './components/ProtectedRoutes';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import ApiKeyManagement from './pages/ApiKeyManagement';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import AdminConsole from './pages/AdminConsole';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#09090b',
                                color: '#f3f4f6',
                                border: '1px solid #27272a',
                                fontSize: '12px',
                            },
                        }}
                    />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<AuthPages />} />
                        <Route path="/register" element={<AuthPages />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoutes />}>
                            <Route element={<DashboardLayout />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/keys" element={<ApiKeyManagement />} />
                                <Route path="/logs" element={<Logs />} />
                                <Route path="/settings" element={<Settings />} />
                                
                                {/* Admin Only Route */}
                                <Route element={<ProtectedRoutes allowedRoles={['admin']} />}>
                                    <Route path="/admin" element={<AdminConsole />} />
                                </Route>
                            </Route>
                        </Route>

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
