import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Plus, Trash2, X, Package, TrendingDown, Calendar, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DatePickerStyles = () => (
    <style>{`
        #flash-sale-root .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 2.5rem;
            border-radius: 2.5rem;
            border: none;
            box-shadow: 0 25px 50px -12px rgba(234, 88, 12, 0.3);
            background: white;
            overflow: hidden;
            border: 1px solid rgba(234, 88, 12, 0.1);
            font-family: 'Inter', sans-serif !important;
        }
        #flash-sale-root .react-datepicker__header {
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%) !important; /* Force Orange/Red */
            border-bottom: none;
            padding: 1.5rem 0;
        }
        #flash-sale-root .react-datepicker__current-month, 
        #flash-sale-root .react-datepicker__day-name,
        #flash-sale-root .react-datepicker-time__header {
            color: white !important;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.75rem;
        }
        #flash-sale-root .react-datepicker__day {
            color: #4b5563;
            font-weight: 600;
            margin: 0.2rem;
            width: 2rem;
            line-height: 2rem;
            transition: all 0.2s;
        }
        #flash-sale-root .react-datepicker__day:hover {
            background-color: #fff7ed !important;
            color: #ea580c !important;
            border-radius: 0.6rem;
            transform: scale(1.1);
        }
        #flash-sale-root .react-datepicker__day--selected, 
        #flash-sale-root .react-datepicker__day--keyboard-selected,
        #flash-sale-root .react-datepicker__time-list-item--selected {
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%) !important;
            color: white !important;
            border-radius: 0.6rem;
            box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
        }
        #flash-sale-root .react-datepicker__day--today {
            color: #ea580c;
            font-weight: 900;
            position: relative;
        }
        #flash-sale-root .react-datepicker__day--today::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background: #ea580c;
            border-radius: 9999px;
        }
        #flash-sale-root .react-datepicker__time-container {
            border-left: 1px solid #fff7ed !important;
            width: 90px !important;
        }
        #flash-sale-root .react-datepicker__time-header {
            color: #ea580c !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            font-size: 0.8rem !important;
        }
        #flash-sale-root .react-datepicker__navigation-icon::before {
             border-color: white !important;
             border-width: 2px 2px 0 0 !important;
        }
        #flash-sale-root .react-datepicker__day--outside-month {
            color: #e5e7eb !important;
        }
    `}</style>
);

const FlashSaleManagement = () => {
    // ✅ Auth Context
    const { user, token: authContextToken } = useAuth();
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        start_time: '',
        end_time: '',
        is_active: true,
        products: [] 
    });
    
    // For selecting products
    const [selectedProduct, setSelectedProduct] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [limit, setLimit] = useState(10);
    const [discountType, setDiscountType] = useState('percent'); // 'percent' | 'fixed'
    const [discountInput, setDiscountInput] = useState('10'); // Default 10%
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [tempSelectedProducts, setTempSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toString().includes(searchTerm)
    );

    const confirmBulkAdd = () => {
        if (tempSelectedProducts.length === 0) return setShowProductSelector(false);
        if (!salePrice) return Swal.fire('Oops', 'กรุณาระบุราคาโปรโมชั่น (Global Price)', 'warning');

        const newItems = tempSelectedProducts.map(id => {
            const prod = products.find(p => p.id === id);
            return {
                product_id: parseInt(id),
                product_name: prod.title,
                original_price: prod.price,
                sale_price: parseFloat(salePrice),
                limit: parseInt(limit) || 10
            };
        });

        setFormData(prev => ({
            ...prev,
            products: [...prev.products, ...newItems]
        }));
        
        setTempSelectedProducts([]);
        setShowProductSelector(false);
        // Do not reset salePrice/limit immediately to allow adding more batches with same settings if needed, or reset if preferred.
    };
    
    // Refs for DatePickers
    const startDateRef = React.useRef(null);
    const endDateRef = React.useRef(null);

    const API_BASE_URL = "http://localhost:8000";



    useEffect(() => {
        fetchFlashSales();
        fetchProducts();
    }, []);

    const fetchFlashSales = async () => {
        try {
            const token = authContextToken || localStorage.getItem('token');
            console.log("Fetching Flash Sales with Token:", token ? `Found (${token.substring(0, 10)}...)` : "MISSING");
            if (!token) {
                console.warn("No token found aborting fetch");
                return;
            }
            const res = await axios.get(`${API_BASE_URL}/api/admin/flash-sales/`, {
                headers: { Authorization: `Token ${token}` }
            });

            setFlashSales(res.data);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                Swal.fire({
                    title: 'Session หมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่',
                    icon: 'warning',
                    confirmButtonText: 'ไปหน้า Login'
                }).then(() => {
                    localStorage.removeItem('token'); // Clear invalid token
                    localStorage.removeItem('user');
                    window.location.href = '/admin/login'; // Redirect to Admin Login
                });
                console.warn("Unauthorized access to Flash Sales. Please re-login manually if needed.");
            }
        }
    };

    const fetchProducts = async () => {
        try {
            console.log("Fetching ALL Products (Public Mode)..."); // Debug Log
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/products/`); // ✅ Use existing Public API
            const productsList = res.data.results || res.data; // ✅ Handle Pagination
            setProducts(productsList);
        } catch (error) { 
            console.error(error); 
            if (error.response && error.response.status === 401) {
                // Already handled in fetchFlashSales usually, but good to be safe
            }
        }
    };

    const addProductToSale = () => {
        if (!selectedProduct || !salePrice) return;
        
        const prod = products.find(p => p.id === parseInt(selectedProduct));
        if (!prod) return;
        
        const newItem = {
            product_id: parseInt(selectedProduct),
            product_name: prod.title,
            original_price: prod.price,
            sale_price: parseFloat(salePrice),
            limit: parseInt(limit)
        };
        
        setFormData({
            ...formData,
            products: [...formData.products, newItem]
        });
        
        setSelectedProduct('');
        setSalePrice('');
        setLimit(10);
    };

    const removeProductFromSale = (index) => {
        const newProds = [...formData.products];
        newProds.splice(index, 1);
        setFormData({ ...formData, products: newProds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Validation: Check if products selected
        if (formData.products.length === 0) {
            return Swal.fire('Error', 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ', 'warning');
        }

        try {
            const token = authContextToken || localStorage.getItem('token');
            console.log("Submitting Flash Sale. Token:", token ? `Found (${token.substring(0, 10)}...)` : "MISSING"); // DEBUG TOKEN
            if (!token) {
                Swal.fire({
                    title: 'Error', 
                    text: 'ไม่พบ Token กรุณา Login ใหม่', 
                    icon: 'error'
                }).then(() => {
                     window.location.href = '/admin/login';
                });
                return;
            }
            await axios.post(`${API_BASE_URL}/api/admin/flash-sales/`, formData, {
                headers: { Authorization: `Token ${token}` }
            });
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'บันทึก Flash Sale เรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: '#f97316'
            });
            setShowModal(false);
            fetchFlashSales();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                Swal.fire({
                    title: 'Session หมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่',
                    icon: 'warning',
                    confirmButtonText: 'ไปหน้า Login'
                }).then(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/admin/login';
                });
                console.warn("Unauthorized: Cannot save flash sale.");
            } else {
                Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ 
            title: 'ยืนยันการลบ?', 
            text: "ข้อมูลแคมเปญจะหายไปถาวร",
            icon: 'warning', 
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ลบแคมเปญนี้'
        });
        if (result.isConfirmed) {
            try {
                // ✅ Fix: Use context token first
                const token = authContextToken || localStorage.getItem('token');
                
                // ✅ Fix: Pass ID in URL for Django Router
                const url = `${API_BASE_URL}/api/admin/flash-sales/${id}/`;
                
                await axios.delete(url, {
                    headers: { Authorization: `Token ${token}` }
                });

                Swal.fire('Deleted!', 'ลบแคมเปญเรียบร้อยแล้ว', 'success');
                fetchFlashSales();
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // Swal.fire({ title: 'Session หมดอายุ', text: 'กรุณาเข้าสู่ระบบใหม่', icon: 'warning', confirmButtonText: 'ไปหน้า Login' }).then(() => window.location.href = '/login');
                    console.warn("Unauthorized: Cannot delete flash sale.");
                } else {
                    Swal.fire('Error', 'ลบไม่สำเร็จ', 'error'); 
                }
            }
        }
    };

    return (
        <div id="flash-sale-root" className="p-8 bg-gray-50/50 min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
             <div className="max-w-7xl mx-auto flex flex-col items-center mb-16 text-center">
                <div className="flex flex-col items-center">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-600 rounded-3xl text-white shadow-2xl shadow-orange-200 animate-pulse">
                            <Zap size={36} fill="white" />
                        </div>
                        Flash <span className="text-orange-600">Sale</span> Center
                    </h1>
                    <p className="text-gray-500 font-bold text-lg max-w-xl">จัดการแคมเปญลดราคาสายฟ้าฟาด เพื่อกระตุ้นยอดขายและความตื่นเต้นให้ลูกค้าของคุณ</p>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        setFormData({ name: '', start_time: new Date(), end_time: new Date(Date.now() + 86400000), is_active: true, products: [] });
                        setShowModal(true);
                    }}
                    className="mt-8 group bg-gradient-to-r from-orange-500 to-red-600 text-white pl-8 pr-10 py-5 rounded-[2rem] hover:shadow-2xl hover:shadow-orange-300 transition-all flex items-center gap-4 font-black text-xl"
                >
                    <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>สร้างแคมเปญใหม่</span>
                </motion.button>
            </div>
            <DatePickerStyles />

            <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto">
                {flashSales.length > 0 ? flashSales.map((fs) => (
                    <motion.div 
                        key={fs.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-orange-100/30 transition-all group"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <h3 className="text-2xl font-black text-gray-800">{fs.name}</h3>
                                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                        fs.status === 'Live' 
                                        ? 'bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse' 
                                        : fs.status === 'Ended' 
                                          ? 'bg-gray-100 text-gray-500' 
                                          : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                    }`}>
                                        {fs.status === 'Live' && <Zap size={12} fill="currentColor" />}
                                        {fs.status}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6 mt-4 text-sm font-bold text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-orange-400" />
                                        <span>{new Date(fs.start_time).toLocaleString('th-TH')} - {new Date(fs.end_time).toLocaleString('th-TH')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package size={18} className="text-orange-400" />
                                        <span>{fs.products.length} รายการสินค้า</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                                <button 
                                    onClick={() => handleDelete(fs.id)} 
                                    className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300 transform active:scale-90"
                                    title="Delete Campaign"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                        
                        {/* Products List Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {fs.products.map((p, idx) => (
                                <div key={idx} className="bg-gray-50/50 p-5 rounded-[2rem] border border-gray-100 hover:bg-white hover:border-orange-200 transition-all group/item hover:shadow-lg relative overflow-hidden">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-sm shrink-0 overflow-hidden border border-gray-100">
                                            <img src={p.product_image ? (p.product_image.startsWith('http') ? p.product_image : `${API_BASE_URL}${p.product_image}`) : "/placeholder.png"} className="w-full h-full object-cover rounded-xl" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-gray-800 line-clamp-1 group-hover/item:text-orange-600 transition-colors uppercase tracking-tight">{p.product_name}</p>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-xl font-black text-orange-600 tracking-tighter mt-1">฿{parseInt(p.sale_price).toLocaleString()}</span>
                                                <span className="text-xs text-gray-400 line-through font-bold">฿{parseInt(p.original_price).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                     {/* Progress Bar with modern look */}
                                     <div className="space-y-1.5 pt-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <span>ขายแล้ว</span>
                                            <span>{p.sold_count}/{p.quantity_limit}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner flex">
                                            <div 
                                                className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full shadow-lg shadow-orange-300/50" 
                                                style={{ width: `${Math.min((p.sold_count / p.quantity_limit) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                     </div>

                                     <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg transform rotate-12 group-hover/item:rotate-0 transition-transform">
                                        -{Math.round((1 - p.sale_price/p.original_price) * 100)}%
                                     </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Zap size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">ยังไม่มีแคมเปญ Flash Sale</h3>
                        <h3 className="font-bold text-gray-700 mb-4">จัดการ Flash Sale (New System)</h3>
                        <p className="text-gray-400 mt-2">เริ่มต้นสร้างแคมเปญแรกเลยตอนนี้!</p>
                    </div>
                )}
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-orange-950/20 backdrop-blur-md" 
                            onClick={() => setShowModal(false)} 
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col relative z-[1001] border border-white"
                        >
                            {/* Modal Header */}
                             <div className="p-10 bg-gradient-to-br from-orange-500 to-red-600 text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                                <div className="relative">
                                    <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <Zap size={32} fill="white" />
                                        Create <span className="text-orange-200">Flash Sale</span>
                                    </h2>
                                    <p className="text-orange-100 font-bold text-sm mt-1 opacity-80 uppercase tracking-widest">จัดการข้อมูลแคมเปญ</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar bg-white">
                                <div className="space-y-8">
                                    {/* Campaign Basic Info */}
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="relative group">
                                            <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 ml-4">ชื่อแคมเปญ</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g., Midnight Mega Sale"
                                                value={formData.name} 
                                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                                className="w-full bg-gray-50 border-2 border-transparent group-hover:bg-white focus:bg-white focus:border-orange-500 rounded-[1.5rem] px-6 py-4 font-bold text-gray-800 outline-none transition-all shadow-inner" 
                                                required 
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="relative group">
                                                <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 ml-4">เวลาเริ่ม</label>
                                                <div className="relative">
                                                    <DatePicker 
                                                        ref={startDateRef}
                                                        selected={formData.start_time ? new Date(formData.start_time) : null}
                                                        onChange={date => setFormData({...formData, start_time: date})}
                                                        showTimeSelect
                                                        dateFormat="Pp"
                                                        calendarClassName="font-sans border-0 shadow-2xl"
                                                        className="w-full bg-gray-50 border-2 border-transparent group-hover:bg-white focus:bg-white focus:border-orange-500 rounded-[1.5rem] px-4 py-3 font-bold text-gray-800 outline-none transition-all shadow-inner w-full block text-sm" 
                                                        required 
                                                    />
                                                    <Calendar 
                                                        size={20} 
                                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-300 cursor-pointer hover:text-orange-500 transition-colors"
                                                        onClick={() => startDateRef.current.setFocus()}
                                                    />
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <label className="block text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 ml-4">เวลาสิ้นสุด</label>
                                                <div className="relative">
                                                    <DatePicker 
                                                        ref={endDateRef}
                                                        selected={formData.end_time ? new Date(formData.end_time) : null}
                                                        onChange={date => setFormData({...formData, end_time: date})}
                                                        showTimeSelect
                                                        dateFormat="Pp"
                                                        calendarClassName="font-sans border-0 shadow-2xl"
                                                        className="w-full bg-gray-50 border-2 border-transparent group-hover:bg-white focus:bg-white focus:border-orange-500 rounded-[1.5rem] px-4 py-3 font-bold text-gray-800 outline-none transition-all shadow-inner w-full block text-sm" 
                                                        required 
                                                    />
                                                    <Calendar 
                                                        size={20} 
                                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-300 cursor-pointer hover:text-orange-500 transition-colors"
                                                        onClick={() => endDateRef.current.setFocus()}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Selector - Premium Look */}
                                    <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border border-orange-100 relative">
                                        <h4 className="text-sm font-black text-orange-600 mb-6 uppercase tracking-widest flex items-center gap-2">
                                            <Plus size={18} /> เลือกสินค้าที่ต้องการเข้าร่วม (Bulk Select)
                                        </h4>
                                            <div className="grid grid-cols-1 gap-6">
                                                
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowProductSelector(true)}
                                                    className="w-full bg-white border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-orange-500 font-bold py-6 rounded-3xl transition-all flex flex-col items-center gap-2 group"
                                                >
                                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full group-hover:scale-110 transition-transform">
                                                        <Package size={24} />
                                                    </div>
                                                    <span>คลิกเพื่อเลือกสินค้าเข้าร่วม</span>
                                                </button>
                                            </div>
                                    </div>

                                    {/* Product Selection Modal */}
                                    <AnimatePresence>
                                        {showProductSelector && (
                                            <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
                                                <motion.div 
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                                    onClick={() => setShowProductSelector(false)}
                                                />
                                                <motion.div 
                                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col relative z-[1051] overflow-hidden"
                                                >
                                                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
                                                        <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                                                            <Package className="text-orange-500" /> เลือกสินค้าเข้าร่วม
                                                        </h3>
                                                        
                                                        {/* Search Box */}
                                                        <input 
                                                            type="text" 
                                                            placeholder="ค้นหาชื่อสินค้า..." 
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="bg-white border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none w-full sm:w-64 transition-colors"
                                                        />

                                                        <button onClick={() => setShowProductSelector(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
                                                    </div>
                                                    
                                                    <div className="p-6 overflow-y-auto custom-scrollbar bg-[#F8F9FA]">
                                                        <div className="space-y-3">
                                                            {filteredProducts.map(p => {
                                                                const isAdded = formData.products.some(fp => fp.product_id === p.id);
                                                                const isActive = selectedProduct === p.id;

                                                                return (
                                                                    <div 
                                                                        key={p.id}
                                                                        className={`p-4 rounded-2xl border transition-all ${
                                                                            isAdded ? 'bg-gray-100 border-gray-200 opacity-60' : 
                                                                            isActive ? 'bg-orange-50 border-orange-500 shadow-lg' : 'bg-white border-gray-100 hover:border-orange-200'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-4">
                                                                            <img src={p.thumbnail ? (p.thumbnail.startsWith('http') ? p.thumbnail : `${API_BASE_URL}${p.thumbnail}`) : "/placeholder.png"} className="w-16 h-16 rounded-xl object-cover bg-gray-200" alt="" />
                                                                            <div className="flex-1 min-w-0">
                                                                                <h5 className="font-bold text-gray-800 text-sm truncate">{p.title}</h5>
                                                                                <p className="text-xs text-gray-500">Stock: {p.stock} | Price: ฿{p.price}</p>
                                                                            </div>
                                                                            
                                                                            {!isAdded && !isActive && (
                                                                                 <button 
                                                                                    onClick={() => {
                                                                                        setSelectedProduct(p.id);
                                                                                        setDiscountType('percent');
                                                                                        setDiscountInput('10');
                                                                                        setLimit(10);
                                                                                    }}
                                                                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold text-xs hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                                                                 >
                                                                                     เลือก
                                                                                 </button>
                                                                            )}

                                                                            {isAdded && <span className="text-xs font-bold text-green-500 flex items-center gap-1"><Check size={12}/> เพิ่มแล้ว</span>}
                                                                        </div>

                                                                        {/* Active Edit Area */}
                                                                        {isActive && !isAdded && (
                                                                            <div className="mt-4 pt-4 border-t border-orange-200 animate-fadeIn">
                                                                                <div className="flex gap-4 mb-4">
                                                                                    {/* Discount Type Toggle */}
                                                                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                                                                        <button 
                                                                                            onClick={() => { setDiscountType('percent'); setDiscountInput('10'); }}
                                                                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${discountType === 'percent' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                                                                                        >
                                                                                            % ลดเปอร์เซ็นต์
                                                                                        </button>
                                                                                        <button 
                                                                                            onClick={() => { setDiscountType('fixed'); setDiscountInput(Math.floor(p.price * 0.9)); }}
                                                                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${discountType === 'fixed' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                                                                                        >
                                                                                            ฿ ราคาขายสุทธิ
                                                                                        </button>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                    <div>
                                                                                        <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">
                                                                                            {discountType === 'percent' ? 'ส่วนลด (%)' : 'ราคาขาย (บาท)'}
                                                                                        </label>
                                                                                        <input 
                                                                                            type="number" 
                                                                                            value={discountInput}
                                                                                            onChange={(e) => setDiscountInput(e.target.value)}
                                                                                            className="w-full bg-white border border-orange-300 rounded-lg px-3 py-2 text-sm font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                                        />
                                                                                        {/* Show Final Price Preview */}
                                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                                            ราคาขายจริง: <span className="font-bold text-gray-700">
                                                                                                ฿{discountType === 'percent' 
                                                                                                    ? Math.floor(p.price * (1 - (parseFloat(discountInput) || 0) / 100)).toLocaleString() 
                                                                                                    : parseFloat(discountInput || 0).toLocaleString()}
                                                                                            </span>
                                                                                        </p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">จำกัดจำนวน</label>
                                                                                        <input 
                                                                                            type="number" 
                                                                                            value={limit}
                                                                                            onChange={(e) => setLimit(e.target.value)}
                                                                                            className="w-full bg-white border border-orange-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                                        />
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex justify-end gap-2 mt-4">
                                                                                    <button onClick={() => setSelectedProduct(null)} className="px-4 py-2 text-gray-400 hover:text-gray-600 text-xs font-bold">ยกเลิก</button>
                                                                                    <button 
                                                                                        onClick={() => {
                                                                                            const finalPrice = discountType === 'percent' 
                                                                                                ? Math.floor(p.price * (1 - (parseFloat(discountInput) || 0) / 100))
                                                                                                : parseFloat(discountInput);

                                                                                            if(!finalPrice || finalPrice < 0) return Swal.fire('แจ้งเตือน', 'ราคาสินค้าไม่ถูกต้อง', 'warning');
                                                                                            
                                                                                            const newItem = {
                                                                                                product_id: p.id,
                                                                                                product_name: p.title,
                                                                                                original_price: p.price,
                                                                                                sale_price: finalPrice,
                                                                                                limit: parseInt(limit)
                                                                                            };
                                                                                            setFormData(prev => ({...prev, products: [...prev.products, newItem]}));
                                                                                            setSelectedProduct(null); 
                                                                                        }} 
                                                                                        className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold text-xs shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-95 transition-all"
                                                                                    >
                                                                                        ยืนยันเพิ่มสินค้า
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center z-20">
                                                        <span className="font-bold text-gray-500">{tempSelectedProducts.length} รายการที่เลือก</span>
                                                        <button 
                                                            onClick={confirmBulkAdd}
                                                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-orange-200 transition-all active:scale-95"
                                                        >
                                                            ยืนยันการเลือก
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>

                                    {/* Added Products Table-like list */}
                                    {formData.products.length > 0 && (
                                        <div className="space-y-4 pt-4">
                                            <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-4">รายการสินค้า ({formData.products.length})</h5>
                                            <div className="overflow-hidden border border-gray-200 rounded-xl">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-700 font-bold">
                                                        <tr>
                                                            <th className="p-3">สินค้า</th>
                                                            <th className="p-3">ราคาปกติ</th>
                                                            <th className="p-3 w-32">ลดเหลือ (บาท)</th>
                                                            <th className="p-3 w-24">โควต้า</th>
                                                            <th className="p-3 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {formData.products.map((item, idx) => (
                                                            <tr key={idx} className="bg-white">
                                                                <td className="p-3 font-medium text-gray-800">{item.product_name}</td>
                                                                <td className="p-3 text-gray-400 line-through">{parseFloat(item.original_price).toLocaleString()}</td>
                                                                <td className="p-3">
                                                                    <input 
                                                                        type="number" 
                                                                        value={item.sale_price}
                                                                        onChange={(e) => updateProductRow(idx, 'sale_price', e.target.value)}
                                                                        className="w-full p-2 border rounded-lg text-red-600 font-bold"
                                                                    />
                                                                </td>
                                                                <td className="p-3">
                                                                    <input 
                                                                        type="number" 
                                                                        value={item.limit}
                                                                        onChange={(e) => updateProductRow(idx, 'limit', e.target.value)}
                                                                        className="w-full p-2 border rounded-lg"
                                                                    />
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => removeProductFromSale(idx)}
                                                                        className="text-red-400 hover:text-red-600"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-wider shadow-2xl shadow-orange-200/50 hover:shadow-orange-300 transition-all mt-10 mb-4 flex items-center justify-center gap-4"
                                >
                                    <Zap size={28} fill="white" />
                                    ยืนยันแคมเปญ
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FlashSaleManagement;
