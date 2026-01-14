import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, History, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AdminStockHistory() {
    const { token, logout } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all'); // ✅ New State
    const [categories, setCategories] = useState([]); // ✅ Categories List

    useEffect(() => {
        fetchHistory();
        fetchCategories();
    }, [actionFilter, categoryFilter]); // Refetch when filter changes

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/categories/');
            setCategories(res.data.categories);
        } catch (err) {
            console.error("Fetch Categories Error", err);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/admin/stock-history/', {
                params: { search: searchTerm, action: actionFilter, category: categoryFilter }, // ✅ Send params
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

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchHistory();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);


    const getActionBadge = (action, change) => {
        let colorClass = "bg-gray-100 text-gray-600";
        let icon = null;

        if (action === 'Sale' || action === 'sale') {
            colorClass = "bg-blue-50 text-blue-600 border border-blue-100";
            icon = <ArrowUpRight size={12} />;
        } else if (action === 'Restock' || action === 'restock') {
            colorClass = "bg-green-50 text-green-600 border border-green-100";
            icon = <ArrowDownLeft size={12} />;
        } else if (action === 'Adjustment' || action === 'adjustment') {
            colorClass = "bg-orange-50 text-orange-600 border border-orange-100";
            icon = <AlertCircle size={12} />;
        } else if (action === 'Return' || action === 'return') {
            colorClass = "bg-purple-50 text-purple-600 border border-purple-100";
            icon = <History size={12} />;
        } else if (action === 'Edit Info' || action === 'edit') {
            colorClass = "bg-indigo-50 text-indigo-600 border border-indigo-100";
            icon = <Filter size={12} />;
        }

        return (
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase ${colorClass}`}>
                {icon} {action}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
             {/* Toolbar */}
             <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="ค้นหาตามชื่อสินค้า..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e]"
                        value={searchTerm} 
                        onChange={e=>setSearchTerm(e.target.value)} 
                    />
                </div>
                
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400"/>
                    <select 
                        className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#1a4d2e] text-sm font-medium text-gray-600"
                        value={categoryFilter} 
                        onChange={e=>setCategoryFilter(e.target.value)}
                    >
                        <option value="all">ทุกหมวดหมู่ (All Categories)</option>
                        {categories.map((c, idx) => (
                             c !== "ทั้งหมด" && <option key={idx} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400"/>
                    <select 
                        className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#1a4d2e] text-sm font-medium text-gray-600"
                        value={actionFilter} 
                        onChange={e=>setActionFilter(e.target.value)}
                    >
                        <option value="all">ทุกกิจกรรม (All Actions)</option>
                        <option value="sale">Sale (ขายออก)</option>
                        <option value="restock">Restock (เติมของ)</option>
                        <option value="adjustment">Adjustment (ปรับปรุง)</option>
                        <option value="return">Return (คืนสินค้า)</option>
                        <option value="edit">Edit Info (แก้ไขข้อมูล)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8F9FA] text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="p-6 pl-8 w-24 text-center">Date</th>
                                <th className="p-6">Product</th>
                                <th className="p-6 text-center">Type</th>
                                <th className="p-6 text-right">Change</th>
                                <th className="p-6 text-right">Remaining</th>
                                <th className="p-6">User</th>
                                <th className="p-6 w-1/4">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="7" className="p-10 text-center text-gray-400 font-medium">กำลังโหลดข้อมูล...</td></tr>
                            ) : history.length === 0 ? (
                                <tr><td colSpan="7" className="p-10 text-center text-gray-400 font-medium">ไม่พบประวัติการเปลี่ยนแปลง</td></tr>
                            ) : (
                                history.map((h) => (
                                    <tr key={h.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 text-xs font-bold text-gray-400 whitespace-nowrap text-center">
                                            {h.date.split(' ')[0]}<br/>
                                            <span className="font-normal opacity-70">{h.date.split(' ')[1]}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {h.product_image ? (
                                                    <img src={h.product_image.startsWith('http') ? h.product_image : `http://localhost:8000${h.product_image}`} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-xs">NO</div>
                                                )}
                                                <span className="font-bold text-gray-700 text-sm group-hover:text-[#1a4d2e] transition-colors">{h.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {getActionBadge(h.action, h.change)}
                                        </td>
                                        <td className={`p-4 text-right font-black text-sm ${h.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {h.change > 0 ? '+' : ''}{h.change}
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-600 text-sm">{h.remaining}</td>
                                        <td className="p-4 text-sm font-medium text-gray-500">{h.user}</td>
                                        <td className="p-4 text-xs text-gray-400 italic line-clamp-2 max-w-xs" title={h.note}>{h.note || '-'}</td>
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
