import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";

// ✅ Register Thai Locale
registerLocale("th", th);

import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { Clock, Activity, TrendingUp, Calendar, AlertTriangle, DollarSign, Users, ShoppingBag, PieChart as PieChartIcon, Map as MapIcon, MapPin } from 'lucide-react';

import { formatPrice, formatDate } from '../utils/formatUtils';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

// Import Components
import AdminOrders from './OrderListAdmin';
import ProductListAdmin from './ProductListAdmin';
import UserListAdmin from './UserListAdmin';
import AdminActivityLogs from './AdminActivityLogs';
import AdminStockHistory from './AdminStockHistory';
import AdminMapDashboard from './AdminMapDashboard';
import InfoBox from './InfoBox'; // ✅ Import InfoBox
import DashboardMapWidget from './DashboardMapWidget'; // ✅ Import Map Widget

// ==========================================
// 1. Color Palettes (ชุดสีที่กำหนดเอง)
// ==========================================
// สีสำหรับ Pie Chart (Full Circle)
const PIE_COLORS = ['#C0392B', '#E67E22', '#F1C40F', '#2ECC71', '#3498DB', '#9B59B6']; 

// สีสำหรับ Bar Chart (แต่ละแท่งสีต่างกัน)
const BAR_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Salmon
    '#98D8C8', // Greenish
];

// ==========================================
// 2. Custom Tooltip (กล่องข้อความเมื่อชี้กราฟ)
// ==========================================
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-sm mb-1">{label}</p>
                <p className="text-[#1a4d2e] font-black text-lg">
                    {typeof payload[0].value === 'number' 
                        ? `฿${payload[0].value.toLocaleString()}` 
                        : payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};


function AdminDashboard() {
    const { token, logout } = useAuth();
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    // ✅ State เก็บข้อมูลสถิติ
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
        province_data: [],
        logs: []
    });
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date()); // วันที่เลือก
    const [viewMode, setViewMode] = useState('daily');
    const [selectedProvince, setSelectedProvince] = useState(null); // ✅ State for selected province modal // daily, monthly, yearly
    const [errorMsg, setErrorMsg] = useState(null);

    // ==========================================
    // 3. Data Fetching (ดึงข้อมูลถิติ)
    // ==========================================
    const fetchStats = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const activeToken = token || localStorage.getItem('token');
            if (!activeToken) {
                 setErrorMsg("No Token Found");
                 return;
            }

            // Fix Timezone Issue
            const dateParam = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

            // Request API
            const response = await axios.get(`http://localhost:8000/api/admin/dashboard-stats/`, {
                params: { period: viewMode, date: dateParam },
                headers: { Authorization: `Token ${activeToken}` }
            });

            // Set Data
            setStats(response.data);

        } catch (error) {
            console.error("Dashboard Stats Fail:", error);
            setErrorMsg(error.message);
            if (error.response && error.response.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [selectedDate, viewMode, logout, token]);

    // Initial Fetch
    useEffect(() => {
        if (activeTab === 'dashboard') fetchStats();
    }, [fetchStats, activeTab]);


    // ==========================================
    // 4. Content Rendering (ส่วนแสดงผล)
    // ==========================================
    const renderContent = () => {
        // Tab Routing
        if (activeTab === 'products') return <ProductListAdmin />;
        if (activeTab === 'orders') return <AdminOrders />;
        if (activeTab === 'users') return <UserListAdmin />;
        if (activeTab === 'history') return <AdminStockHistory />;
        if (activeTab === 'map') return <AdminMapDashboard salesData={stats.sales_data} provinceData={stats.province_data} />;
        if (activeTab === 'logs') return <AdminActivityLogs />;

        // --- DASHBOARD OVERVIEW ---
        return (
            <div className="space-y-6 animate-fade-in pb-10">
                
                {/* --- Row 1: Key Metrics (Info Boxes) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <InfoBox 
                        title="New Orders" 
                        value={stats.pending_orders || 0} 
                        icon={<ShoppingBag size={64} />} 
                        bgColor="bg-[#17a2b8]" // Info (Teal/Cyan)
                        link="/admin/orders"
                    />
                    <InfoBox 
                        title="Total Sales" 
                        value={`฿${(stats.total_sales || 0).toLocaleString()}`} 
                        icon={<DollarSign size={64} />} 
                        bgColor="bg-[#28a745]" // Success (Green)
                        link="#"
                    />
                    <InfoBox 
                        title="User Registrations" 
                        value={stats.total_users || 0} 
                        icon={<Users size={64} />} 
                        bgColor="bg-[#ffc107]" // Warning (Yellow)
                        link="/admin/users"
                    />
                    <InfoBox 
                        title="Total Orders" 
                        value={stats.total_orders || 0} 
                        icon={<PieChartIcon size={64} />} 
                        bgColor="bg-[#dc3545]" // Danger (Red)
                        link="#"
                    />
                </div>



                {/* --- Row 2: Map & Province Detail (Redesigned) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    
                    {/* Map Section (Larger, 3 cols) */}
                    <div className="lg:col-span-3 bg-[#e3e9e5] rounded-3xl shadow-sm border border-white/50 overflow-hidden relative flex flex-col min-h-[500px]">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-black text-[#1a4d2e] flex items-center gap-2">
                                <MapIcon size={20} /> พื้นที่ให้บริการ
                            </h3>
                            <p className="text-xs text-gray-500 font-bold">ยอดขายรายจังหวัด</p>
                        </div>
                        <div className="flex-1 w-full h-full">
                             <DashboardMapWidget 
                                provinceData={stats.province_data} 
                                onProvinceSelect={(data) => setSelectedProvince(data)}
                             />
                        </div>
                    </div>

                    {/* Province Detail Card (Based on User Image) */}
                    <div className="lg:col-span-1">
                        {selectedProvince ? (
                            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 flex flex-col items-center text-center h-full animate-fade-in relative overflow-hidden">
                                {/* Decorative BG */}
                                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-green-50 to-transparent -z-0" />
                                
                                {/* Pin Icon */}
                                <div className="w-24 h-24 bg-[#E8F5E9] rounded-full flex items-center justify-center mb-6 shadow-inner relative z-10">
                                    <MapPin size={48} className="text-[#DC3545] fill-current drop-shadow-lg" />
                                </div>
                                
                                <h2 className="text-3xl font-black text-gray-800 mb-1 relative z-10">{selectedProvince.name}</h2>
                                <p className="text-sm font-bold text-gray-400 mb-6 relative z-10">ยอดขายสะสม</p>
                                
                                <p className="text-5xl font-black text-[#1a4d2e] mb-8 tracking-tight relative z-10">
                                    ฿{typeof selectedProvince.value === 'number' ? selectedProvince.value.toLocaleString() : selectedProvince.value}
                                </p>

                                {/* Best Seller Box */}
                                <div className="w-full bg-[#FFF3E0] rounded-2xl p-6 relative z-10">
                                    <div className="flex items-center justify-center gap-2 mb-2 text-[#E67E22] font-black uppercase tracking-wider text-xs">
                                        <div className="p-1 bg-white rounded-full shadow-sm"><span className="text-base">🏆</span></div>
                                        สินค้าขายดี (Best Seller)
                                    </div>
                                    <p className="text-lg font-bold text-gray-800 line-clamp-2">
                                        {selectedProvince.top_product || '-'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center h-full text-center opacity-60">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <MapPin size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400">เลือกจังหวัด</h3>
                                <p className="text-sm text-gray-400">คลิกที่แผนที่เพื่อดูรายละเอียด</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* --- Row 3: Best Sellers & Stock Alerts --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Best Sellers List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-yellow-50 to-orange-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-xl">🏆</span> สินค้าขายดี (Best Sellers)
                            </h3>
                            <a href="/admin/product/add" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-100 px-3 py-1 rounded-full transition-colors">ดูทั้งหมด</a>
                        </div>
                        <div className="p-2 space-y-1">
                             {stats.best_sellers?.slice(0, 5).map((product, i) => (
                                 <div key={i} className="flex items-center gap-4 p-3 hover:bg-orange-50/50 rounded-xl transition-all border border-transparent hover:border-orange-100 group">
                                     {/* Rank Badge */}
                                     <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm shrink-0
                                        ${i === 0 ? 'bg-yellow-400 text-yellow-900 shadow-yellow-200 shadow-md' : 
                                          i === 1 ? 'bg-gray-300 text-gray-700' : 
                                          i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-400'}`}>
                                        {i + 1}
                                     </div>
                                     
                                     {/* Product Image */}
                                     <div className="relative shrink-0">
                                        <img 
                                            src={product.thumbnail ? `http://localhost:8000${product.thumbnail}` : `https://ui-avatars.com/api/?name=${product.name}&background=random`}
                                            alt={product.name} 
                                            className="w-14 h-14 rounded-xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform"
                                            onError={(e) => {e.target.onerror = null; e.target.src = "/placeholder.png"}}
                                        />
                                     </div>

                                     {/* Info */}
                                     <div className="flex-1 min-w-0">
                                         <h4 className="font-bold text-gray-800 truncate text-sm mb-0.5">{product.name}</h4>
                                         <p className="text-xs text-gray-500 font-medium">ราคา: <span className="text-green-600 font-bold">฿{parseFloat(product.price).toLocaleString()}</span></p>
                                     </div>

                                     {/* Sales Badge */}
                                     <div className="text-right shrink-0">
                                         <span className="block text-lg font-black text-gray-800">{product.sales}</span>
                                         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sold</span>
                                     </div>
                                 </div>
                             ))}
                             {(!stats.best_sellers || stats.best_sellers.length === 0) && (
                                 <div className="p-8 text-center text-gray-400 italic">ไม่มีข้อมูลสินค้าขายดี</div>
                             )}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    {/* Low Stock Alerts (DataTable Style) */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" /> สินค้าใกล้หมด
                            </h3>
                            <span className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">Stock &lt; 10</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
                                    <tr>
                                        <th className="p-4 text-center w-16">#</th>
                                        <th className="p-4">สินค้า</th>
                                        <th className="p-4 text-center">คงเหลือ</th>
                                        <th className="p-4 text-center">สถานะ</th>
                                        <th className="p-4 text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats.low_stock && stats.low_stock.length > 0 ? (
                                        stats.low_stock.map((item, i) => (
                                            <tr key={i} className="hover:bg-red-50/30 transition-colors group">
                                                <td className="p-4 text-center text-gray-400 font-bold">{i + 1}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={item.thumbnail ? `http://localhost:8000${item.thumbnail}` : "/placeholder.png"} 
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                                                            alt={item.title}
                                                            onError={(e) => {e.target.onerror = null; e.target.src = "/placeholder.png"}}
                                                        />
                                                        <span className="font-bold text-gray-700 truncate max-w-[120px]" title={item.title}>
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="font-black text-red-600 text-lg">{item.stock}</span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="px-2 py-1 rounded bg-red-100 text-red-600 text-[10px] font-bold uppercase">Critical</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <a href={`/admin/product/edit/${item.id}`} className="inline-block px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-[#1a4d2e] hover:text-white hover:border-[#1a4d2e] transition-all shadow-sm">
                                                        Refill
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-green-500 opacity-60">
                                                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                                                        <span className="text-xl">🙌</span>
                                                    </div>
                                                    <p className="font-bold text-sm">สินค้าทุกชิ้นมีสต็อกเพียงพอ</p>
                                                </div>
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

    return (
        <div className="flex min-h-screen bg-[#F2F0E4]">
             <div className="flex-1 w-full p-6 md:p-10 transition-all">
                {/* --- Sticky Top Helper --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24 z-[30]">
                    <div>
                        <h1 className="text-2xl font-black text-[#1a4d2e] tracking-tight uppercase">
                            {activeTab === 'dashboard' ? 'Overview' : activeTab}
                        </h1>
                        <p className="text-xs text-gray-400 font-bold">
                             {viewMode === 'daily' && `Today: ${formatDate(selectedDate)}`}
                             {viewMode === 'monthly' && `Month: ${selectedDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}`}
                             {viewMode === 'yearly' && `Year: ${selectedDate.getFullYear() + 543}`}
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
                                    locale="th"
                                    className="text-xs font-black outline-none w-20 text-center text-gray-600 bg-transparent cursor-pointer"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-[#1a4d2e] font-black animate-pulse uppercase tracking-widest text-xs">กำลังประมวลผล...</p>
                    </div>
                ) : renderContent()}
            </div>
        </div>
    );
}

// ✅ StatCard Helper
const StatCard = ({ title, value, gradient, icon }) => (
    <div className={`p-6 rounded-[2rem] shadow-sm border border-transparent transition-all duration-500 hover:shadow-xl hover:-translate-y-2 bg-gradient-to-br ${gradient}`}>
        <div className="flex justify-between items-start gap-4">
            <div className="min-w-0 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">{title}</p>
                <h3 className="text-2xl lg:text-3xl font-black truncate">{value}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 bg-white/20 backdrop-blur-sm">
                {icon}
            </div>
        </div>
    </div>
);

export default AdminDashboard;