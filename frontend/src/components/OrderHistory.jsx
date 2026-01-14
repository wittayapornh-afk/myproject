import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/formatUtils';
import Swal from 'sweetalert2';
import {
    Package, CalendarDays, Clock, ChevronRight, ShoppingBag, 
    ChevronLeft, RotateCw, Search, CheckCircle, Truck, XCircle, AlertCircle
} from 'lucide-react';
import PaymentModal from './PaymentModal';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // --- Pagination & Filter ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // --- Payment Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [selectedOrderTotal, setSelectedOrderTotal] = useState(0);
    const [selectedQrPayload, setSelectedQrPayload] = useState(null);

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8000/api/orders/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error("Fetch Orders Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const handleOpenPayment = (order) => {
        setSelectedOrderId(order.id);
        setSelectedOrderTotal(order.total_price);
        setSelectedQrPayload(order.promptpay_payload);
        setIsModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        fetchOrders(); 
    };

    const handleReorder = (order) => {
        if (!order.items || order.items.length === 0) return;
        order.items.forEach(item => {
            const productToAdd = { ...item, id: item.product || item.id };
            addToCart(productToAdd, item.quantity);
        });
        Swal.fire({
            icon: 'success',
            title: 'เพิ่มสินค้าลงตะกร้าแล้ว',
            showConfirmButton: false,
            timer: 1500,
            background: '#fff',
            customClass: { title: 'text-[#1a4d2e] font-bold' }
        });
        navigate('/cart');
    };

    // --- Filtering Logic ---
    const filteredOrders = orders.filter(order => {
        const matchSearch = order.id.toString().includes(searchTerm) || 
                            order.items.some(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status, hasSlip) => {
        if (status === 'Pending') {
            return hasSlip 
                ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-50 text-amber-600 border border-amber-100"><Clock size={12}/> รอตรวจสอบ</span>
                : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-gray-100 text-gray-500 border border-gray-200"><AlertCircle size={12}/> รอชำระเงิน</span>;
        }
        if (status === 'Paid') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-blue-50 text-blue-600 border border-blue-100"><CheckCircle size={12}/> ชำระแล้ว</span>;
        if (status === 'Shipped') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-indigo-50 text-indigo-600 border border-indigo-100"><Truck size={12}/> จัดส่งแล้ว</span>;
        if (status === 'Completed') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-green-50 text-green-600 border border-green-100"><CheckCircle size={12}/> สำเร็จ</span>;
        if (status === 'Cancelled') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-50 text-red-600 border border-red-100"><XCircle size={12}/> ยกเลิก</span>;
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{status}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5]">
                <div className="w-12 h-12 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans selection:bg-[#1a4d2e] selection:text-white pb-20">
            
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all">
                <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <h1 className="text-2xl font-black text-[#1a4d2e] tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a4d2e] to-[#143d24] flex items-center justify-center text-white shadow-lg shadow-green-900/20">
                            <ShoppingBag size={20} />
                        </div>
                        My Orders
                    </h1>
                    <button onClick={() => navigate('/')} className="text-xs font-bold text-gray-400 hover:text-[#1a4d2e] bg-gray-50 hover:bg-white px-4 py-2 rounded-xl transition-all border border-transparent hover:border-gray-200 flex items-center gap-2 group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Shop
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-6">
                
                {/* 🔍 Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white p-2 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center">
                        <div className="pl-4 text-gray-400"><Search size={20}/></div>
                        <input 
                            type="text" 
                            placeholder="ค้นหาเลขคำสั่งซื้อ หรือ ชื่อสินค้า..." 
                            className="w-full h-12 pl-3 pr-4 outline-none text-sm font-bold text-gray-700 bg-transparent placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                        />
                    </div>
                    
                    <div className="bg-white p-2 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center relative group">
                        <select 
                            className="w-full h-12 pl-4 pr-10 outline-none text-sm font-bold text-gray-700 bg-transparent appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                        >
                            <option value="All">สถานะ: ทั้งหมด</option>
                            <option value="Pending">รอชำระ / ตรวจสอบ</option>
                            <option value="Paid">ชำระแล้ว</option>
                            <option value="Shipped">จัดส่งแล้ว</option>
                            <option value="Completed">สำเร็จ</option>
                            <option value="Cancelled">ยกเลิก</option>
                        </select>
                        <div className="absolute right-4 text-gray-400 pointer-events-none group-hover:text-[#1a4d2e] transition-colors"><ChevronRight size={16} className="rotate-90"/></div>
                    </div>
                </div>

                {/* 📋 Data Table */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center animate-fade-in-up">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 relative">
                            <Package size={48} />
                            {searchTerm ? <div className="absolute top-0 right-0 text-2xl">🔍</div> : <div className="absolute top-0 right-0 text-2xl">🛒</div>}
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">{searchTerm ? 'ไม่พบออเดอร์ที่ค้นหา' : 'ยังไม่มีประวัติการสั่งซื้อ'}</h3>
                        <p className="text-gray-400 font-bold text-sm mb-8 max-w-xs">{searchTerm ? 'ลองเปลี่ยนคำค้นหา หรือ เลือกสถานะอื่น' : 'สินค้าดีๆ รอคุณอยู่ เริ่มช้อปเลย!'}</p>
                        {!searchTerm && (
                            <button onClick={() => navigate('/shop')} className="bg-[#1a4d2e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#153e25] transition-all shadow-lg shadow-green-900/10">
                                ไปยังร้านค้า
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#F8F9FA] text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="p-6 w-24">Order ID</th>
                                        <th className="p-6 w-40">Date</th>
                                        <th className="p-6">Items</th>
                                        <th className="p-6 text-right w-32">Total</th>
                                        <th className="p-6 text-center w-32">Status</th>
                                        <th className="p-6 text-right w-40">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-6 align-top">
                                                <span className="font-mono text-xs font-bold text-[#1a4d2e] bg-green-50 px-2 py-1 rounded-lg">#{order.id}</span>
                                            </td>
                                            <td className="p-6 align-top text-xs font-bold text-gray-500">
                                                <div className="flex items-center gap-2"><CalendarDays size={14} className="text-gray-300"/> {order.date.split(' ')[0]}</div>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 pl-6">{order.date.split(' ')[1]}</div>
                                            </td>
                                            <td className="p-6 align-top">
                                                <div className="space-y-3">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <img src={getImageUrl(item.thumbnail)} className="w-8 h-8 rounded-lg object-cover bg-gray-100 border border-gray-100" onError={(e)=>e.target.src="/placeholder.png"} />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{item.title}</p>
                                                                <p className="text-[10px] text-gray-400">x{item.quantity} · {formatPrice(item.price)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-6 align-top text-right">
                                                <span className="text-sm font-black text-gray-800">{formatPrice(order.total_price)}</span>
                                            </td>
                                            <td className="p-6 align-top text-center">
                                                {getStatusBadge(order.status, order.has_slip)}
                                            </td>
                                            <td className="p-6 align-top text-right">
                                                <div className="flex flex-col gap-2 items-end">
                                                    {order.status === 'Pending' && !order.has_slip && (
                                                        <button onClick={() => handleOpenPayment(order)} className="px-3 py-1.5 bg-[#1a4d2e] text-white text-[10px] font-bold rounded-lg hover:bg-[#153e25] transition-all shadow-md shadow-green-900/10 w-full md:w-auto">
                                                            ชำระเงิน
                                                        </button>
                                                    )}
                                                    {['Completed', 'Shipped', 'Cancelled'].includes(order.status) && (
                                                        <button onClick={() => handleReorder(order)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-bold rounded-lg hover:border-[#1a4d2e] hover:text-[#1a4d2e] transition-all w-full md:w-auto">
                                                            ซื้อซ้ำ
                                                        </button>
                                                    )}
                                                    {order.status === 'Shipped' && (
                                                        <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold rounded-lg hover:bg-indigo-100 transition-all w-full md:w-auto">
                                                            ติดตามพัสดุ
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-[#FCFCFD]">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-black text-gray-400">Page {currentPage} of {totalPages}</span>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PaymentModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                orderId={selectedOrderId}
                orderTotal={selectedOrderTotal}
                promptPayPayload={selectedQrPayload}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}

export default OrderHistory;
