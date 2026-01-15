import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";

// Register Thai Locale
registerLocale("th", th);

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, LabelList
} from 'recharts';
import { TrendingUp, Calendar, AlertTriangle, DollarSign, Users, ShoppingBag, PieChart as PieChartIcon, Download, Clock } from 'lucide-react';

import { formatPrice, formatDate } from '../utils/formatUtils';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

import AdminHighchartsMap from './AdminHighchartsMap';
import AdminOrders from './OrderListAdmin';
import ProductListAdmin from './ProductListAdmin';
import UserListAdmin from './UserListAdmin';
import AdminActivityLogs from './AdminActivityLogs';
import AdminStockHistory from './AdminStockHistory';
import InfoBox from './InfoBox';

const DatePickerStyles = () => (
    <style>{`
        .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 1.5rem;
            border: none;
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.1), 0 10px 10px -5px rgba(79, 70, 229, 0.04);
            background: white;
            overflow: hidden;
            border: 1px solid rgba(79, 70, 229, 0.1);
        }
        .react-datepicker__header {
            background: #f8fafc;
            border-bottom: 1px solid #f1f5f9;
            padding: 1rem 0;
        }
        .react-datepicker__current-month {
            color: #1e293b;
            font-weight: 800;
            font-size: 0.9rem;
        }
        .react-datepicker__day-name {
            color: #94a3b8;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.7rem;
        }
        .react-datepicker__day {
            color: #475569;
            font-weight: 600;
            border-radius: 0.5rem;
            transition: all 0.2s;
        }
        .react-datepicker__day:hover {
            background-color: #f5f3ff !important;
            color: #4f46e5 !important;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
            background: #4f46e5 !important;
            color: white !important;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);
        }
        .react-datepicker__day--today {
            color: #4f46e5;
            font-weight: 800;
        }
        .react-datepicker__navigation--next {
             border-left-color: #94a3b8;
        }
        .react-datepicker__navigation--previous {
             border-right-color: #94a3b8;
        }
    `}</style>
);

function AdminDashboard() {
    const { token, logout } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    // Data States
    const [stats, setStats] = useState({
        total_sales: 0, total_orders: 0, total_users: 0, pending_orders: 0,
        sales_data: [], best_sellers: [], low_stock: [], province_data: [], logs: [], category_stats: []
    });
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
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
                const res = await axios.get(`${API_BASE_URL}/api/admin/categories-list/`, {
                     headers: { Authorization: `Token ${activeToken}` }
                });
                setCategories(res.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
                if (err.response && err.response.status === 401) {
                    // logout();
                    console.warn("Unauthorized: Please login again.");
                }
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

            if (!activeToken) {
                setErrorMsg("No Token Found");
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/api/admin-stats/`, {
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
            setErrorMsg(error.message + (error.response ? ` (Status: ${error.response.status})` : ""));

            if (error.response && error.response.status === 401) {
                // logout();
                console.warn("Unauthorized: Please login again.");
            }
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
                    <InfoBox title="คำสั่งซื้อใหม่" value={stats.pending_orders} icon={<ShoppingBag />} bgColor="bg-gradient-to-br from-cyan-500 to-blue-500" link="/admin/dashboard?tab=orders" />
                    <InfoBox title="ยอดขายรวม" value={`฿${(stats.total_sales || 0).toLocaleString()}`} icon={<DollarSign />} bgColor="bg-gradient-to-br from-emerald-500 to-green-600" link="#" />
                    <InfoBox title="ผู้ใช้งาน" value={stats.total_users} icon={<Users />} bgColor="bg-gradient-to-br from-amber-400 to-orange-500" link="/admin/dashboard?tab=users" />
                    <InfoBox title="ออเดอร์ทั้งหมด" value={stats.total_orders} icon={<PieChartIcon />} bgColor="bg-gradient-to-br from-pink-500 to-rose-500" link="/admin/dashboard?tab=orders" />
                </div>

                {/* 2. Map & Graph */}
                {/* 2. Main Dashboard Grid */}
                <div className="grid grid-cols-12 gap-6">
                    
                    {/* Row 1: Sales Graph (8) & Best Sellers (4) */}
                    <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-[420px]">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="text-[#1a4d2e]" size={24} />
                                    แนวโน้มยอดขาย (Sales Trend)
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

                    <div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-[420px] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="font-black text-xl text-gray-800">🏆 สินค้าขายดี</h3>
                            <button className="text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors uppercase tracking-wider">ดูทั้งหมด</button>
                        </div>
                        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                             {stats.best_sellers?.slice(0, 5).map((product, i) => (
                                 <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                                     <div className={`w-8 h-8 flex items-center justify-center rounded-xl font-black text-xs shrink-0 shadow-sm
                                        ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-400'}`}>
                                        {i + 1}
                                     </div>
                                     <img src={product.thumbnail ? `${API_BASE_URL}${product.thumbnail}` : "/placeholder.png"} className="w-10 h-10 rounded-xl object-cover bg-gray-100" alt="" />
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold text-gray-800 truncate text-xs">{product.name}</h4>
                                         <p className="text-[10px] text-green-600 font-bold">฿{parseFloat(product.price).toLocaleString()}</p>
                                     </div>
                                     <div className="text-right">
                                         <span className="block text-sm font-black text-gray-800">{product.sales}</span>
                                     </div>
                                 </div>
                             ))}
                             {(!stats.best_sellers || stats.best_sellers.length === 0) && <p className="text-gray-400 text-center py-8 text-xs">ไม่มีข้อมูล</p>}
                        </div>
                    </div>

                    {/* Row 2: Category Chart (Full Width) */}
                    <div className="col-span-12 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-[450px]">
                        <h3 className="font-black text-lg text-gray-800 flex items-center gap-2 mb-4">
                            <PieChartIcon className="text-[#1a4d2e]" size={20} />
                            ยอดขายตามหมวดหมู่
                        </h3>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.category_stats} layout="vertical" margin={{ top: 5, right: 100, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#666' }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                        formatter={(value) => [`฿${value.toLocaleString()}`, 'ยอดขาย']}
                                        cursor={{fill: '#f8fafc'}}
                                    />
                                    <Bar dataKey="value" name="ยอดขาย" radius={[0, 10, 10, 0]} barSize={32}>
                                        <LabelList dataKey="value" position="right" formatter={(val) => `฿${val.toLocaleString()}`} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#1a4d2e' }} />
                                        {stats.category_stats?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#1a4d2e', '#4ade80', '#fbbf24', '#f87171', '#60a5fa'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Row 3: Map (Full Width) */}
                    <div className="col-span-12 h-[500px] overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-gray-100">
                         <AdminHighchartsMap provinceData={stats.province_data} />
                    </div>

                    {/* Row 4: Logs & Low Stock (Split or Full? User said 4 slots wider... let's make Logs and Low Stock wider too, maybe 2/3 and 1/3 or just full stacked?) 
                       Let's trying making them full width as requested to ensure "not squeezed".
                    */}
                    <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 h-[400px] flex flex-col">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-[#263A33]"><Clock size={20} className="text-[#1a4d2e]" /> บันทึกกิจกรรม</h3>
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {stats.logs?.map((log, i) => (
                                <div key={i} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.action?.includes('ลบ') ? 'bg-red-500' :
                                        log.action?.includes('เพิ่ม') ? 'bg-green-500' : 'bg-[#1a4d2e]'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-gray-700 font-bold leading-tight">
                                            {log.user} <span className="text-gray-400 font-normal">{log.action}</span> {log.target}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-lg text-gray-800 flex items-center gap-2"><AlertTriangle className="text-red-500" size={20}/> สินค้าใกล้หมด</h3>
                            <span className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-black border border-red-100">วิกฤต &lt; 10</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="text-[10px] uppercase text-gray-400 font-bold sticky top-0 bg-white">
                                    <tr className="border-b border-gray-50">
                                        <th className="pb-3 pl-2">สินค้า</th>
                                        <th className="pb-3 text-center">สต็อก</th>
                                        <th className="pb-3 text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lowStockData.map((item, i) => (
                                        <tr key={i} className="group hover:bg-red-50/10 transition-colors">
                                            <td className="py-2 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.thumbnail ? `${API_BASE_URL}${item.thumbnail}` : "/placeholder.png"} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" />
                                                    <span className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 text-center">
                                                <span className="text-red-600 font-black text-sm">{item.stock}</span>
                                            </td>
                                            <td className="py-2 text-right">
                                                <a href={`/admin/product/edit/${item.id}`} className="inline-block px-3 py-1.5 bg-gray-50 text-gray-600 rounded text-[10px] font-bold hover:bg-[#1a4d2e] hover:text-white transition-colors">เติมของ</a>
                                            </td>
                                        </tr>
                                    ))}
                                    {lowStockData.length === 0 && (
                                        <tr><td colSpan="3" className="text-center py-10 text-green-500 font-bold text-xs">สต็อกเพียงพอ! 🎉</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    const getTitle = (tab) => {
        switch(tab) {
            case 'products': return 'จัดการสินค้า (Products)';
            case 'orders': return 'จัดการคำสั่งซื้อ (Orders)';
            case 'users': return 'จัดการผู้ใช้ (Users)';
            case 'history': return 'ประวัติสต็อก (Stock History)';
            case 'logs': return 'บันทึกกิจกรรม (Activity Logs)';
            default: return 'ภาพรวม (Dashboard Overview)';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
            <DatePickerStyles />
            {/* Sidebar Desktop */}
            <div className="flex-1 w-full p-6 md:p-10 transition-all">
                {/* Top Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24 z-[30]">
                    <div>
                        <h1 className="text-2xl font-black text-[#1a4d2e] tracking-tight uppercase">
                            {getTitle(activeTab)}
                        </h1>
                        <p className="text-xs text-gray-400 font-bold">
                            {viewMode === 'daily' && `ข้อมูลวันที่: ${formatDate(selectedDate)}`}
                            {viewMode === 'monthly' && `ข้อมูลประจำเดือน: ${selectedDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`}
                            {viewMode === 'yearly' && `ข้อมูลประจำปี: ${selectedDate.getFullYear() + 543}`}
                        </p>
                    </div>

                    {activeTab === 'dashboard' && (
                        <div className="flex gap-4 items-center">
                            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                                <button onClick={() => setViewMode('daily')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === 'daily' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400'}`}>รายวัน</button>
                                <button onClick={() => setViewMode('monthly')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === 'monthly' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400'}`}>รายเดือน</button>
                                <button onClick={() => setViewMode('yearly')} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === 'yearly' ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400'}`}>รายปี</button>
                            </div>
                            <div className="flex items-center gap-2 bg-white border px-4 py-2 rounded-2xl shadow-sm border-gray-100">
                                <Calendar size={14} className="text-[#1a4d2e]" />
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    dateFormat={viewMode === 'yearly' ? "yyyy" : viewMode === 'monthly' ? "MM/yyyy" : "dd/MM/yyyy"}
                                    showMonthYearPicker={viewMode === 'monthly'}
                                    showYearPicker={viewMode === 'yearly'}
                                    locale="th" 
                                    className="text-xs font-black outline-none w-20 text-center text-gray-600 bg-transparent cursor-pointer"
                                />
                            </div>

                            {/* Export CSV Button */}
                            <button
                                onClick={async () => {
                                    try {
                                        const authToken = token || localStorage.getItem('token');

                                        // Fix Timezone for Export
                                        const dateParam = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

                                        console.log("Export:", viewMode, dateParam);

                                        const response = await axios.get(`${API_BASE_URL}/api/admin/export_orders/`, {
                                            params: { period: viewMode, date: dateParam },
                                            headers: { Authorization: `Token ${authToken}` },
                                            responseType: 'blob', // Important for file download
                                        });
                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', 'orders_export.xlsx');
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        // alert("Export successful! Check your downloads.");
                                    } catch (e) {
                                        console.error("Export Failed", e);
                                        if (e.response && e.response.data instanceof Blob) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                try {
                                                    const errMsg = JSON.parse(reader.result).error || reader.result;
                                                    alert("Export Error: " + errMsg);
                                                } catch {
                                                    alert("Export Error: " + reader.result);
                                                }
                                            };
                                            reader.readAsText(e.response.data);
                                        } else {
                                            alert("Export Failed: " + (e.response?.data?.error || e.message));
                                        }
                                    }
                                }}
                                className="flex items-center gap-2 bg-[#1a4d2e] text-white px-4 py-2 rounded-2xl shadow-lg shadow-green-200 hover:bg-[#143d24] transition-all text-xs font-bold"
                            >
                                <Download size={14} /> ส่งออก Excel
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-[#1a4d2e] font-black animate-pulse uppercase tracking-widest text-xs">กำลังประมวลผล...</p>
                    </div>
                ) : errorMsg ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
                        <AlertTriangle size={48} className="text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">เกิดข้อผิดพลาด</h3>
                        <p className="text-gray-500 mt-2">{errorMsg}</p>
                        <button 
                            onClick={() => { setErrorMsg(null); fetchStats(); }}
                            className="mt-6 px-6 py-2 bg-[#1a4d2e] text-white rounded-xl shadow-lg hover:bg-[#143d24] transition-all font-bold"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                ) : renderContent()}
            </div>
        </div>
    );
}

export default AdminDashboard;