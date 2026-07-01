import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
    Key,
    LayoutDashboard,
    History,
    Settings,
    Shield,
    LogOut,
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    User,
    Sun,
    Moon,
} from 'lucide-react';

const DashboardLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'API Keys', path: '/keys', icon: Key },
        { name: 'Usage Logs', path: '/logs', icon: History },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    // Add admin menu item if role is admin
    if (user?.role === 'admin') {
        menuItems.push({ name: 'Admin Console', path: '/admin', icon: Shield });
    }

    const currentPathName = menuItems.find((item) => item.path === location.pathname)?.name || 'Dashboard';

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchOpen(false);
        navigate(`/keys?search=${encodeURIComponent(searchQuery)}`);
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0"></div>
            
            {/* Glowing Gradient Spotlights */}
            <div className="absolute top-[-10%] left-[5%] w-[400px] h-[400px] rounded-full bg-brand-glow blur-[100px] animate-pulse-glow z-0 pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[5%] w-[350px] h-[350px] rounded-full bg-brand-glow blur-[90px] animate-pulse-glow z-0 pointer-events-none"></div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-900 transition-transform duration-300 ease-in-out md:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-900">
                    <Link to="/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center font-display font-extrabold text-white text-base shadow-lg shadow-brand-purple/20">
                            A
                        </div>
                        <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                            ApexKey
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="md:hidden text-zinc-400 hover:text-zinc-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-zinc-900 text-white border-l-2 border-brand-purple'
                                        : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                                }`}
                            >
                                <Icon size={16} className={isActive ? 'text-brand-purple' : ''} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-900">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/30">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="avatar"
                                className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-brand-purple font-semibold text-sm">
                                {user?.name?.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{user?.name}</p>
                            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            user?.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="flex-1 md:pl-64 flex flex-col min-w-0 z-10 relative">
                {/* Top Navbar */}
                <header className="h-16 border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden text-zinc-400 hover:text-zinc-100"
                        >
                            <Menu size={20} />
                        </button>
                        
                        {/* Breadcrumbs */}
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                            <span className="hover:text-zinc-300 cursor-pointer">ApexKey</span>
                            <span>/</span>
                            <span className="text-zinc-300">{currentPathName}</span>
                        </div>
                    </div>

                    {/* Navbar actions */}
                    <div className="flex items-center gap-4">
                        {/* Global Search Button */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 text-xs transition border border-zinc-800"
                        >
                            <Search size={14} />
                            <span className="hidden md:inline">Search keys...</span>
                            <kbd className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-zinc-850 text-[10px] border border-zinc-700">
                                ⌘K
                            </kbd>
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-zinc-400 hover:text-zinc-100 transition rounded-lg hover:bg-zinc-900"
                        >
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        {/* Notification Bell */}
                        <button className="p-2 text-zinc-400 hover:text-zinc-100 transition rounded-lg hover:bg-zinc-900 relative">
                            <Bell size={16} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-purple animate-pulse"></span>
                        </button>

                        <div className="h-6 w-px bg-zinc-800"></div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center gap-1.5 hover:opacity-95 transition"
                            >
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="avatar"
                                        className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                                    />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-zinc-850 flex items-center justify-center text-brand-purple font-semibold text-xs border border-zinc-800">
                                        {user?.name?.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <ChevronDown size={14} className="text-zinc-500" />
                            </button>

                            {profileMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileMenuOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2.5 w-48 rounded-lg bg-zinc-950 border border-zinc-900 p-1.5 dropdown-glow z-50 text-sm">
                                        <div className="px-3 py-2 border-b border-zinc-900 text-xs text-zinc-400 mb-1">
                                            Signed in as <span className="font-semibold text-zinc-200">{user?.email}</span>
                                        </div>
                                        <Link
                                            to="/settings"
                                            onClick={() => setProfileMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-zinc-300 hover:bg-zinc-900 hover:text-white transition"
                                        >
                                            <User size={14} />
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setProfileMenuOpen(false);
                                                logout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-red-400 hover:bg-red-950/20 hover:text-red-300 transition"
                                        >
                                            <LogOut size={14} />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dashboard Screen Content */}
                <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto relative z-10">
                    <Outlet />
                </main>
            </div>

            {/* Global Search Dialog */}
            {searchOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                        onClick={() => setSearchOpen(false)}
                    ></div>
                    <dialog
                        open
                        closedby="any"
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass-panel rounded-xl shadow-2xl p-0 border border-zinc-800 z-50 overflow-hidden flex flex-col"
                    >
                        <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-zinc-850 px-4">
                            <Search className="text-zinc-500 mr-3" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search API key by name..."
                                className="w-full bg-transparent border-0 outline-none text-zinc-200 placeholder-zinc-500 py-4 text-sm focus:ring-0"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setSearchOpen(false)}
                                className="text-xs text-zinc-500 border border-zinc-800 hover:bg-zinc-900 rounded px-1.5 py-0.5 uppercase"
                            >
                                Esc
                            </button>
                        </form>
                        <div className="p-3 text-[10px] text-zinc-500 bg-zinc-950/30 flex items-center justify-between">
                            <span>Type and press ENTER to search</span>
                            <span>ApexKey Global Search</span>
                        </div>
                    </dialog>
                </>
            )}
        </div>
    );
};

export default DashboardLayout;
