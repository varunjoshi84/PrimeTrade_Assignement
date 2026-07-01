import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { User, Sun, Moon, Keyboard, Save, Upload, Sparkles } from 'lucide-react';

const Settings = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [saving, setSaving] = useState(false);

    // Convert file to Base64
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result);
            toast.success('Avatar uploaded successfully (Base64 ready)');
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        setSaving(true);
        const result = await updateProfile(name, avatar);
        setSaving(false);
    };

    const shortcuts = [
        { keys: ['⌘', 'K'], desc: 'Open Global Search overlay' },
        { keys: ['Esc'], desc: 'Dismiss overlays and dialogs' },
        { keys: ['Tab'], desc: 'Traverse fields and controls' },
    ];

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="font-display font-bold text-2xl tracking-tight">Settings</h1>
                <p className="text-xs text-zinc-500">
                    Manage your account details and dashboard preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Navigation anchors */}
                <div className="space-y-1.5 md:col-span-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Sections</span>
                    <nav className="space-y-1 text-xs">
                        <a href="#profile" className="block px-3 py-2 rounded-lg bg-zinc-900/50 text-white font-medium">Profile Configuration</a>
                        <a href="#appearance" className="block px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200">Appearance Mode</a>
                        <a href="#shortcuts" className="block px-3 py-2 rounded-lg text-zinc-400 hover:text-zinc-200">Keyboard Shortcuts</a>
                    </nav>
                </div>

                {/* Profile settings Form */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile section */}
                    <div id="profile" className="glass-panel border border-zinc-900 rounded-xl p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-200 font-display">Profile Details</h3>
                            <p className="text-[10px] text-zinc-500">Change your display name and upload profile pictures</p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs text-left">
                            <div className="flex items-center gap-5">
                                {/* Avatar display and upload */}
                                <div className="relative group shrink-0">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt="avatar"
                                            className="w-16 h-16 rounded-full object-cover border border-zinc-800"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-brand-purple font-semibold text-lg border border-zinc-850">
                                            {user?.name?.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer border border-zinc-800">
                                        <Upload size={14} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-zinc-300">Avatar Image</h4>
                                    <p className="text-[10px] text-zinc-500">Supports PNG, JPG, or GIF. Max size 2MB.</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-zinc-400 font-semibold flex items-center gap-1.5">
                                    <User size={12} />
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-zinc-400 font-semibold">Email Address (Immutable)</label>
                                <input
                                    type="email"
                                    value={user?.email}
                                    disabled
                                    className="w-full bg-zinc-900/50 border border-zinc-900 rounded-lg px-3 py-2 text-zinc-500 cursor-not-allowed outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-lg text-xs font-semibold hover:opacity-95 shadow-md shadow-brand-purple/10 active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Save size={12} />
                                {saving ? 'Saving changes...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Appearance theme selector */}
                    <div id="appearance" className="glass-panel border border-zinc-900 rounded-xl p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-200 font-display">Appearance Mode</h3>
                            <p className="text-[10px] text-zinc-500">Toggle dark and light client layouts</p>
                        </div>
                        <div className="flex items-center justify-between bg-zinc-950 p-4 border border-zinc-900 rounded-lg">
                            <span className="text-xs text-zinc-300 font-medium flex items-center gap-2">
                                {theme === 'dark' ? <Moon size={14} className="text-brand-purple" /> : <Sun size={14} className="text-yellow-400" />}
                                Active Theme: <span className="capitalize font-semibold text-white">{theme}</span>
                            </span>
                            <button
                                onClick={toggleTheme}
                                className="px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                            >
                                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                            </button>
                        </div>
                    </div>

                    {/* Keyboard shortcuts visually cheatsheet */}
                    <div id="shortcuts" className="glass-panel border border-zinc-900 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-zinc-200">
                            <Keyboard size={16} className="text-brand-blue" />
                            <h3 className="text-sm font-bold font-display">Global Dashboard Keyboard Shortcuts</h3>
                        </div>
                        <div className="space-y-3">
                            {shortcuts.map((s, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-zinc-900 last:border-b-0">
                                    <span className="text-zinc-400 font-medium">{s.desc}</span>
                                    <div className="flex gap-1.5 shrink-0">
                                        {s.keys.map((k) => (
                                            <kbd key={k} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 font-bold">
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
