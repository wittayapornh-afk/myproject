import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/formatUtils';
import Swal from 'sweetalert2';
import {
    Package,
    CalendarDays,
    Clock,
    ChevronLeft,
    RotateCw,
    Truck,
    MapPin, // ✅ Import MapPin
    CheckCircle,
    XCircle,
    CreditCard,
    Box
} from 'lucide-react';
import PaymentModal from './PaymentModal';

function TrackingPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const { token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // Payment Modal State
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

    const handleReorder = (order) => {
        if (!order.items || order.items.length === 0) return;
        order.items.forEach(item => {
             const productToAdd = { ...item, id: item.product || item.id };
            addToCart(productToAdd, item.quantity);
        });
        Swal.fire({ icon: 'success', title: 'เพิ่มสินค้าลงตะกร้าแล้ว', showConfirmButton: false, timer: 1500 });
        navigate('/cart');
    };

    const handleOpenPayment = (order) => {
        setSelectedOrderId(order.id);
        setSelectedOrderTotal(order.total_price);
        setSelectedQrPayload(order.promptpay_payload);
        setIsModalOpen(true);
    };

    const handlePaymentSuccess = () => fetchOrders();



    // Tabs Configuration
    const TABS = [
        { id: 'All', label: 'ทั้งหมด', icon: Box },
        { id: 'Pending', label: 'ที่ต้องชำระ', icon: CreditCard },
        { id: 'Processing', label: 'ที่ต้องจัดส่ง', icon: Package },
        { id: 'Shipped', label: 'ที่ต้องได้รับ', icon: Truck },
        { id: 'Completed', label: 'สำเร็จ', icon: CheckCircle },
        { id: 'Cancelled', label: 'ยกเลิก', icon: XCircle },
    ];

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Pending') return order.status === 'Pending' && !order.has_slip; // Wait for payment
        if (activeTab === 'Processing') return (order.status === 'Pending' && order.has_slip) || order.status === 'Processing'; // Paid/Slip uploaded
        return order.status === activeTab;
    });

    if (loading) return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
            </div>
    );

    return (
        <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 md:px-8 pt-28 font-sans">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-[#1a4d2e] transition-colors mb-6 font-bold">
                    <ChevronLeft size={20} /> กลับสู่หน้าหลัก
                </button>

                <h1 className="text-3xl font-black text-[#263A33] mb-8 flex items-center gap-3">
                    <Truck className="text-[#1a4d2e]" /> ติดตามสถานะคำสั่งซื้อ
                </h1>

                {/* Tabs */}
                <div className="flex overflow-x-auto pb-4 gap-2 mb-6 scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#1a4d2e] text-white shadow-lg shadow-green-200' 
                                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-8">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 group">
                                
                                {/* Header: ID & Status */}
                                <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
                                     <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-[#1a4d2e]/5 rounded-xl text-[#1a4d2e]">
                                                <Box size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                                <p className="text-xl font-black text-[#263A33]">#{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                            <CalendarDays size={14} /> {order.date}
                                        </div>
                                        {/* ✅ Display Province */}
                                        {order.province && (
                                            <div className="flex items-center gap-2 text-xs text-[#1a4d2e] font-bold bg-green-50 px-3 py-1.5 rounded-lg w-fit mt-2">
                                                <MapPin size={14} /> {order.province}
                                            </div>
                                        )}
                                     </div>

                                     {/* Status Badge */}
                                     <div className={`px-5 py-2 rounded-2xl flex items-center gap-2 ${
                                            order.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                            order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                                            (order.status === 'Pending' && order.has_slip) ? 'bg-blue-100 text-blue-700' :
                                            order.status === 'Processing' ? 'bg-orange-100 text-orange-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {order.status === 'Completed' && <CheckCircle size={18} className="animate-bounce-short" />}
                                            {order.status === 'Shipped' && <Truck size={18} className="animate-pulse" />}
                                            {(order.status === 'Pending' && !order.has_slip) && <CreditCard size={18} />}
                                            
                                            <span className="font-black uppercase tracking-tight text-sm">
                                                {order.status === 'Pending' ? (order.has_slip ? 'รอตรวจสอบยอด' : 'รอชำระเงิน') : 
                                                 order.status === 'Shipped' ? 'อยู่ระหว่างจัดส่ง' : 
                                                 order.status === 'Processing' ? 'กำลังเตรียมพัสดุ' :
                                                 order.status === 'Completed' ? 'จัดส่งสำเร็จ' :
                                                 order.status}
                                            </span>
                                     </div>
                                </div>

                                {/* Progress Stepper (Visual) */}
                                {['Pending', 'Processing', 'Shipped', 'Completed'].includes(order.status) && (
                                    <div className="mb-8 px-4">
                                        {/* 🎓 Concept: ใช้วิธีเปลี่ยนความกว้าง (Width) ของ div สีเขียวเพื่อสร้าง Effect Progress Bar */}
                                        <div className="flex justify-between relative">
                                            {/* Background Line (สีเทา) */}
                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                                            
                                            {/* Active Progress Line (สีเขียววิ่งตามสถานะ) */}
                                            {/* 🎓 Logic: เช็ค status เพื่อกำหนด class w-[%] */}
                                            <div className={`absolute top-1/2 left-0 h-1 bg-[#1a4d2e] -z-10 rounded-full transition-all duration-1000 ${
                                                order.status === 'Pending' ? 'w-[15%]' : 
                                                order.status === 'Processing' ? 'w-[50%]' : 
                                                order.status === 'Shipped' ? 'w-[80%]' : 
                                                'w-[100%]'
                                            }`}></div>

                                            {/* Steps Loop */}
                                            {['ได้รับการสั่งซื้อ', 'กำลังเตรียมพัสดุ', 'อยู่ระหว่างจัดส่ง', 'จัดส่งสำเร็จ'].map((step, index) => {
                                                // 🎓 Calculation: คำนวณว่า Step นี้ผ่านไปหรือยัง โดยดูจาก index เทียบกับ status ปัจจุบัน
                                                const isActive = 
                                                    (order.status === 'Pending' && index === 0) ||
                                                    (order.status === 'Processing' && index <= 1) ||
                                                    (order.status === 'Shipped' && index <= 2) ||
                                                    (order.status === 'Completed' && index <= 3);
                                                
                                                const isCurrent = 
                                                    (order.status === 'Pending' && index === 0) ||
                                                    (order.status === 'Processing' && index === 1) ||
                                                    (order.status === 'Shipped' && index === 2) ||
                                                    (order.status === 'Completed' && index === 3);

                                                return (
                                                    <div key={index} className="flex flex-col items-center gap-2 relative">
                                                        {/* Icon Circle */}
                                                        <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-white transition-all duration-500 z-10 ${
                                                            isActive ? 'border-[#1a4d2e] text-[#1a4d2e] scale-110 shadow-lg' : 'border-gray-200 text-gray-300'
                                                        } ${isCurrent ? 'animate-bounce-slight ring-4 ring-green-100' : ''}`}>
                                                            {index === 0 && <Package size={16} />}
                                                            {index === 1 && <Box size={16} />}
                                                            {index === 2 && <Truck size={16} />}
                                                            {index === 3 && <CheckCircle size={16} />}
                                                        </div>
                                                        
                                                        {/* Label */}
                                                        <span className={`text-[10px] md:text-xs font-bold uppercase transition-colors duration-300 ${
                                                            isActive ? 'text-[#1a4d2e]' : 'text-gray-300'
                                                        }`}>
                                                            {step}
                                                        </span>

                                                        {/* 🎓 Conditional Rendering: แสดงวันที่ถ้ามี (Ex. Completed ให้โชว์วันที่รับ) */}
                                                        {isCurrent && (
                                                            <div className="absolute -bottom-6 w-24 text-center bg-[#1a4d2e] text-white text-[9px] py-0.5 rounded px-1 opacity-80">
                                                                Current Status
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6 group/item hover:bg-white p-3 rounded-2xl transition-colors">
                                            <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm p-1">
                                                <img src={getImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-bold text-gray-800 truncate mb-1">{item.title}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-lg font-bold">x{item.quantity}</span>
                                                    <span className="text-[#1a4d2e] font-black">{formatPrice(item.price)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer & Actions */}
                                <div className="mt-8 flex flex-wrap justify-between items-end gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ยอดสุทธิ</p>
                                        <p className="text-3xl font-black text-[#263A33] tracking-tight">{formatPrice(order.total_price)}</p>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        {/* Actions */}
                                        {['Completed', 'Cancelled'].includes(order.status) && (
                                            <button onClick={() => handleReorder(order)} className="px-6 py-3 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:border-[#1a4d2e] hover:text-[#1a4d2e] transition-all flex items-center gap-2 hover:shadow-lg hover:-translate-y-1">
                                                <RotateCw size={18} /> ซื้อซ้ำ
                                            </button>
                                        )}
                                        {order.status === 'Pending' && !order.has_slip && (
                                            <button onClick={() => handleOpenPayment(order)} className="px-8 py-3 bg-[#1a4d2e] text-white rounded-2xl text-sm font-bold hover:bg-[#143d23] shadow-lg shadow-green-200 hover:shadow-green-300 transition-all hover:-translate-y-1 flex items-center gap-2">
                                                <CreditCard size={18} /> ชำระเงินทันที
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 animate-pulse">
                                <Box size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400 mb-2">ไม่พบรายการคำสั่งซื้อ</h3>
                            <p className="text-gray-300 text-sm">ลองเลือกแท็บสถานะอื่น หรือเริ่มช้อปปิ้งเลย</p>
                        </div>
                    )}
                </div>
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

export default TrackingPage;
