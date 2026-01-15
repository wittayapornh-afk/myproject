import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RefreshCw, FileText, Activity, User, Clock, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function AdminActivityLogs() {
    const { token, logout } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [displaySearch, setDisplaySearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        fetchLogs();
    }, []);

    // Debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(displaySearch);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [displaySearch]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            if (!activeToken) return;

            const response = await axios.get(`${API_BASE_URL}/api/admin/logs/`, {
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

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.admin.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(logs.map(log => log.category))];

    const getCategoryBadge = (cat) => {
        let colorClass = "bg-gray-50 text-gray-600 border border-gray-100";
        if (cat === 'Product') colorClass = 'bg-blue-50 text-blue-600 border border-blue-100';
        if (cat === 'Order') colorClass = 'bg-green-50 text-green-600 border border-green-100';
        if (cat === 'User') colorClass = 'bg-purple-50 text-purple-600 border border-purple-100';
        if (cat === 'Auth') colorClass = 'bg-orange-50 text-orange-600 border border-orange-100';

        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${colorClass}`}>
                {cat}
            </span>
        );
    };

    const handleReset = () => {
        setDisplaySearch('');
        setCategoryFilter('All');
        fetchLogs();
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
             {/* 🌟 Header & Toolbar */}
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 items-end xl:items-center">
                
                {/* Search */}
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 mb-1 block ml-1 uppercase tracking-widest">ค้นหากิจกรรม</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" size={20}/>
                        <input 
                            type="text" 
                            placeholder="ค้นหา: การกระทำ หรือ ชื่อแอดมิน..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-sm text-gray-700" 
                            value={displaySearch} 
                            onChange={(e) => setDisplaySearch(e.target.value)} 
                        />
                    </div>
                </div>

                {/* Filter */}
                <div className="w-full xl:w-64">
                    <label className="text-[10px] font-black text-gray-400 mb-1 block ml-1 uppercase tracking-widest">หมวดหมู่</label>
                    <div className="relative">
                        <select 
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 appearance-none cursor-pointer font-bold text-xs text-gray-700" 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">ทั้งหมด</option>
                            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16}/>
                    </div>
                </div>

                {/* Refresh */}
                <button onClick={fetchLogs} className="w-full xl:w-auto h-[46px] px-6 bg-[#1a4d2e] text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-[#143d24] transition-all active:scale-95 shadow-lg shadow-green-900/20 mt-auto">
                    <RefreshCw size={18}/>
                    <span className="font-bold text-xs">รีเฟรช</span>
                </button>
            </div>

            {/* 📋 Logs Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-gray-800">บันทึกกิจกรรม (Activity Logs)</h3>
                        <p className="text-xs text-gray-400 font-bold tracking-wide">พบข้อมูลทั้งหมด {filteredLogs.length} รายการ</p>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8fafc] text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-5 pl-8 w-24">#ID</th>
                                <th className="p-5 flex items-center gap-2 w-40"><Clock size={14}/> วัน-เวลา</th>
                                <th className="p-5 overflow-hidden text-ellipsis whitespace-nowrap min-w-[150px]"><div className="flex items-center gap-2"><User size={14}/> ผู้ดูแลระบบ</div></th>
                                <th className="p-5 w-32"><div className="flex items-center gap-2"><Tag size={14}/> หมวดหมู่</div></th>
                                <th className="p-5"><div className="flex items-center gap-2"><FileText size={14}/> รายละเอียด</div></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-[#1a4d2e] border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">กำลังโหลดข้อมูล...</span>
                                    </div>
                                </td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold">ไม่พบประวัติกิจกรรม</p>
                                </td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-[#fcfdfc] transition-colors group">
                                        <td className="p-5 pl-8 text-gray-400 font-mono text-xs font-bold">#{log.id}</td>
                                        <td className="p-5 text-gray-600 font-bold text-xs whitespace-nowrap">

                                            {(log.date || '').split(' ')[0]} <span className="text-gray-400 font-medium ml-1">{(log.date || '').split(' ')[1]}</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1a4d2e] flex items-center justify-center text-xs font-black border border-emerald-100">
                                                    {log.admin.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-700 text-sm">{log.admin}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {getCategoryBadge(log.category)}
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
