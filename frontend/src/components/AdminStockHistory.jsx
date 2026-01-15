import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, History, ArrowUpRight, ArrowDownLeft, AlertCircle, RefreshCw, Calendar, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

function AdminStockHistory() {
    const { token, logout } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [displaySearch, setDisplaySearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [actionFilter, categoryFilter, searchTerm]);

    // Debounce Search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(displaySearch);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [displaySearch]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/categories/`);
            setCategories(res.data.categories);
        } catch (err) {
            console.error("Fetch Categories Error", err);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/admin/stock-history/`, {
                params: { search: searchTerm, action: actionFilter, category: categoryFilter },
                headers: { Authorization: `Token ${activeToken}` }
            });
            setHistory(response.data);
        } catch (error) {
            console.error("Fetch Stock History Error:", error);
            if (error.response && error.response.status === 401) logout();
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action, change) => {
        let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
        let icon = null;
        let label = action;

        const lowerAction = action?.toLowerCase() || '';

        if (lowerAction === 'sale') {
            colorClass = "bg-blue-50 text-blue-600 border border-blue-100";
            icon = <ArrowUpRight size={12} />;
            label = "ขายออก";
        } else if (lowerAction === 'restock') {
            colorClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
            icon = <ArrowDownLeft size={12} />;
            label = "เติมสินค้า";
        } else if (lowerAction === 'adjustment') {
            colorClass = "bg-orange-50 text-orange-600 border border-orange-100";
            icon = <AlertCircle size={12} />;
            label = "ปรับปรุงสต็อก";
        } else if (lowerAction === 'return') {
            colorClass = "bg-purple-50 text-purple-600 border border-purple-100";
            icon = <History size={12} />;
            label = "รับคืนสินค้า";
        } else if (lowerAction.includes('edit')) {
            colorClass = "bg-indigo-50 text-indigo-600 border border-indigo-100";
            icon = <Filter size={12} />;
            label = "แก้ไขข้อมูล";
        }

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${colorClass}`}>
                {icon} {label}
            </span>
        );
    };

    const handleReset = () => {
        setDisplaySearch('');
        setActionFilter('all');
        setCategoryFilter('all');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
             {/* 🌟 Toolbar */}
             <div className="flex flex-col xl:flex-row gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 items-end xl:items-center">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">ค้นหาสินค้า</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#1a4d2e] transition-colors" size={20}/>
                        <input 
                            type="text" 
                            placeholder="ค้นหา: ชื่อสินค้า..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-sm text-gray-700"
                            value={displaySearch} 
                            onChange={e=>setDisplaySearch(e.target.value)} 
                        />
                    </div>
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 w-full xl:w-auto">
                    <div className="flex-1 xl:w-48">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">หมวดหมู่</label>
                        <div className="relative">
                            <select 
                                className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] appearance-none cursor-pointer font-bold text-xs text-gray-600"
                                value={categoryFilter} 
                                onChange={e=>setCategoryFilter(e.target.value)}
                            >
                                <option value="all">ทุกหมวดหมู่</option>
                                {categories.map((c, idx) => (
                                     c !== "ทั้งหมด" && <option key={idx} value={c}>{c}</option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14}/>
                        </div>
                    </div>

                    <div className="flex-1 xl:w-48">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block ml-1">ประเภทรายการ</label>
                        <div className="relative">
                            <select 
                                className="w-full pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] appearance-none cursor-pointer font-bold text-xs text-gray-600"
                                value={actionFilter} 
                                onChange={e=>setActionFilter(e.target.value)}
                            >
                                <option value="all">ทุกกิจกรรม</option>
                                <option value="sale">ขายออก (Sale)</option>
                                <option value="restock">เติมสินค้า (Restock)</option>
                                <option value="adjustment">ปรับปรุง (Adjust)</option>
                                <option value="return">รับคืน (Return)</option>
                                <option value="edit">แก้ไขข้อมูล (Edit)</option>
                            </select>
                            <History className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14}/>
                        </div>
                    </div>
                </div>

                <button onClick={handleReset} className="w-full xl:w-auto h-[46px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl flex items-center justify-center gap-2 transition-colors font-bold text-xs shadow-sm mt-auto">
                    <RefreshCw size={16}/> ล้างค่า
                </button>
            </div>

            {/* 📋 Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#f8fafc] text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-6 pl-8 w-32">วันที่-เวลา</th>
                                <th className="p-6">สินค้า</th>
                                <th className="p-6 text-center">ประเภท</th>
                                <th className="p-6 text-right">จำนวน</th>
                                <th className="p-6 text-right">คงเหลือ</th>
                                <th className="p-6">ผู้ทำรายการ</th>
                                <th className="p-6 w-1/4">หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="7" className="p-12 text-center text-gray-400 font-bold">กำลังโหลดข้อมูล...</td></tr>
                            ) : history.length === 0 ? (
                                <tr><td colSpan="7" className="p-12 text-center text-gray-400 font-bold">ไม่พบประวัติการเปลี่ยนแปลง</td></tr>
                            ) : (
                                history.map((h) => (
                                    <tr key={h.id} className="hover:bg-[#fcfdfc] transition-colors group">
                                        <td className="p-5 pl-8 text-xs font-bold text-gray-500 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-300"/>
                                                <div>

                                                    {(h.date || '').split(' ')[0]}
                                                    <div className="text-[10px] font-medium text-gray-400">{(h.date || '').split(' ')[1]}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 bg-white">
                                                    {h.product_image ? (
                                                        <img src={h.product_image.startsWith('http') ? h.product_image : `${API_BASE_URL}${h.product_image}`} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                            <Package size={20}/>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-gray-700 text-sm group-hover:text-[#1a4d2e] transition-colors">{h.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            {getActionBadge(h.action, h.change)}
                                        </td>
                                        <td className={`p-5 text-right font-black text-sm ${h.change > 0 ? 'text-emerald-500' : h.change < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {h.change > 0 ? '+' : ''}{h.change}
                                        </td>
                                        <td className="p-5 text-right font-bold text-gray-700 text-sm bg-gray-50/50">{h.remaining}</td>
                                        <td className="p-5 text-xs font-bold text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-black border border-gray-200">
                                                    {h.user?.charAt(0).toUpperCase() || 'A'}
                                                </div>
                                                {h.user}
                                            </div>
                                        </td>
                                        <td className="p-5 text-xs text-gray-400 font-medium italic">
                                            {h.note ? <span className="bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">{h.note}</span> : '-'}
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

export default AdminStockHistory;
