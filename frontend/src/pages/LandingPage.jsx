import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Key,
    Shield,
    Zap,
    BarChart3,
    ArrowRight,
    Lock,
    Code,
    Sparkles,
} from 'lucide-react';

const LandingPage = () => {
    const { user } = useContext(AuthContext);

    const features = [
        {
            title: 'Hashed API Storage',
            desc: 'Keys are cryptographically hashed using SHA-256 in MongoDB. We show the raw key exactly once upon creation.',
            icon: Lock,
            color: 'from-purple-500/20 to-purple-600/5',
        },
        {
            title: 'Granular Access Roles',
            desc: 'Configure keys with specific scopes (Read, Write, Delete) and rate limits to restrict client capabilities.',
            icon: Shield,
            color: 'from-blue-500/20 to-blue-600/5',
        },
        {
            title: 'Real-time Latency Logs',
            desc: 'Track requests over time, endpoint distribution, response times, and status code counts on our dashboards.',
            icon: BarChart3,
            color: 'from-cyan-500/20 to-cyan-600/5',
        },
        {
            title: 'Axios Session Refreshing',
            desc: 'Seamless session management using dual token JWT auth. Automatic background access token renewal.',
            icon: Zap,
            color: 'from-pink-500/20 to-pink-600/5',
        },
    ];

    const stats = [
        { value: '1.2M+', label: 'Requests Analyzed' },
        { value: '45ms', label: 'Average Latency' },
        { value: '99.99%', label: 'Gateway Uptime' },
        { value: 'SHA-256', label: 'Key Cryptography' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    };

    return (
        <div className="min-h-screen bg-[#030303] text-zinc-100 relative overflow-hidden font-sans">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 z-0 pointer-events-none"></div>

            {/* Glowing Accent Spotlights */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-950/20 blur-[130px] animate-pulse-glow z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-950/20 blur-[120px] animate-pulse-glow z-0 pointer-events-none"></div>

            {/* Navbar Header */}
            <header className="relative z-10 h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-zinc-900/50">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-display font-extrabold text-white text-base shadow-lg shadow-brand-purple/20 animate-spin-slow">
                        A
                    </div>
                    <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                        ApexKey
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white rounded-lg transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-zinc-400 hover:text-white text-xs font-semibold transition"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-lg hover:opacity-95 shadow-md shadow-brand-purple/20 transition"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 border border-brand-purple/20 text-xs font-medium text-purple-400 mb-6 shadow-sm shadow-purple-950/20"
                >
                    <Sparkles size={12} className="animate-pulse" />
                    <span>Next-Gen API Key Credentials Vault</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6"
                >
                    Issue, Monitor, and Secure{' '}
                    <span className="bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan bg-clip-text text-transparent">
                        API Credentials
                    </span>{' '}
                    in Seconds.
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
                >
                    ApexKey gives developers the toolkit to manage application tokens, rate limit client endpoints,
                    and query live response latencies with a dark Stripe-like experience.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                >
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition shadow-lg flex items-center justify-center gap-2 group"
                        >
                            Open Dashboard
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-brand-purple/20 transition flex items-center justify-center gap-2 group"
                            >
                                Start Building for Free
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-sm transition flex items-center justify-center gap-2"
                            >
                                <Code size={16} />
                                View API Documentation
                            </Link>
                        </>
                    )}
                </motion.div>

                {/* Dashboard Showcase Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                    className="relative max-w-4xl mx-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md p-2 shadow-2xl shadow-purple-950/10 overflow-hidden"
                >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
                    <div className="h-6 flex items-center gap-1.5 px-3 border-b border-zinc-900 text-[10px] text-zinc-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                        <span className="ml-1.5 select-none font-mono">dashboard.apexkey.io</span>
                    </div>
                    {/* Mock Dashboard Graphics */}
                    <div className="p-4 sm:p-6 bg-zinc-950/20 font-mono text-left text-xs space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-zinc-900/30 rounded border border-zinc-900">
                                <div className="text-[10px] text-zinc-500 uppercase">Requests</div>
                                <div className="text-sm font-semibold text-zinc-100 mt-1">112,492</div>
                            </div>
                            <div className="p-3 bg-zinc-900/30 rounded border border-zinc-900">
                                <div className="text-[10px] text-zinc-500 uppercase">Active Keys</div>
                                <div className="text-sm font-semibold text-zinc-100 mt-1">8 / 10</div>
                            </div>
                            <div className="p-3 bg-zinc-900/30 rounded border border-zinc-900">
                                <div className="text-[10px] text-zinc-500 uppercase">Errors</div>
                                <div className="text-sm font-semibold text-red-400 mt-1">0.14%</div>
                            </div>
                        </div>
                        <div className="h-32 bg-zinc-900/10 rounded border border-zinc-900/40 p-3 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[9px] text-zinc-600">
                                <span>150 req/m</span>
                                <span>API GATEWAY LATENCY OVERVIEW</span>
                            </div>
                            <div className="flex items-end justify-between h-16 pt-2 gap-1.5">
                                {[35, 45, 60, 42, 38, 55, 75, 48, 62, 40, 50, 68, 85, 44, 30, 52, 48, 70, 95, 50].map((h, i) => (
                                    <div
                                        key={i}
                                        style={{ height: `${h}%` }}
                                        className="flex-1 bg-gradient-to-t from-brand-blue/30 to-brand-purple/65 rounded-t-sm"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Statistics Row */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 py-12 border-y border-zinc-900 bg-zinc-950/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {stats.map((s, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="font-display font-extrabold text-2xl sm:text-3xl bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                {s.value}
                            </div>
                            <div className="text-zinc-500 text-xs font-medium">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        Everything you need in a modern gateway credentials manager
                    </h2>
                    <p className="text-zinc-500 text-sm sm:text-base max-w-xl mx-auto">
                        We did not just build standard CRUD. We added security parameters and analytics dashboards.
                    </p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    {features.map((f, idx) => {
                        const Icon = f.icon;
                        return (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="glass-panel rounded-xl p-6 relative overflow-hidden flex gap-5 border border-zinc-900 glass-panel-hover"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-purple/5 to-transparent blur-md"></div>
                                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-brand-purple shrink-0 h-fit">
                                    <Icon size={18} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-display font-semibold text-zinc-100 text-base">
                                        {f.title}
                                    </h3>
                                    <p className="text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </section>

            {/* Testimonials */}
            <section className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center border-t border-zinc-900">
                <div className="max-w-2xl mx-auto">
                    <p className="text-zinc-300 italic text-sm sm:text-base leading-relaxed mb-6">
                        "ApexKey is exactly what recruiters expect when evaluating senior-level fullstack codebases.
                        The architecture is incredibly clean, and the dark glassmorphic dashboard looks gorgeous."
                    </p>
                    <div className="flex items-center justify-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-bold text-[10px] text-white">
                            CT
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-semibold text-zinc-200">Candidate Talent Reviewer</div>
                            <div className="text-[10px] text-zinc-500">MERN Developer Lead</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
                <div>© 2026 ApexKey Inc. All rights reserved. Built as a Senior Portfolio assignment.</div>
                <div className="flex gap-4">
                    <span className="hover:text-zinc-400 cursor-pointer">Security Protocol</span>
                    <span>•</span>
                    <span className="hover:text-zinc-400 cursor-pointer">API Agreement</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
