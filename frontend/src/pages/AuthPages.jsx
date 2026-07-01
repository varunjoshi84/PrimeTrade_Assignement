import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, Shield, Zap, Sparkles } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const AuthPages = () => {
    const { login, register } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    const {
        register: registerField,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm({
        resolver: zodResolver(isLogin ? loginSchema : registerSchema),
        defaultValues: { name: '', email: '', password: '' },
    });

    const passwordVal = watch('password');

    // Simple password strength calculation
    React.useEffect(() => {
        if (isLogin || !passwordVal) {
            setPasswordStrength(0);
            return;
        }
        let score = 0;
        if (passwordVal.length >= 6) score += 1;
        if (passwordVal.length >= 10) score += 1;
        if (/[A-Z]/.test(passwordVal)) score += 1;
        if (/[0-9]/.test(passwordVal) || /[^A-Za-z0-9]/.test(passwordVal)) score += 1;
        setPasswordStrength(score);
    }, [passwordVal, isLogin]);

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength === 3) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength === 1) return 'Weak';
        if (passwordStrength === 2) return 'Fair';
        if (passwordStrength === 3) return 'Strong';
        return 'Excellent';
    };

    const onSubmit = async (data) => {
        let result;
        if (isLogin) {
            result = await login(data.email, data.password);
        } else {
            result = await register(data.name, data.email, data.password);
        }

        if (result.success) {
            reset();
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-100 flex font-sans">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0"></div>

            {/* Glowing Accent */}
            <div className="absolute top-[20%] left-[45%] w-[450px] h-[450px] rounded-full bg-brand-glow blur-[100px] pointer-events-none animate-pulse-glow z-0"></div>

            {/* Left Side Panel (SaaS Branding) */}
            <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 border-r border-zinc-900 flex-col justify-between p-12 relative overflow-hidden z-10">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-glow blur-[120px] pointer-events-none"></div>

                {/* Top logo */}
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-display font-extrabold text-white text-base shadow-lg shadow-brand-purple/20">
                        A
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                        ApexKey
                    </span>
                </Link>

                {/* Middle Content */}
                <div className="space-y-8 max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-brand-purple/10 text-[10px] font-semibold text-purple-400 uppercase tracking-wider"
                    >
                        <Sparkles size={10} className="animate-spin-slow" />
                        <span>Security & Performance Combined</span>
                    </motion.div>

                    <div className="space-y-4">
                        <h2 className="font-display font-extrabold text-3xl tracking-tight leading-tight">
                            Build with Production-Ready MERN Security
                        </h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            ApexKey utilizes cryptographic SHA-256 storage, JWT security with automatic background session refreshing, and robust roles for developer teams.
                        </p>
                    </div>

                    {/* Checkmarks list */}
                    <div className="space-y-3.5 text-xs text-zinc-300">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-purple-950/40 border border-purple-800 flex items-center justify-center text-brand-purple">
                                <Zap size={10} />
                            </div>
                            <span>Dual-Token JWT Cookie Refresh Session Control</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-950/40 border border-blue-800 flex items-center justify-center text-brand-blue">
                                <Shield size={10} />
                            </div>
                            <span>Hashed Database Key Storage</span>
                        </div>
                    </div>
                </div>

                {/* Bottom branding footer */}
                <div className="text-[10px] text-zinc-600">
                    © 2026 ApexKey. Fully compliant with OWASP MERN security practices.
                </div>
            </div>

            {/* Right Side Panel (Interactive Auth Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md glass-panel rounded-2xl border border-zinc-900 p-8 sm:p-10 shadow-2xl relative"
                >
                    {/* Top gradient glow indicator */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent"></div>

                    {/* Tab Navigation header */}
                    <div className="text-center mb-8">
                        <h1 className="font-display font-bold text-2xl tracking-tight mb-2">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h1>
                        <p className="text-xs text-zinc-500">
                            {isLogin ? 'Enter your details below to log in' : 'Register to issue your first API credentials'}
                        </p>
                    </div>

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                                    <User size={12} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    {...registerField('name')}
                                    className={`w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-brand-purple/60 focus:ring-1 focus:ring-brand-purple/20 transition ${
                                        errors.name ? 'border-red-500/50 focus:border-red-500/60' : ''
                                    }`}
                                />
                                {errors.name && (
                                    <p className="text-[10px] text-red-400 font-medium">{errors.name.message}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                                <Mail size={12} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                {...registerField('email')}
                                className={`w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-brand-purple/60 focus:ring-1 focus:ring-brand-purple/20 transition ${
                                    errors.email ? 'border-red-500/50 focus:border-red-500/60' : ''
                                }`}
                            />
                            {errors.email && (
                                <p className="text-[10px] text-red-400 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                                    <Lock size={12} />
                                    Password
                                </label>
                                {isLogin && (
                                    <span className="text-[10px] text-brand-purple hover:underline cursor-pointer">
                                        Forgot?
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...registerField('password')}
                                    className={`w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 pr-10 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-brand-purple/60 focus:ring-1 focus:ring-brand-purple/20 transition ${
                                        errors.password ? 'border-red-500/50 focus:border-red-500/60' : ''
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[10px] text-red-400 font-medium">{errors.password.message}</p>
                            )}

                            {/* Password Strength Indicator */}
                            {!isLogin && passwordVal && (
                                <div className="space-y-1.5 mt-2">
                                    <div className="flex items-center justify-between text-[9px] font-semibold text-zinc-500">
                                        <span>Password Strength</span>
                                        <span className={`text-[9px] ${
                                            passwordStrength <= 1 ? 'text-red-400' :
                                            passwordStrength === 2 ? 'text-yellow-400' :
                                            passwordStrength === 3 ? 'text-blue-400' : 'text-green-400'
                                        }`}>{getStrengthText()}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5 h-1 bg-zinc-900 rounded overflow-hidden">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div
                                                key={step}
                                                className={`h-full rounded-sm transition ${
                                                    step <= passwordStrength ? getStrengthColor() : 'bg-zinc-900'
                                                }`}
                                            ></div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-zinc-500">
                                        Include uppercase letters, numbers, and symbols for better strength.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-lg py-3 text-xs font-semibold hover:opacity-95 shadow-md shadow-brand-purple/10 active:scale-[0.99] transition mt-6 cursor-pointer"
                        >
                            {isLogin ? 'Log In to ApexKey' : 'Register Developer Account'}
                        </button>
                    </form>

                    {/* Toggle Auth Type footer link */}
                    <div className="text-center mt-6 text-xs text-zinc-500">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <Link
                            to={isLogin ? '/register' : '/login'}
                            onClick={() => reset()}
                            className="text-brand-purple hover:underline font-semibold"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPages;
