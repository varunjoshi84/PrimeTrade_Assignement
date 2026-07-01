import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Trash2, Key, History, Mail, UserCheck } from 'lucide-react';

const AdminConsole = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const fetchUsersList = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/users/admin/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching admin users:', error);
            toast.error('Failed to load user directories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, []);

    // Change role (Admin / User)
    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await axiosInstance.put(`/users/admin/users/${userId}/role`, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            fetchUsersList();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user role');
        }
    };

    // Delete user
    const handleDeleteUser = async (userId) => {
        try {
            await axiosInstance.delete(`/users/admin/users/${userId}`);
            toast.success('User and associated credentials deleted');
            setConfirmDeleteId(null);
            fetchUsersList();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-6 w-36 bg-zinc-900 rounded animate-pulse"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-zinc-950 border border-zinc-900 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Calculate aggregate totals
    const totalUsers = users.length;
    const totalGlobalKeys = users.reduce((sum, u) => sum + (u.keyCount || 0), 0);
    const totalGlobalRequests = users.reduce((sum, u) => sum + (u.logCount || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="font-display font-bold text-2xl tracking-tight">Admin Console</h1>
                <p className="text-xs text-zinc-500">
                    Oversee application system users, api credential keys, and aggregates.
                </p>
            </div>

            {/* Aggregates Dashboard Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel border border-zinc-900 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-550 tracking-wider">Registered Developers</span>
                        <div className="font-display font-bold text-2xl mt-1.5">{totalUsers} users</div>
                    </div>
                    <Users className="text-brand-purple" size={16} />
                </div>
                <div className="glass-panel border border-zinc-900 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-555 tracking-wider">Active API Keys</span>
                        <div className="font-display font-bold text-2xl mt-1.5">{totalGlobalKeys} keys</div>
                    </div>
                    <Key className="text-brand-blue" size={16} />
                </div>
                <div className="glass-panel border border-zinc-900 rounded-xl p-5 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase font-semibold text-zinc-555 tracking-wider">Total Request Activity</span>
                        <div className="font-display font-bold text-2xl mt-1.5">{totalGlobalRequests} logs</div>
                    </div>
                    <History className="text-green-400" size={16} />
                </div>
            </div>

            {/* Users lists table */}
            <div className="glass-panel border border-zinc-900 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-900 text-[10px] uppercase text-zinc-500 tracking-wider bg-zinc-950/40">
                                <th className="p-4">User</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Created Keys</th>
                                <th className="p-4">Aggregate Logs</th>
                                <th className="p-4">Registration</th>
                                <th className="p-4">System Role</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-b border-zinc-900/40 text-zinc-300 hover:bg-zinc-900/10 transition">
                                    <td className="p-4 font-semibold text-zinc-200">
                                        <div className="flex items-center gap-2.5">
                                            {u.avatar ? (
                                                <img
                                                    src={u.avatar}
                                                    alt="avatar"
                                                    className="w-7 h-7 rounded-full object-cover border border-zinc-800"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-brand-purple font-semibold text-[10px] border border-zinc-850">
                                                    {u.name?.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <span>{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-zinc-400 font-mono text-[10px]">
                                        <div className="flex items-center gap-1.5">
                                            <Mail size={10} className="text-zinc-650" />
                                            <span>{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-zinc-300">{u.keyCount} keys</td>
                                    <td className="p-4 font-semibold text-brand-purple">{u.logCount} hits</td>
                                    <td className="p-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                            u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2.5">
                                        <button
                                            onClick={() => handleRoleChange(u._id, u.role)}
                                            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 transition"
                                            title="Toggle Admin/User Role"
                                        >
                                            <UserCheck size={12} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(u._id)}
                                            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-red-400 border border-zinc-800 transition"
                                            title="Delete Account"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm delete user dialog */}
            {confirmDeleteId && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"></div>
                    <dialog open className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm glass-panel rounded-xl shadow-2xl p-6 border border-zinc-850 z-50 text-zinc-200">
                        <div className="space-y-3.5 text-center">
                            <h3 className="font-display font-semibold text-sm">Delete Developer Account?</h3>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">
                                This will permanently purge this user's developer profiles, settings, credentials, and logs databases. This is completely irreversible.
                            </p>
                            <div className="flex gap-3 justify-center pt-2">
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-4 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(confirmDeleteId)}
                                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    </dialog>
                </>
            )}
        </div>
    );
};

export default AdminConsole;
