import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";

// ✅ Register Thai Locale
registerLocale("th", th);

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Clock, Activity, TrendingUp, Calendar, Package, AlertTriangle, Download } from 'lucide-react';

import { formatPrice, formatDate } from '../utils/formatUtils';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom'; // ✅ Use URL Params

// Import Components
// Removed AdminSidebar import (Global)
import AdminOrders from './OrderListAdmin';
import ProductListAdmin from './ProductListAdmin';
import UserListAdmin from './UserListAdmin';
import AdminActivityLogs from './AdminActivityLogs';
import AdminStockHistory from './AdminStockHistory'; // ✅ Import New Component

const COLORS = ['#1a4d2e', '#2d6a4f', '#40916c', '#52b788', '#74c69d'];

function AdminDashboard() {
    const { token, logout } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard'; // ✅ URL Driven State

    const [stats, setStats] = useState({
        total_sales: 0,
        total_orders: 0,
        total_users: 0,
        pending_orders: 0,
        sales_data: [],
        best_sellers: [],
        low_stock: [],
        pie_data: [],
        bar_data: [],
        logs: []
    });
    const [loading, setLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('daily');
    const [errorMsg, setErrorMsg] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            let startStr, endStr;
            const date = new Date(selectedDate);

            if (viewMode === 'daily') {
                startStr = date.toISOString().split('T')[0];
                endStr = startStr;
            } else if (viewMode === 'monthly') {
                const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                startStr = firstDay.toISOString().split('T')[0];
                endStr = lastDay.toISOString().split('T')[0];
            } else {
                const firstDay = new Date(date.getFullYear(), 0, 1);
                const lastDay = new Date(date.getFullYear(), 11, 31);
                startStr = firstDay.toISOString().split('T')[0];
                endStr = lastDay.toISOString().split('T')[0];
            }

            const activeToken = token || localStorage.getItem('token');
            if (!activeToken) {
                 setErrorMsg("No Token Found");
                 return;
            }

            // Fix Timezone Issue: Send YYYY-MM-DD in Local Time
            const dateParam = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

            const response = await axios.get(`http://localhost:8000/api/admin/dashboard-stats/`, {
                params: { period: viewMode, date: dateParam },
                headers: { Authorization: `Token ${activeToken}` }
            });

            setStats(response.data);

        } catch (error) {
            console.error("Dashboard Stats Fail:", error);
            setErrorMsg(error.message + (error.response ? ` (Status: ${error.response.status})` : ""));
            
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    }, [selectedDate, viewMode, logout, token]);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchStats();
        }
    }, [fetchStats, activeTab]);

    const renderContent = () => {
        if (activeTab === 'products') return <ProductListAdmin />;
        if (activeTab === 'orders') return <AdminOrders />;
        if (activeTab === 'users') return <UserListAdmin />;
        if (activeTab === 'history') return <AdminStockHistory />; // ✅ Stock History Tab
        if (activeTab === 'logs') return <AdminActivityLogs />;

        return (
            <div className="space-y-8 animate-fade-in">
                {/* 1. Header Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="ยอดขายรวม" value={formatPrice(stats.total_sales)} color="bg-gradient-to-br from-[#1a4d2e] to-[#2d6a4f]" icon={<span className="text-2xl">💰</span>} />
                    <StatCard title="ออเดอร์ทั้งหมด" value={stats.total_orders || 0} color="bg-white border border-gray-200 text-gray-800" icon={<Package className="text-[#1a4d2e]" />} isLight />
                    <StatCard title="ลูกค้าทั้งหมด" value={stats.total_users || 0} color="bg-white border border-gray-200 text-gray-800" icon={<span className="text-2xl">👥</span>} isLight />
                    <StatCard title="รอตรวจสอบ" value={stats.pending_orders || 0} color="bg-orange-500 text-white shadow-orange-100 shadow-lg" icon={<span className="text-2xl">⏳</span>} />
                </div>

                {/* 2. Row 1: Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#263A33]">
                            <TrendingUp size={20} className="text-[#1a4d2e]" /> สัดส่วนยอดขาย
                        </h3>
                        <div className="h-[300px] w-full">
                            {stats.pie_data?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.pie_data} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                            {stats.pie_data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="h-full flex items-center justify-center text-gray-400">ไม่มีข้อมูล</div>}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#263A33]">
                            <Activity size={20} className="text-[#1a4d2e]" /> 5 อันดับสินค้าขายดี
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.best_sellers || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#f0fdf4' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="sales" fill="#1a4d2e" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 3. Row 2: Sales Trend & Activity Log */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-[#263A33] mb-6 flex items-center gap-2"><TrendingUp className="text-[#1a4d2e]" /> แนวโน้มยอดขาย</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.sales_data}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1a4d2e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#1a4d2e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v) => `฿${v}`} />
                                    <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="sales" stroke="#1a4d2e" strokeWidth={3} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-[#263A33]"><Clock size={20} className="text-[#1a4d2e]" /> บันทึกกิจกรรม</h3>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {stats.logs?.map((log, i) => (
                                <div key={i} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-2xl transition-all">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.action?.includes('ลบ') ? 'bg-red-500' :
                                            log.action?.includes('เพิ่ม') ? 'bg-green-500' : 'bg-[#1a4d2e]'
                                        }`} />
                                    <div>
                                        <p className="text-xs text-gray-700 font-bold leading-tight">
                                            {log.user} <span className="text-gray-400 font-normal">{log.action}</span> {log.target}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Row 3: Low Stock */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black mb-6 text-[#263A33] flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> สินค้าที่ต้องเติมสต็อกด่วน
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.low_stock?.length > 0 ? stats.low_stock.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <span className="font-bold text-red-700 text-sm">{item.name || item.title}</span>
                                <span className="bg-white text-red-600 px-3 py-1 rounded-full font-black text-xs border border-red-200 shadow-sm">
                                    เหลือ {item.stock}
                                </span>
                            </div>
                        )) : (
                            <div className="col-span-full py-6 text-center bg-green-50 text-green-700 rounded-2xl font-bold">
                                ✨ สินค้าทุกรายการมีสต็อกเพียงพอ
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#F2F0E4]">
            {/* ✅ Removed AdminSidebar - Global Sidebar is in App.jsx */}
            
            {/* Main Content - No margins here, handled by App.jsx wrapper */}
            {/* Actually, App.jsx wrapper has the margin transition. So here we just need generic padding */}
            <div className="flex-1 w-full p-6 md:p-10 transition-all">
                {/* Top Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24 z-[30]">
                    <div>
                        <h1 className="text-2xl font-black text-[#1a4d2e] tracking-tight uppercase">
                            {activeTab} Management
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
                                {['daily', 'monthly', 'yearly'].map(mode => (
                                    <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all uppercase ${viewMode === mode ? 'bg-white text-[#1a4d2e] shadow-sm' : 'text-gray-400'}`}>
                                        {mode}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 bg-white border px-4 py-2 rounded-2xl shadow-sm border-gray-100">
                                <Calendar size={14} className="text-[#1a4d2e]" />
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    dateFormat={viewMode === 'yearly' ? "yyyy" : viewMode === 'monthly' ? "MM/yyyy" : "dd/MM/yyyy"}
                                    showMonthYearPicker={viewMode === 'monthly'}
                                    showYearPicker={viewMode === 'yearly'}
                                    locale="th" // ✅ Set Locale to Thai
                                    className="text-xs font-black outline-none w-20 text-center text-gray-600 bg-transparent cursor-pointer"
                                />
                            </div>
                            
                            {/* ✅ Export CSV Button */}
                            <button 
                                onClick={async () => {
                                    try {
                                        const authToken = token || localStorage.getItem('token');
                                        
                                        // Fix Timezone for Export
                                        const dateParam = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                                        
                                        console.log("Export:", viewMode, dateParam); 
                                        
                                        const response = await axios.get('http://localhost:8000/api/admin/export_orders/', {
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
                                <Download size={14} /> Export Excel
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-[#1a4d2e] font-black animate-pulse uppercase tracking-widest text-xs">Processing Stats...</p>
                    </div>
                ) : renderContent()}
            </div>
        </div>
    );
}

const StatCard = ({ title, value, color, icon, isLight }) => (
    <div className={`p-6 xl:p-8 rounded-[2.5rem] shadow-sm border border-transparent transition-all duration-500 hover:shadow-xl hover:-translate-y-2 ${color}`}>
        <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isLight ? 'text-gray-400' : 'text-white/60'}`}>{title}</p>
                <h3 className={`text-2xl xl:text-3xl font-black truncate ${isLight ? 'text-[#1a4d2e]' : 'text-white'}`} title={value}>{value}</h3>
            </div>
            <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isLight ? 'bg-gray-50 text-[#1a4d2e]' : 'bg-white/20 text-white'}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default AdminDashboard;