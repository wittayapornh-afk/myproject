import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, Filter, RefreshCw, Activity, User, Clock, 
    Box, ShoppingBag, Truck, Edit, Trash2, Key, AlertCircle, CheckCircle, Smartphone,
    Ticket, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ACTION_ICONS = {
    'Login': <Key size={16} />,
    'Order': <ShoppingBag size={16} />,
    'Product': <Box size={16} />,
    'Stock': <Truck size={16} />,
    'Delete': <Trash2 size={16} />,
    'Edit': <Edit size={16} />,
    'Promo': <Ticket size={16} />,
    'Sale': <Zap size={16} />,
    'Error': <AlertCircle size={16} />,
    'System': <CheckCircle size={16} />
};

function AdminActivityLogs() {
    const { token, logout } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [displaySearch, setDisplaySearch] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    // Debounce Search
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
            // Enrich logs with icons and categories derived from text
            const enriched = response.data.map(log => {
                let type = 'System';
                if (log.action.toLowerCase().includes('login')) type = 'Login';
                else if (log.action.toLowerCase().includes('order')) type = 'Order';
                else if (log.action.toLowerCase().includes('product')) type = 'Product';
                else if (log.action.toLowerCase().includes('stock')) type = 'Stock';
                else if (log.action.toLowerCase().includes('coupon')) type = 'Promo';
                else if (log.action.toLowerCase().includes('flash sale') || log.action.toLowerCase().includes('campaign')) type = 'Sale';
                else if (log.action.toLowerCase().includes('delete')) type = 'Delete';
                else if (log.action.toLowerCase().includes('edit') || log.action.toLowerCase().includes('update')) type = 'Edit';
                
                return { ...log, type };
            });
            setLogs(enriched);
        } catch (error) {
            console.error("Fetch Logs Error", error);
            if (error.response && error.response.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    // Group logs by Date
    const groupedLogs = {};
    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.admin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredLogs.forEach(log => {
        if (!log.timestamp) return; // Skip if no timestamp
        const dateKey = log.timestamp.split(' ')[0]; // YYYY-MM-DD
        if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
        groupedLogs[dateKey].push(log);
    });

    const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a));

    const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'วันนี้ (Today)';
        if (date.toDateString() === yesterday.toDateString()) return 'เมื่อวาน (Yesterday)';
        return date.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 max-w-5xl mx-auto">
             {/* 🌟 Header & Toolbar */}
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#1a4d2e] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a4d2e] text-white flex items-center justify-center shadow-lg shadow-green-900/20">
                            <Activity size={20} />
                        </div>
                        Activity Timeline
                    </h1>
                    <p className="text-xs text-gray-400 font-bold ml-14 mt-1">ประวัติการทำงานของผู้ดูแลระบบ ({filteredLogs.length} กิจกรรม)</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" size={18}/>
                        <input 
                            type="text" 
                            placeholder="ค้นหา..." 
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1a4d2e] focus:ring-2 focus:ring-green-500/10 transition-all font-bold text-sm text-gray-700" 
                            value={displaySearch} 
                            onChange={(e) => setDisplaySearch(e.target.value)} 
                        />
                    </div>
                    <button onClick={fetchLogs} className="h-[42px] px-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center">
                        <RefreshCw size={18}/>
                    </button>
                </div>
            </div>

            {/* 🕰️ Timeline View */}
            <div className="space-y-8 pl-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Loading Timeline...</span>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <Activity size={48} className="mx-auto mb-4 text-gray-300"/>
                        <p className="font-bold text-gray-400">ไม่พบประวัติกิจกรรม</p>
                    </div>
                ) : (
                    sortedDates.map(dateKey => (
                        <div key={dateKey} className="relative animate-fade-in-up">
                            {/* Date Header */}
                            <div className="sticky top-24 z-10 mb-6 flex items-center gap-4">
                                <div className="px-4 py-1.5 bg-[#1a4d2e] text-white text-xs font-black rounded-full shadow-md shadow-green-900/10">
                                    {formatDateHeader(dateKey)}
                                </div>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                            </div>

                            {/* Cards Container */}
                            <div className="space-y-4 pl-4 border-l-2 border-gray-100 ml-4 relative">
                                {groupedLogs[dateKey].map((log, index) => (
                                    <div key={log.id} className="relative group">
                                        {/* Dot on Timeline */}
                                        <div className={`absolute -left-[21px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                                            log.type === 'Delete' ? 'bg-red-500' :
                                            log.type === 'Login' ? 'bg-blue-500' :
                                            log.type === 'Order' ? 'bg-emerald-500' :
                                            log.type === 'Promo' ? 'bg-indigo-500' :
                                            log.type === 'Sale' ? 'bg-orange-500' :
                                            'bg-gray-300'
                                        }`}></div>

                                        {/* Card */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                                                log.type === 'Delete' ? 'bg-red-50 text-red-500' :
                                                log.type === 'Login' ? 'bg-blue-50 text-blue-500' :
                                                log.type === 'Order' ? 'bg-emerald-50 text-emerald-500' :
                                                log.type === 'Promo' ? 'bg-indigo-50 text-indigo-500' :
                                                log.type === 'Sale' ? 'bg-orange-50 text-orange-500' :
                                                'bg-gray-50 text-gray-500'
                                            }`}>
                                                {ACTION_ICONS[log.type] || <Activity size={16}/>}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-gray-800 text-sm truncate">{log.action}</h4>
                                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                                        <Clock size={10}/> {log.timestamp ? log.timestamp.split(' ')[1].slice(0,5) : '--:--'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                                                    {log.details || 'No details provided'}
                                                </p>
                                                
                                                {/* Footer Info */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                        <User size={10}/> {log.admin}
                                                    </div>
                                                    {log.ip_address && (
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md hidden sm:flex">
                                                            <Smartphone size={10}/> {log.ip_address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AdminActivityLogs;
