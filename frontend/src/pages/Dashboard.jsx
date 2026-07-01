import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import toast from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import {
    Activity,
    Key,
    Clock,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const response = await axiosInstance.get('/analytics/overview');
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load real-time analytics data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="h-6 w-32 bg-zinc-900 rounded animate-pulse"></div>
                        <div className="h-3 w-48 bg-zinc-900 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Skeletons Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-zinc-950 border border-zinc-900 rounded-xl animate-pulse"></div>
                    ))}
                </div>

                {/* Skeleton Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-80 bg-zinc-950 border border-zinc-900 rounded-xl animate-pulse"></div>
                    <div className="h-80 bg-zinc-950 border border-zinc-900 rounded-xl animate-pulse"></div>
                </div>
            </div>
        );
    }

    const {
        totalRequests,
        statusDistribution,
        averageLatency,
        requestsOverTime,
        topKeys,
        topEndpoints,
        recentLogs,
    } = analytics || {
        totalRequests: 0,
        statusDistribution: { success: 0, clientError: 0, serverError: 0 },
        averageLatency: 0,
        requestsOverTime: [],
        topKeys: [],
        topEndpoints: [],
        recentLogs: [],
    };

    // Calculate total error percentage
    const errorCount = statusDistribution.clientError + statusDistribution.serverError;
    const errorRate = totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(2) : '0.00';
    const successRate = totalRequests > 0 ? (((totalRequests - errorCount) / totalRequests) * 100).toFixed(2) : '100.00';

    const statCards = [
        {
            title: 'Total Gateway API Requests',
            value: totalRequests.toLocaleString(),
            desc: 'Aggregate analytics workload logs',
            icon: Activity,
            color: 'text-brand-purple',
        },
        {
            title: 'API Server Latency',
            value: `${averageLatency} ms`,
            desc: 'Average request lifecycle delay',
            icon: Clock,
            color: 'text-brand-blue',
        },
        {
            title: 'Gateway Success Rate',
            value: `${successRate}%`,
            desc: 'Percent of successful 2xx responses',
            icon: TrendingUp,
            color: 'text-green-400',
        },
        {
            title: 'API Error Rate',
            value: `${errorRate}%`,
            desc: 'Percent of failing 4xx & 5xx logs',
            icon: AlertTriangle,
            color: errorRate > 5 ? 'text-red-400' : 'text-zinc-500',
        },
    ];

    // Status codes donut mock mapping
    const distributionData = [
        { name: 'Success (2xx)', value: statusDistribution.success, color: '#10b981' },
        { name: 'Client Errors (4xx)', value: statusDistribution.clientError, color: '#3b82f6' },
        { name: 'Server Errors (5xx)', value: statusDistribution.serverError, color: '#ef4444' },
    ];

    return (
        <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-display font-bold text-2xl tracking-tight">Overview</h1>
                    <p className="text-xs text-zinc-500">
                        Real-time analytics and server workload overview.
                    </p>
                </div>
                <button
                    onClick={() => fetchDashboardData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                >
                    <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((c, idx) => {
                    const Icon = c.icon;
                    return (
                        <div
                            key={idx}
                            className="glass-panel border border-zinc-900 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
                                    {c.title}
                                </span>
                                <Icon size={14} className={c.color} />
                            </div>
                            <div className="mt-4 mb-1">
                                <span className="font-display font-bold text-2xl sm:text-3xl tracking-tight">
                                    {c.value}
                                </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-medium">{c.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Requests Over Time Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latency / Volume Area Chart */}
                <div className="lg:col-span-2 glass-panel border border-zinc-900 rounded-xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-zinc-200 font-display">Traffic Analytics</h3>
                            <p className="text-[10px] text-zinc-500">API request volume in the last 7 days</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {requestsOverTime.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={requestsOverTime} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#52525b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#52525b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            borderColor: '#27272a',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            color: '#f3f4f6',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="requests"
                                        stroke="#a855f7"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#purpleGlow)"
                                        name="Requests"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-zinc-600">
                                No records found.
                            </div>
                        )}
                    </div>
                </div>

                {/* HTTP Status Code Distribution */}
                <div className="glass-panel border border-zinc-900 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-200 font-display">Response Status Codes</h3>
                        <p className="text-[10px] text-zinc-500">Distribution of responses by categories</p>
                    </div>
                    <div className="h-44 w-full mt-4 flex items-center justify-center">
                        {totalRequests > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distributionData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            borderColor: '#27272a',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                        }}
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-xs text-zinc-600">No data logged yet</div>
                        )}
                    </div>
                    <div className="space-y-1.5 mt-4 pt-4 border-t border-zinc-900/60">
                        {distributionData.map((d, i) => (
                            <div key={i} className="flex justify-between items-center text-[10px] text-zinc-400">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                                    {d.name}
                                </span>
                                <span className="font-semibold text-zinc-200">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom: Top Keys & Recent Activity logs table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Keys lists */}
                <div className="glass-panel border border-zinc-900 rounded-xl p-5 flex flex-col">
                    <h3 className="text-sm font-bold text-zinc-200 font-display mb-4">Top API Keys</h3>
                    <div className="flex-1 space-y-4">
                        {topKeys.length > 0 ? (
                            topKeys.map((key, i) => (
                                <div key={i} className="flex items-center justify-between border-b border-zinc-900/40 pb-3 last:border-b-0 last:pb-0">
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold text-zinc-200 truncate">{key.name}</div>
                                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">...{key.keyLast4}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-bold text-brand-purple">{key.count} calls</div>
                                        <div className="text-[9px] text-zinc-500">Usage workload</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-zinc-600">
                                No keys found or used yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Logs Table */}
                <div className="lg:col-span-2 glass-panel border border-zinc-900 rounded-xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-zinc-200 font-display">Recent API Gateway Activity</h3>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 font-mono">Live Logs</span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-900 text-[10px] uppercase text-zinc-500 tracking-wider">
                                    <th className="py-2.5">Key</th>
                                    <th className="py-2.5">Method</th>
                                    <th className="py-2.5">Endpoint</th>
                                    <th className="py-2.5">Status</th>
                                    <th className="py-2.5 text-right">Latency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLogs.length > 0 ? (
                                    recentLogs.map((log) => (
                                        <tr key={log._id} className="border-b border-zinc-900/40 text-zinc-300 hover:bg-zinc-900/10 transition">
                                            <td className="py-3 font-semibold text-zinc-400">
                                                {log.keyId?.name || 'Deleted Key'} <span className="font-mono text-[9px] text-zinc-600">...{log.keyId?.keyLast4}</span>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                                    log.method === 'GET' ? 'bg-blue-950/40 text-blue-400' :
                                                    log.method === 'POST' ? 'bg-green-950/40 text-green-400' : 'bg-zinc-900 text-zinc-400'
                                                }`}>
                                                    {log.method}
                                                </span>
                                            </td>
                                            <td className="py-3 font-mono text-[10px] text-zinc-400">{log.endpoint}</td>
                                            <td className="py-3">
                                                <span className={`font-semibold ${
                                                    log.statusCode < 300 ? 'text-green-400' :
                                                    log.statusCode < 500 ? 'text-blue-400' : 'text-red-400'
                                                }`}>
                                                    {log.statusCode}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-zinc-500 font-mono">{log.duration}ms</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-xs text-zinc-600">
                                            No logs matching. Start hitting endpoints with your keys!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
