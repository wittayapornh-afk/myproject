import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";

// Register Thai Locale
registerLocale("th", th);

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar, AlertTriangle, DollarSign, Users, ShoppingBag, PieChart as PieChartIcon } from 'lucide-react';

import { formatPrice, formatDate } from '../utils/formatUtils';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

import AdminHighchartsMap from './AdminHighchartsMap';
import AdminOrders from './OrderListAdmin';
import ProductListAdmin from './ProductListAdmin';
import UserListAdmin from './UserListAdmin';
import AdminActivityLogs from './AdminActivityLogs';
import AdminStockHistory from './AdminStockHistory';
import InfoBox from './InfoBox';

function AdminDashboard() {
    const { token, logout } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    // Data States
    const [stats, setStats] = useState({
        total_sales: 0, total_orders: 0, total_users: 0, pending_orders: 0,
        sales_data: [], best_sellers: [], low_stock: [], province_data: [], logs: []
    });
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('daily');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            const activeToken = token || localStorage.getItem('token');
            if (!activeToken) return;
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/admin/categories-list/', {
                     headers: { Authorization: `Token ${activeToken}` }
                });
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, [token]);

    // Low Stock Logic
    const [lowStockPage, setLowStockPage] = useState(1);
    const lowStockItemsPerPage = 6;
    const lowStockData = stats.low_stock || [];
    const totalLowStockPages = Math.ceil(lowStockData.length / lowStockItemsPerPage);
    const paginatedLowStock = lowStockData.slice((lowStockPage - 1) * lowStockItemsPerPage, lowStockPage * lowStockItemsPerPage);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            if (!activeToken) return;

            const response = await axios.get(`http://localhost:8000/api/admin-stats/`, {
                params: { 
                    date: formatDate(selectedDate),
                    period: viewMode,
                    category_id: selectedCategory 
                },
                headers: { Authorization: `Token ${activeToken}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error("Dashboard Stats Fail:", error);
            if (error.response && error.response.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [selectedDate, viewMode, selectedCategory, logout, token]);

    useEffect(() => {
        if (activeTab === 'dashboard') fetchStats();
    }, [fetchStats, activeTab]);

    // --- RENDER CONTENT ---
    const renderContent = () => {
        if (activeTab === 'products') return <ProductListAdmin />;
        if (activeTab === 'orders') return <AdminOrders />;
        if (activeTab === 'users') return <UserListAdmin />;
        if (activeTab === 'history') return <AdminStockHistory />;
        if (activeTab === 'logs') return <AdminActivityLogs />;

        // OVERVIEW TAB
        return (
            <div className="space-y-8 animate-fade-in pb-12">
                
                {/* 1. Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InfoBox title="New Orders" value={stats.pending_orders} icon={<ShoppingBag />} bgColor="bg-gradient-to-br from-cyan-500 to-blue-500" link="/admin/dashboard?tab=orders" />
                    <InfoBox title="Total Sales" value={`฿${(stats.total_sales || 0).toLocaleString()}`} icon={<DollarSign />} bgColor="bg-gradient-to-br from-emerald-500 to-green-600" link="#" />
                    <InfoBox title="Users" value={stats.total_users} icon={<Users />} bgColor="bg-gradient-to-br from-amber-400 to-orange-500" link="/admin/dashboard?tab=users" />
                    <InfoBox title="All Orders" value={stats.total_orders} icon={<PieChartIcon />} bgColor="bg-gradient-to-br from-pink-500 to-rose-500" link="/admin/dashboard?tab=orders" />
                </div>

                {/* 2. Map & Graph */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="xl:col-span-2 min-h-[400px] bg-white rounded-[2.5rem] p-2 shadow-sm border border-gray-100 overflow-hidden relative">
                         <div className="absolute top-6 left-8 z-10 pointer-events-none">
                             <h3 className="font-black text-xl text-gray-800">Sales Map</h3>
                             <p className="text-gray-400 text-xs font-bold">ยอดขายรายจังหวัด</p>
                         </div>
                         <div className="h-full rounded-[2rem] overflow-hidden">
                            <AdminHighchartsMap provinceData={stats.province_data} />
                         </div>
                    </div>

                    {/* Sales Graph */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-[400px]">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="text-[#1a4d2e]" size={24} />
                                    Sales Trend
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 font-bold">
                                    {viewMode === 'daily' ? 'รายวัน' : viewMode === 'monthly' ? 'รายเดือน' : 'รายปี'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.sales_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1a4d2e" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#1a4d2e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa', fontWeight: 'bold' }} tickFormatter={(value) => `฿${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                        formatter={(value) => [`฿${value.toLocaleString()}`, 'ยอดขาย']}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#1a4d2e" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Bottom Row: Best Sellers & Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Best Sellers */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl text-gray-800">🏆 Top Products</h3>
                            <button className="text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors uppercase tracking-wider">See All</button>
                        </div>
                        <div className="space-y-4">
                             {stats.best_sellers?.slice(0, 5).map((product, i) => (
                                 <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                                     <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm shrink-0 shadow-sm
                                        ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-400'}`}>
                                        {i + 1}
                                     </div>
                                     <img src={product.thumbnail ? `http://localhost:8000${product.thumbnail}` : "/placeholder.png"} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt="" />
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold text-gray-800 truncate text-sm">{product.name}</h4>
                                         <p className="text-xs text-green-600 font-bold">฿{parseFloat(product.price).toLocaleString()}</p>
                                     </div>
                                     <div className="text-right">
                                         <span className="block text-lg font-black text-gray-800">{product.sales}</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase">Sold</span>
                                     </div>
                                 </div>
                             ))}
                             {(!stats.best_sellers || stats.best_sellers.length === 0) && <p className="text-gray-400 text-center py-8">No data available</p>}
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2"><AlertTriangle className="text-red-500" size={24}/> Low Stock</h3>
                            <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-black border border-red-100">Critical &lt; 10</span>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="text-[10px] uppercase text-gray-400 font-bold">
                                    <tr className="border-b border-gray-50">
                                        <th className="pb-3 pl-2">Product</th>
                                        <th className="pb-3 text-center">Stock</th>
                                        <th className="pb-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedLowStock.map((item, i) => (
                                        <tr key={i} className="group hover:bg-red-50/10 transition-colors">
                                            <td className="py-3 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.thumbnail ? `http://localhost:8000${item.thumbnail}` : "/placeholder.png"} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" />
                                                    <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="text-red-600 font-black text-lg">{item.stock}</span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <a href={`/admin/product/edit/${item.id}`} className="inline-block px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-[#1a4d2e] hover:text-white transition-colors">Refill</a>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedLowStock.length === 0 && (
                                        <tr><td colSpan="3" className="text-center py-10 text-green-500 font-bold text-sm">All products are well stocked! 🎉</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalLowStockPages > 1 && (
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                <button onClick={() => setLowStockPage(p => Math.max(1, p - 1))} disabled={lowStockPage === 1} className="text-xs font-bold text-gray-500 hover:text-[#1a4d2e] disabled:opacity-30">Previous</button>
                                <span className="text-xs font-bold text-gray-300">{lowStockPage} / {totalLowStockPages}</span>
                                <button onClick={() => setLowStockPage(p => Math.min(totalLowStockPages, p + 1))} disabled={lowStockPage === totalLowStockPages} className="text-xs font-bold text-gray-500 hover:text-[#1a4d2e] disabled:opacity-30">Next</button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-8 font-sans selection:bg-[#1a4d2e] selection:text-white">
            
            {/* 🌟 Top Sticky Header */}
            <div className="sticky top-4 z-30 mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-gray-200/50 p-4 pl-8 pr-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
                    <div>
                        <h1 className="text-2xl font-black text-[#1a4d2e] tracking-tight uppercase">
                            {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('_', ' ')}
                        </h1>
                        <p className="text-xs text-gray-400 font-bold">
                            {activeTab === 'dashboard' ? 'Real-time analysis & insights' : 'Manage your system efficiently'}
                        </p>
                    </div>

                    {activeTab === 'dashboard' && (
                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                            <div className="flex bg-gray-50 p-1 rounded-xl">
                                {['daily', 'monthly', 'yearly'].map(mode => (
                                    <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase ${viewMode === mode ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {mode}
                                    </button>
                                ))}
                            </div>
                            <div className="h-8 w-px bg-gray-100"></div>
                            <div className="flex items-center gap-2 pr-4 relative">
                                <Calendar size={16} className="text-[#1a4d2e]" />
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    locale="th"
                                    className="text-xs font-black outline-none w-24 bg-transparent cursor-pointer text-[#1a4d2e]"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="h-[70vh] flex flex-col items-center justify-center">
                    <div className="w-14 h-14 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-6 text-[#1a4d2e] font-black animate-pulse uppercase tracking-widest text-xs">Loading Dashboard...</p>
                </div>
            ) : renderContent()}
        </div>
    );
}

export default AdminDashboard;