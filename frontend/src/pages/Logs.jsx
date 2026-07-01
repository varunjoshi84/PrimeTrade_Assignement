import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';
import { Search, RefreshCw, History, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Pagination & Filters State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchLogs = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            // Fetch logs from overview, or let's create a dedicated logs endpoint.
            // Wait, `/analytics/overview` returns recent logs. Let's create a dedicated endpoint `/analytics/logs` on the backend, or we can just fetch and paginate.
            // Wait! In the analytics controller, we did not write a separate paginated logs route, but we can write one or just query `/analytics/logs` (wait, did we implement that? Let's check `analytics.routes.js`. It only has `/overview`. Oh! Let's check what we can do: we can fetch and filter on `/analytics/overview` or write a paginated logs controller on backend. Let's write a paginated logs controller and route on backend! This is a great addition).
            // Wait, let's look at what route we have in backend/src/routes/analytics.routes.js: it has `router.get('/overview', protect, getAnalyticsOverview);`.
            // Let's create another route in `backend/src/routes/analytics.routes.js` for paginated logs:
            // `router.get('/logs', protect, getApiLogs);`
            // Let's implement `getApiLogs` in `backend/src/controllers/analytics.controller.js` and add the route!
            
            const params = {
                page,
                limit: 10,
                search: searchQuery,
                status: statusFilter,
            };
            const response = await axiosInstance.get('/analytics/logs', { params });
            setLogs(response.data.data.logs);
            setTotalPages(response.data.data.totalPages);
            setTotalItems(response.data.data.totalItems);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to load API request logs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-display font-bold text-2xl tracking-tight">Usage Logs</h1>
                    <p className="text-xs text-zinc-500">
                        View real-time traffic requests and latency durations.
                    </p>
                </div>
                <button
                    onClick={() => fetchLogs(true)}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                >
                    <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                    Refresh logs
                </button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex items-center">
                    <Search className="absolute left-3 text-zinc-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search logs by endpoint..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 focus:border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-zinc-800 transition"
                    />
                </form>

                {/* Status select */}
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="bg-zinc-950 border border-zinc-900 text-xs text-zinc-400 rounded-lg px-3 py-1.5 outline-none w-full md:w-44"
                >
                    <option value="">All Responses</option>
                    <option value="2xx">Success (2xx)</option>
                    <option value="4xx">Client Errors (4xx)</option>
                    <option value="5xx">Server Errors (5xx)</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-3.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 bg-zinc-950 border border-zinc-900 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : logs.length === 0 ? (
                <div className="glass-panel border border-zinc-900 rounded-xl p-16 text-center space-y-4 max-w-xl mx-auto mt-6">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 mx-auto">
                        <History size={20} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-display font-semibold text-zinc-200">No request logs recorded</h3>
                        <p className="text-zinc-500 text-xs max-w-xs mx-auto leading-relaxed">
                            Start querying your endpoints with your newly created API keys to populate live logs charts.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="glass-panel border border-zinc-900 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-900 text-[10px] uppercase text-zinc-500 tracking-wider bg-zinc-950/40">
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4">Key Name / Identifier</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Endpoint</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Client IP</th>
                                    <th className="p-4 text-right">Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id} className="border-b border-zinc-900/40 text-zinc-300 hover:bg-zinc-900/10 transition">
                                        <td className="p-4 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={10} />
                                                <span>
                                                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-semibold text-zinc-400">
                                            {log.keyId?.name || 'Deleted Key'} <span className="font-mono text-[9px] text-zinc-600">...{log.keyId?.keyLast4}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                                log.method === 'GET' ? 'bg-blue-950/40 text-blue-400' :
                                                log.method === 'POST' ? 'bg-green-950/40 text-green-400' : 'bg-zinc-900 text-zinc-400'
                                            }`}>
                                                {log.method}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-[10px] text-zinc-400">{log.endpoint}</td>
                                        <td className="p-4">
                                            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                                                log.statusCode < 300 ? 'bg-green-950/40 text-green-400' :
                                                log.statusCode < 500 ? 'bg-blue-950/40 text-blue-400' : 'bg-red-950/40 text-red-400'
                                            }`}>
                                                {log.statusCode}
                                            </span>
                                        </td>
                                        <td className="p-4 text-zinc-500 font-mono">{log.ipAddress}</td>
                                        <td className="p-4 text-right text-brand-purple font-mono font-semibold">{log.duration}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-zinc-900 pt-4 text-xs text-zinc-500">
                    <span>
                        Showing page <span className="font-semibold text-zinc-300">{page}</span> of {totalPages} ({totalItems} logs)
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
        </div>
    );
};

export default Logs;
