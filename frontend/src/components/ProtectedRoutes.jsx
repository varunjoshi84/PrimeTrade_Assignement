import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoutes = ({ allowedRoles = [] }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // Return a beautiful glassmorphic full-page loader
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center flex-col gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-brand-purple animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-brand-blue animate-spin animation-delay-200"></div>
                </div>
                <p className="text-zinc-400 font-medium text-sm tracking-wide animate-pulse">
                    Validating secure session...
                </p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User role not authorized, redirect to main dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
