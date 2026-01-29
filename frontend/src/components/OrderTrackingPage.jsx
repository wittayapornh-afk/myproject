import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Package, Truck, Check, Clock, Phone, MapPin, 
    AlertCircle, Copy, MessageSquare, ChevronRight, Box, CheckCircle,
    CreditCard, RefreshCcw, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/formatUtils';
import Swal from 'sweetalert2';

const OrderTrackingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!token) return;
            try {
                const response = await axios.get('http://localhost:8000/api/orders/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                const foundOrder = response.data.find(o => String(o.id) === String(id));
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    console.error("Order not found");
                }
            } catch (error) {
                console.error("Fetch Order Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, token]);

    const handleCopyTracking = (trackNum) => {
        navigator.clipboard.writeText(trackNum || `TH-${id}-TRACK`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        Swal.fire({
            icon: 'success',
            title: 'คัดลอกแล้ว',
            text: 'คัดลอกเลขพัสดุเรียบร้อยแล้ว',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500
        });
    };

    const handleConfirmReceived = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการรับสินค้า?',
            text: 'คุณได้รับสินค้าถูกต้องและครบถ้วนแล้วใช่หรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1a4d2e',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่ ได้รับแล้ว',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`http://localhost:8000/api/orders/${id}/confirm-received/`, {}, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                Swal.fire('สำเร็จ!', 'ยืนยันการรับสินค้าเรียบร้อยแล้ว', 'success');
                window.location.reload();
            } catch (error) {
                Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
                <p className="text-gray-400 font-bold animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
             <Package size={64} className="text-gray-200" />
             <p className="font-bold text-gray-410 text-xl font-noto">ไม่พบข้อมูลคำสั่งซื้อ</p>
             <button onClick={() => navigate(-1)} className="bg-[#1a4d2e] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-900/10">กลับไปหน้าสั่งซื้อ</button>
        </div>
    );

    // 4 Steps Logic mapped to UI labels
    const steps = [
        { id: 'Paid', label: 'สั่งซื้อสำเร็จ', icon: Package },
        { id: 'Processing', label: 'ชำระเงินแล้ว', icon: CreditCard },
        { id: 'Shipped', label: 'กำลังจัดส่ง', icon: Truck },
        { id: 'Completed', label: 'สำเร็จ', icon: CheckCircle },
    ];

    const getStepStatus = (stepId) => {
        const orderStatusFlow = ['Pending', 'Paid', 'Processing', 'Shipped', 'Completed'];
        const currentIdx = orderStatusFlow.indexOf(order.status);
        const stepIdx = orderStatusFlow.indexOf(stepId);
        if (currentIdx === -1) return 'upcoming';
        if (stepIdx < currentIdx) return 'completed';
        if (stepIdx === currentIdx) return 'current';
        return 'upcoming';
    };

    // Timeline Mock for High-Fidelity look
    const timelineData = [
        { title: "พัสดุออกจากศูนย์คัดแยกสินค้า", location: "ศูนย์กระจายสินค้า วังน้อย", time: "13 ต.ค. 2023 | 14:20", active: order.status === 'Shipped' || order.status === 'Completed' },
        { title: "ผู้ส่งกำลังเตรียมพัสดุ", location: "คลังสินค้า บางนา", time: "13 ต.ค. 2023 | 09:15", active: order.status !== 'Pending' && order.status !== 'Paid' }
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-32 pt-10 font-noto">
            <div className="max-w-2xl mx-auto px-4">
                
                {/* 🔙 Navigation */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm">
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <h1 className="text-xl font-black text-gray-800">สถานะการจัดส่ง</h1>
                </div>

                {/* 🎫 Tracking ID Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">เลขพัสดุ</p>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-gray-900">TH{order.id}12345678</h2>
                                <button onClick={() => handleCopyTracking(`TH${order.id}12345678`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                    <Copy size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-black">
                            {order.status === 'Shipped' ? 'กำลังจัดส่ง' : 
                             order.status === 'Processing' ? 'เตรียมพัสดุ' :
                             order.status === 'Completed' ? 'ส่งสำเร็จ' : order.status}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                            <Truck size={24} />
                        </div>
                        <div>
                            <p className="font-black text-gray-800 text-sm">Flash Express</p>
                            <p className="text-xs text-blue-600 font-bold">คาดว่าจะได้รับวันที่ 15 ต.ค. 2023</p>
                        </div>
                    </div>
                </div>

                {/* 📊 Horizontal Progress Stepper */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-4 overflow-hidden">
                    <div className="relative flex justify-between items-center mb-8">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2" />
                        <div 
                            className="absolute top-1/2 left-0 h-0.5 bg-[#1a4d2e] -translate-y-1/2 transition-all duration-1000"
                            style={{ width: `${(steps.findIndex(s => s.id === order.status) / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((step, idx) => {
                            const status = getStepStatus(step.id);
                            const isActive = status === 'completed' || status === 'current';
                            return (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm ${
                                        isActive ? 'bg-[#1a4d2e] border-white text-white' : 'bg-white border-gray-100 text-gray-300'
                                    } ${status === 'current' ? 'ring-4 ring-green-100 scale-110 shadow-lg' : ''}`}>
                                        <step.icon size={20} />
                                    </div>
                                    <span className={`text-[10px] sm:text-xs font-black absolute -bottom-8 whitespace-nowrap ${isActive ? 'text-gray-800' : 'text-gray-300'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-4" /> {/* Spacer for labels */}
                </div>

                {/* 🛒 Item Section */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                        <Box size={16} className="text-[#1a4d2e]" /> รายการสินค้า
                    </h3>
                    <div className="space-y-4">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 border border-gray-100 flex-shrink-0">
                                    <img src={getImageUrl(item.thumbnail)} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-gray-800 leading-snug mb-1 line-clamp-2">{item.title}</h4>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-400 font-bold">ตัวเลือก: ไซส์ 42</p>
                                        <p className="font-black text-[#1a4d2e]">{formatPrice(item.price)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🕒 Detailed Status Timeline */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
                    <h3 className="text-sm font-black text-gray-800 mb-6 flex items-center gap-2">
                        <Clock size={16} className="text-[#1a4d2e]" /> รายละเอียดสถานะ
                    </h3>
                    <div className="space-y-8 pl-4">
                        {timelineData.map((item, idx) => (
                            <div key={idx} className="relative pl-8">
                                {/* Vertical Line */}
                                {idx !== timelineData.length - 1 && (
                                    <div className="absolute top-2 left-1.5 w-0.5 h-full bg-gray-100" />
                                )}
                                {/* Dot */}
                                <div className={`absolute top-1.5 left-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${item.active ? 'bg-[#1a4d2e]' : 'bg-gray-200'}`} />
                                
                                <div>
                                    <p className={`font-black text-sm mb-1 ${item.active ? 'text-[#1a4d2e]' : 'text-gray-400'}`}>
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-bold mb-1">
                                        <MapPin size={10} /> {item.location}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 📍 Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <button 
                        onClick={() => Swal.fire('Refund Requested', 'เราได้รับคำขอคืนเงินของคุณแล้ว เจ้าหน้าที่จะตรวจสอบข้อมูลภายใน 24 ชม.', 'info')}
                        className="flex-1 py-3.5 px-4 bg-gray-50 text-gray-600 font-black rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all active:scale-95"
                    >
                        คืนเงิน
                    </button>
                    <button 
                        onClick={handleConfirmReceived}
                        disabled={order.status !== 'Shipped'}
                        className={`flex-[2] py-3.5 px-4 font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                            ${order.status === 'Shipped' 
                                ? 'bg-[#1a4d2e] text-white shadow-green-900/10 hover:bg-[#143d24]' 
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200 shadow-none'
                            }`}
                    >
                        <CheckCircle size={20} />
                        ฉันได้รับสินค้าแล้ว
                    </button>
                </div>
            </div>

        </div>
    );
};

export default OrderTrackingPage;

