import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RefreshCw, FileText, Activity, User, Clock, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AdminActivityLogs() {
    const { token, logout } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            if (!activeToken) return;

            const response = await axios.get('http://localhost:8000/api/admin/logs/', {
                headers: { Authorization: `Token ${activeToken}` }
            });
            setLogs(response.data);
        } catch (error) {
            console.error("Fetch Logs Error", error);
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.admin.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(logs.map(log => log.category))];

    const getCategoryColor = (cat) => {
        switch(cat) {
            case 'Product': return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'Order': return 'bg-green-50 text-green-600 border border-green-100';
            case 'User': return 'bg-purple-50 text-purple-600 border border-purple-100';
            case 'Auth': return 'bg-orange-50 text-orange-600 border border-orange-100';
            default: return 'bg-gray-50 text-gray-600 border border-gray-100';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
             {/* 🌟 Header & Toolbar */}
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 items-end xl:items-center">
                
                {/* Search */}
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-400 mb-2 block ml-1 uppercase tracking-wide">Search Activity</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" size={20}/>
                        <input 
                            type="text" 
                            placeholder="Search by action or admin name..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 transition-all font-medium text-sm" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                {/* Filter */}
                <div className="w-full xl:w-64">
                    <label className="text-xs font-bold text-gray-400 mb-2 block ml-1 uppercase tracking-wide">Category</label>
                    <div className="relative">
                        <select 
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 appearance-none cursor-pointer font-bold text-sm text-gray-700" 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18}/>
                    </div>
                </div>

                {/* Refresh */}
                <button onClick={fetchLogs} className="w-full xl:w-auto h-[48px] px-6 bg-[#1a4d2e] text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-[#143d24] transition-all active:scale-95 shadow-lg shadow-green-900/20">
                    <RefreshCw size={20}/>
                    <span className="font-bold text-sm">Refresh</span>
                </button>
            </div>

            {/* 📋 Logs Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-xl text-gray-800">Activity Logs</h3>
                        <p className="text-xs text-gray-400 font-bold">{filteredLogs.length} Records found</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8F9FA] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-5 pl-8 w-24">#ID</th>
                                <th className="p-5 flex items-center gap-2"><Clock size={14}/> Date & Time</th>
                                <th className="p-5"><div className="flex items-center gap-2"><User size={14}/> Admin</div></th>
                                <th className="p-5"><div className="flex items-center gap-2"><Tag size={14}/> Category</div></th>
                                <th className="p-5"><div className="flex items-center gap-2"><FileText size={14}/> Details</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Loading Logs...</span>
                                    </div>
                                </td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold">No activity logs found.</p>
                                </td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-5 pl-8 text-gray-300 font-mono text-xs">#{log.id}</td>
                                        <td className="p-5 text-gray-600 font-medium text-sm whitespace-nowrap">{log.date}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1a4d2e] flex items-center justify-center text-xs font-black border border-emerald-100">
                                                    {log.admin.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-700 text-sm">{log.admin}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${getCategoryColor(log.category)}`}>
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="p-5 text-gray-600 text-sm font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                                            {log.action}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminActivityLogs;
