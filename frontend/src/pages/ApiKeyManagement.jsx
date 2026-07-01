import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key,
    Plus,
    Search,
    Grid,
    List,
    Copy,
    Check,
    Trash2,
    Calendar,
    RotateCw,
    Ban,
    X,
    ChevronLeft,
    ChevronRight,
    Settings,
} from 'lucide-react';

const keyFormSchema = z.object({
    name: z.string().min(1, 'Key name is required').max(50),
    permissions: z.array(z.enum(['read', 'write', 'delete'])).min(1, 'Select at least one permission'),
    rateLimit: z.preprocess((val) => Number(val), z.number().int().min(1, 'Rate limit must be at least 1 req/m')),
    expiresAt: z.string().optional(),
});

const ApiKeyManagement = () => {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    
    // Filters & Pagination State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Dialog Modals State
    const [createOpen, setCreateOpen] = useState(false);
    const [createdKeyData, setCreatedKeyData] = useState(null); // stores { apiKey, rawKey }
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmRevokeId, setConfirmRevokeId] = useState(null);
    const [copied, setCopied] = useState(false);

    // refs for native dialog elements
    const createDialogRef = useRef(null);
    const successDialogRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(keyFormSchema),
        defaultValues: { name: '', permissions: ['read'], rateLimit: 60, expiresAt: '' },
    });

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 6,
                search: searchQuery,
                status: statusFilter,
                sort: sortFilter,
            };
            const response = await axiosInstance.get('/keys', { params });
            setKeys(response.data.data.keys);
            setTotalPages(response.data.data.totalPages);
            setTotalItems(response.data.data.totalItems);
        } catch (error) {
            console.error('Error fetching keys:', error);
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, [page, statusFilter, sortFilter]);

    // Handle search input trigger
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchKeys();
    };

    // Dialog opening utility
    const openCreateDialog = () => {
        setCreateOpen(true);
        setTimeout(() => createDialogRef.current?.showModal(), 10);
    };

    const closeCreateDialog = () => {
        createDialogRef.current?.close();
        setCreateOpen(false);
        reset();
    };

    // Create Key submission
    const onCreateKeySubmit = async (data) => {
        try {
            const response = await axiosInstance.post('/keys', {
                name: data.name,
                permissions: data.permissions,
                rateLimit: data.rateLimit,
                expiresAt: data.expiresAt || null,
            });
            
            // Close create dialog
            closeCreateDialog();

            // Set raw details and show success
            setCreatedKeyData(response.data.data);
            setTimeout(() => successDialogRef.current?.showModal(), 50);
            
            // Refresh
            setPage(1);
            fetchKeys();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create API key');
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('API Key copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Revoke key operation
    const handleRevokeKey = async (id) => {
        try {
            await axiosInstance.put(`/keys/${id}`, { status: 'revoked' });
            toast.success('API Key has been revoked');
            setConfirmRevokeId(null);
            fetchKeys();
        } catch (error) {
            toast.error('Failed to revoke API key');
        }
    };

    // Regenerate key operation
    const handleRegenerateKey = async (id) => {
        try {
            const response = await axiosInstance.post(`/keys/${id}/regenerate`);
            toast.success('API Key successfully regenerated');
            
            // Show new key details once
            setCreatedKeyData(response.data.data);
            setTimeout(() => successDialogRef.current?.showModal(), 50);
            
            fetchKeys();
        } catch (error) {
            toast.error('Failed to regenerate API key');
        }
    };

    // Delete key operation
    const handleDeleteKey = async (id) => {
        try {
            await axiosInstance.delete(`/keys/${id}`);
            toast.success('API Key deleted successfully');
            setConfirmDeleteId(null);
            fetchKeys();
        } catch (error) {
            toast.error('Failed to delete API key');
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-display font-bold text-2xl tracking-tight">API Keys</h1>
                    <p className="text-xs text-zinc-500">
                        Create and manage credentials to authenticate API gateway endpoints.
                    </p>
                </div>
                <button
                    onClick={openCreateDialog}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-lg text-xs font-semibold hover:opacity-95 shadow-md shadow-brand-purple/10 cursor-pointer"
                >
                    <Plus size={14} />
                    Create New Key
                </button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative w-full md:w-80 flex items-center">
                    <Search className="absolute left-3 text-zinc-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search key by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 focus:border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-zinc-800 transition"
                    />
                </form>

                {/* Filters */}
                <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 rounded-lg px-3 py-1.5 outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                        <option value="expired">Expired</option>
                    </select>

                    <select
                        value={sortFilter}
                        onChange={(e) => {
                            setSortFilter(e.target.value);
                            setPage(1);
                        }}
                        className="bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 rounded-lg px-3 py-1.5 outline-none"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="usage">Highest Usage</option>
                        <option value="name">Alphabetical</option>
                    </select>

                    {/* View Modes */}
                    <div className="flex items-center border border-zinc-900 rounded-lg p-0.5 bg-zinc-950">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition ${
                                viewMode === 'list' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <List size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition ${
                                viewMode === 'grid' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <Grid size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Keys Area */}
            {loading ? (
                /* Skeleton loader */
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-4'}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-32 bg-zinc-950/60 border border-zinc-900 rounded-xl animate-pulse"
                        ></div>
                    ))}
                </div>
            ) : keys.length === 0 ? (
                /* Beautiful empty state */
                <div className="glass-panel border border-zinc-900 rounded-xl p-16 text-center space-y-4 max-w-xl mx-auto mt-6">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 mx-auto">
                        <Key size={20} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-display font-semibold text-zinc-200">No API Keys found</h3>
                        <p className="text-zinc-500 text-xs max-w-xs mx-auto leading-relaxed">
                            {searchQuery || statusFilter
                                ? 'No credentials match your filters. Try clearing search fields or queries.'
                                : 'Get started by generating your first hashed credential token to access endpoints.'}
                        </p>
                    </div>
                    {!searchQuery && !statusFilter && (
                        <button
                            onClick={openCreateDialog}
                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold rounded-lg transition mt-2 text-zinc-300"
                        >
                            Issue API Key
                        </button>
                    )}
                </div>
            ) : (
                /* Render keys in list or grid view with framer-motion */
                <motion.div
                    layout
                    className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'space-y-3.5'}
                >
                    <AnimatePresence mode="popLayout">
                        {keys.map((key) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={key._id}
                                className={`glass-panel border border-zinc-900 rounded-xl p-5 flex ${
                                    viewMode === 'grid' ? 'flex-col justify-between gap-4 h-56' : 'items-center justify-between gap-6'
                                } glass-panel-hover relative overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-purple/5 to-transparent"></div>

                                {/* Key details */}
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-zinc-200 truncate">{key.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                            key.status === 'active' ? 'bg-green-950/40 text-green-400 border border-green-900/60' :
                                            key.status === 'revoked' ? 'bg-red-950/30 text-red-400 border border-red-950/40' :
                                            'bg-zinc-900 text-zinc-400 border border-zinc-800'
                                        }`}>
                                            {key.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
                                        <span>Last 4:</span>
                                        <span className="bg-zinc-900/60 px-1.5 py-0.5 rounded border border-zinc-850 text-zinc-300">
                                            {key.keyLast4}
                                        </span>
                                    </div>
                                    {/* Permissions Chips */}
                                    <div className="flex flex-wrap gap-1">
                                        {key.permissions.map((perm) => (
                                            <span key={perm} className="px-1.5 py-0.5 rounded bg-zinc-900 text-[8px] font-semibold text-zinc-400">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Limits & Usage details */}
                                <div className={`flex flex-col text-xs space-y-1.5 ${viewMode === 'grid' ? '' : 'sm:text-right shrink-0'}`}>
                                    <div className="text-[10px] text-zinc-500">
                                        Usage: <span className="font-semibold text-zinc-300">{key.usageCount} calls</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500">
                                        Rate Limit: <span className="font-semibold text-zinc-300">{key.rateLimit} req/m</span>
                                    </div>
                                    <div className="text-[9px] text-zinc-500 flex items-center gap-1.5 sm:justify-end">
                                        <Calendar size={10} />
                                        <span>
                                            {key.expiresAt
                                                ? `Expires: ${new Date(key.expiresAt).toLocaleDateString()}`
                                                : 'No Expiry'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'pt-3 border-t border-zinc-900/50 justify-end' : ''}`}>
                                    {key.status === 'active' && (
                                        <>
                                            <button
                                                onClick={() => setConfirmRevokeId(key._id)}
                                                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-yellow-400 transition tooltip"
                                                title="Revoke Key"
                                            >
                                                <Ban size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleRegenerateKey(key._id)}
                                                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-brand-blue transition"
                                                title="Regenerate Key"
                                            >
                                                <RotateCw size={12} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setConfirmDeleteId(key._id)}
                                        className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-red-400 transition"
                                        title="Delete Key"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-900 pt-4 text-xs text-zinc-500">
                    <span>
                        Showing page <span className="font-semibold text-zinc-300">{page}</span> of {totalPages} ({totalItems} keys)
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 transition"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="p-1.5 rounded border border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 transition"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Form Create Dialog */}
            {createOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                        onClick={closeCreateDialog}
                    ></div>
                    <dialog
                        ref={createDialogRef}
                        closedby="any"
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md glass-panel rounded-xl shadow-2xl p-6 border border-zinc-800 z-50 overflow-hidden flex flex-col gap-4 text-zinc-200"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-display font-bold text-base flex items-center gap-2">
                                <Key size={16} className="text-brand-purple" />
                                Create API Credentials
                            </h2>
                            <button onClick={closeCreateDialog} className="text-zinc-500 hover:text-zinc-350 transition">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onCreateKeySubmit)} className="space-y-4 text-left text-xs">
                            {/* Key Name */}
                            <div className="space-y-1.5">
                                <label className="text-zinc-400 font-semibold">Key Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Server Production Gateway"
                                    {...register('name')}
                                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-700 outline-none focus:border-brand-purple/55 transition"
                                />
                                {errors.name && <p className="text-[10px] text-red-400 mt-0.5">{errors.name.message}</p>}
                            </div>

                            {/* Permissions list */}
                            <div className="space-y-1.5">
                                <label className="text-zinc-400 font-semibold block">Permissions (Scopes)</label>
                                <div className="grid grid-cols-3 gap-2.5 mt-1 bg-zinc-950 p-2 border border-zinc-900 rounded-lg">
                                    {['read', 'write', 'delete'].map((p) => (
                                        <label key={p} className="flex items-center gap-2 cursor-pointer py-1">
                                            <input
                                                type="checkbox"
                                                value={p}
                                                {...register('permissions')}
                                                className="rounded border-zinc-900 bg-zinc-950 text-brand-purple focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />
                                            <span className="capitalize">{p}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.permissions && <p className="text-[10px] text-red-400 mt-0.5">{errors.permissions.message}</p>}
                            </div>

                            {/* Limits configuration */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-semibold">Rate Limit (req/min)</label>
                                    <input
                                        type="number"
                                        {...register('rateLimit')}
                                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-700 outline-none focus:border-brand-purple/55 transition"
                                    />
                                    {errors.rateLimit && <p className="text-[10px] text-red-400 mt-0.5">{errors.rateLimit.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-zinc-400 font-semibold">Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        {...register('expiresAt')}
                                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-zinc-500 placeholder-zinc-700 outline-none focus:border-brand-purple/55 transition"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-lg py-2.5 font-semibold text-xs mt-4 shadow-md shadow-brand-purple/10 active:scale-[0.99] transition cursor-pointer"
                            >
                                Generate API Key
                            </button>
                        </form>
                    </dialog>
                </>
            )}

            {/* Created Success / Display-Once Key Dialog */}
            <dialog
                ref={successDialogRef}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg glass-panel rounded-xl shadow-2xl p-6 border border-zinc-800 z-50 overflow-hidden flex flex-col gap-4 text-zinc-200"
            >
                <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-green-950/40 border border-green-800 flex items-center justify-center text-green-400 mx-auto animate-pulse">
                        <Check size={18} />
                    </div>
                    <h2 className="font-display font-bold text-base">API Key Generated Successfully</h2>
                    <p className="text-[10px] text-yellow-400 max-w-sm mx-auto bg-yellow-950/20 border border-yellow-900/50 p-2 rounded-lg leading-relaxed">
                        ⚠️ **SECURITY WARNING**: Copy this key now. It is hashed in the database and will **NEVER** be shown to you again for security compliance.
                    </p>
                </div>

                {/* Key box */}
                <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-lg flex items-center justify-between mt-2 gap-4">
                    <span className="font-mono text-xs text-zinc-200 break-all select-all font-semibold">
                        {createdKeyData?.rawKey}
                    </span>
                    <button
                        onClick={() => copyToClipboard(createdKeyData?.rawKey)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-md border border-zinc-800 transition shrink-0 cursor-pointer"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                </div>

                <div className="space-y-1.5 text-left text-xs bg-zinc-900/30 p-3 rounded-lg border border-zinc-900/60 mt-2">
                    <div className="text-[10px] text-zinc-500">Key Identifier Metadata:</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 mt-1">
                        <div>Name: <span className="font-semibold text-zinc-200">{createdKeyData?.apiKey?.name}</span></div>
                        <div>Last 4: <span className="font-semibold text-zinc-200 font-mono">...{createdKeyData?.apiKey?.keyLast4}</span></div>
                        <div>Rate Limit: <span className="font-semibold text-zinc-200">{createdKeyData?.apiKey?.rateLimit} req/m</span></div>
                        <div>Permissions: <span className="font-semibold text-zinc-200">{createdKeyData?.apiKey?.permissions?.join(', ')}</span></div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        successDialogRef.current?.close();
                        setCreatedKeyData(null);
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 py-2.5 rounded-lg text-xs font-semibold mt-4 transition cursor-pointer"
                >
                    I have saved this key securely
                </button>
            </dialog>

            {/* Confirm Revoke dialog modal */}
            {confirmRevokeId && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"></div>
                    <dialog open className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm glass-panel rounded-xl shadow-2xl p-6 border border-zinc-850 z-50 text-zinc-200">
                        <div className="space-y-3.5 text-center">
                            <h3 className="font-display font-semibold text-sm">Revoke API Key?</h3>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                Revoking this token immediately invalidates any client application requests using it. This action is irreversible.
                            </p>
                            <div className="flex gap-3 justify-center pt-2">
                                <button
                                    onClick={() => setConfirmRevokeId(null)}
                                    className="px-4 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRevokeKey(confirmRevokeId)}
                                    className="px-4 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-xs font-semibold text-white transition"
                                >
                                    Confirm Revoke
                                </button>
                            </div>
                        </div>
                    </dialog>
                </>
            )}

            {/* Confirm Delete dialog modal */}
            {confirmDeleteId && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"></div>
                    <dialog open className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm glass-panel rounded-xl shadow-2xl p-6 border border-zinc-850 z-50 text-zinc-200">
                        <div className="space-y-3.5 text-center">
                            <h3 className="font-display font-semibold text-sm">Delete API Key?</h3>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                This will permanently delete this key from the server databases and discard all metrics. You cannot restore this key.
                            </p>
                            <div className="flex gap-3 justify-center pt-2">
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-4 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteKey(confirmDeleteId)}
                                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition"
                                >
                                    Delete Key
                                </button>
                            </div>
                        </div>
                    </dialog>
                </>
            )}
        </div>
    );
};

export default ApiKeyManagement;
