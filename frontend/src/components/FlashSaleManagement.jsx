import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, Edit2, Plus, Minus, Calendar, Save, X, Archive, AlertCircle, 
    ShoppingBag, Package, Search, ChevronLeft, ChevronRight,    Clock,
    ChevronDown,
    ChevronUp,
    Tag,
    ImageIcon,
    Filter,
    MoreHorizontal,
    Zap,
    Check,
    SlidersHorizontal,
    Star,
    Bell,
    Truck,
    Ticket, List,
    User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { th } from 'date-fns/locale';

// ✅ NEW: Import Timeline & Campaign Components
import CalendarView from './flashsale/CalendarView';
import CampaignBatchView from './flashsale/CampaignBatchView';
import CampaignForm from './flashsale/CampaignForm';
import ProductSelectorModal from './flashsale/ProductSelectorModal';

registerLocale('th', th);

/* ✅ Premium Calendar Styles with Anti-Gravity Float (Orange Theme) */
const DatePickerStyles = () => (
    <style>{`
        .react-datepicker {
            font-family: 'Inter', 'Sarabun', sans-serif;
            border: none;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
            border-radius: 1rem;
            padding: 0.75rem;
            background-color: #ffffff !important;
            width: 290px; /* ✅ Compact Fixed Width */
            font-size: 0.75rem; /* Smaller Font */
        }
        .react-datepicker__header {
            background-color: #ffffff !important;
            border-bottom: none;
            padding-bottom: 0.5rem;
        }
        .react-datepicker__month-container {
            width: 100%;
            background-color: #ffffff !important;
            float: none;
        }
        .react-datepicker__month {
            background-color: #ffffff !important;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .react-datepicker__day-names, .react-datepicker__week {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            justify-items: center;
            width: 100%;
        }
        .react-datepicker__day-name, .react-datepicker__day {
            width: 2rem; /* Compact Cell */
            height: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            border-radius: 9999px;
            font-weight: 700;
        }
        .react-datepicker__day-name {
            color: #9ca3af;
            text-transform: uppercase;
            font-size: 0.65rem; /* Smaller day names */
            font-weight: 900;
            letter-spacing: 0.05em;
        }
        .react-datepicker__day {
            color: #374151;
            font-size: 0.75rem;
            transition: all 0.2s;
        }
        .react-datepicker__day:hover {
            background-color: #f3f4f6;
        }
        .react-datepicker__day--selected, .react-datepicker__day--selected:hover {
            background-color: #f97316;
            color: white;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
        }
        .react-datepicker__day--keyboard-selected {
            background-color: transparent;
            color: #374151;
        }
        /* 🚫 Disabled Dates (Past) - KEPT but styled */
        .react-datepicker__day--disabled {
            color: #e5e7eb !important;
            opacity: 0.3 !important;
            pointer-events: none !important;
            background-color: transparent !important;
            font-weight: 400 !important;
        }
        .react-datepicker__day--outside-month {
            opacity: 0;
            pointer-events: none;
        }
    `}</style>
);


// ✅ Custom Date Input with Professional Quick Tags & Ultra Rounded Design
const CustomDateInput = React.forwardRef(({ value, onClick, label, icon: Icon, onQuickSelect }, ref) => (
    <div className="flex flex-col gap-2 w-full group">
        {label && (
            <div className="flex justify-between items-center mb-0.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 ml-1 opacity-70">
                    {Icon && <Icon size={12} />} {label}
                </label>
                {/* ⚡ Professional Quick Date Tags */}
                <div className="flex gap-1">
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickSelect(new Date()); }}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all border border-orange-100 uppercase tracking-wider"
                    >
                        Today
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            onQuickSelect(tomorrow);
                        }}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-100 uppercase tracking-wider"
                    >
                        Tmrw
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const plus24 = new Date(Date.now() + 86400000);
                            onQuickSelect(plus24);
                        }}
                        className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 uppercase tracking-wider"
                    >
                        +24hr
                    </button>
                </div>
            </div>
        )}
        <button
            type="button"
            className="w-full bg-white border border-gray-200 text-gray-800 font-black text-lg rounded-[1.5rem] px-5 py-4 hover:border-orange-500 focus:border-orange-500 focus:ring-[6px] focus:ring-orange-100 transition-all flex items-center justify-between gap-3 shadow-sm active:scale-[0.98] group-hover:bg-orange-50/20 overflow-hidden relative"
            onClick={onClick}
            ref={ref}
        >
            <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl group-hover:rotate-12 transition-transform">
                    <Calendar size={22} />
                </div>
                <span>{value || "Select Date"}</span>
            </div>
            <ChevronDown size={18} className="text-gray-300 group-hover:text-orange-400 group-hover:translate-y-0.5 transition-all" />
        </button>
    </div>
));

// ✅ Professional Cascading Time Picker (1-minute steps + Rollover)
const ThaiTimePicker = ({ label, value, onDateChange, icon: Icon }) => {
    // value is a Date object
    const dateValue = value instanceof Date ? value : new Date();
    const hh = dateValue.getHours().toString().padStart(2, '0');
    const mm = dateValue.getMinutes().toString().padStart(2, '0');

    // 🕒 Smart Cascading Logic: Minute -> Hour -> Day
    const adjustDate = (type, direction) => {
        const newDate = new Date(dateValue);
        if (type === 'mm') {
            newDate.setMinutes(newDate.getMinutes() + direction);
        } else {
            newDate.setHours(newDate.getHours() + direction);
        }

        // ✅ V3 Validation: Allow Future Adjustments, Block Past (Minute Precision)
        const now = new Date();
        const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const targetMinute = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes());

        if (targetMinute < currentMinute) return; // Block strictly past minutes

        onDateChange(newDate);
    };

    // ⌨️ Local State for Typing Handling
    const [hInput, setHInput] = useState(dateValue.getHours().toString().padStart(2, '0'));
    const [mInput, setMInput] = useState(dateValue.getMinutes().toString().padStart(2, '0'));

    useEffect(() => {
        setHInput(dateValue.getHours().toString().padStart(2, '0'));
        setMInput(dateValue.getMinutes().toString().padStart(2, '0'));
    }, [dateValue]);

    const handleInputCommit = (type) => {
        const newDate = new Date(dateValue);
        let val = 0;
        if (type === 'hh') {
            val = parseInt(hInput.replace(/[^0-9]/g, '') || '0');
            val = Math.min(Math.max(val, 0), 23);
            newDate.setHours(val);
        } else {
            val = parseInt(mInput.replace(/[^0-9]/g, '') || '0');
            val = Math.min(Math.max(val, 0), 59);
            newDate.setMinutes(val);
        }
        
        // ✅ V3 Validation: Allow Future Adjustments, Block Past (Minute Precision)
        const now = new Date();
        const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        const targetMinute = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes());

        if (targetMinute < currentMinute) {
             // Rollback if invalid past time
             setHInput(dateValue.getHours().toString().padStart(2, '0'));
             setMInput(dateValue.getMinutes().toString().padStart(2, '0'));
             return;
        }

        onDateChange(newDate);
    };

    const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
            handleInputCommit(type);
        }
    };

    const quickSlots = [
        { label: '00:00', h: 0, m: 0 },
        { label: '12:00', h: 12, m: 0 },
        { label: '23:59', h: 23, m: 59 }
    ];

    const applyQuickSlot = (h, m) => {
        const newDate = new Date(dateValue);
        newDate.setHours(h, m, 0, 0);
        // ✅ Relaxed Validation: Removed automatic push to tomorrow if past
        onDateChange(newDate);
    };

    return (
        <div className="flex flex-col gap-2 bg-white/40 backdrop-blur-sm p-4 rounded-[1.5rem] border border-orange-100/50 shadow-sm">
            <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                    {Icon && <Icon size={12} className="text-orange-500" />} {label}
                </label>
                <div className="flex gap-1 items-center">
                    {quickSlots.map(slot => (
                        <button 
                            key={slot.label}
                            type="button"
                            onClick={() => applyQuickSlot(slot.h, slot.m)}
                            className="text-[9px] font-black px-2 py-0.5 rounded-full bg-white text-gray-500 border border-gray-100 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm transition-all active:scale-95"
                        >
                            {slot.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="flex items-center justify-around gap-2 bg-white rounded-2xl p-3 border border-gray-100 shadow-inner group">
                {/* 🕒 Hour Spinner */}
                <div className="flex flex-col items-center">
                    <button type="button" onClick={() => adjustDate('hh', 1)} className="p-1 text-gray-300 hover:text-orange-500 hover:scale-125 transition-all"><ChevronUp size={16}/></button>
                    <input 
                        type="text" 
                        value={hInput}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setHInput(e.target.value)}
                        onBlur={() => handleInputCommit('hh')}
                        onKeyDown={(e) => handleKeyDown(e, 'hh')}
                        className="w-12 text-center text-2xl font-black text-gray-800 font-mono leading-none tracking-tighter bg-transparent focus:text-orange-600 focus:outline-none transition-colors"
                        maxLength={2}
                    />
                    <button type="button" onClick={() => adjustDate('hh', -1)} className="p-1 text-gray-300 hover:text-orange-500 hover:scale-125 transition-all"><ChevronDown size={16}/></button>
                </div>
                
                <div className="flex flex-col items-center pb-1">
                    <span className="text-xl font-black text-gray-200 animate-pulse">:</span>
                </div>

                {/* 🕒 Minute Spinner (1-min steps) */}
                <div className="flex flex-col items-center">
                    <button type="button" onClick={() => adjustDate('mm', 1)} className="p-1 text-gray-300 hover:text-orange-500 hover:scale-125 transition-all"><ChevronUp size={16}/></button>
                    <input 
                        type="text" 
                        value={mInput}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setMInput(e.target.value)}
                        onBlur={() => handleInputCommit('mm')}
                        onKeyDown={(e) => handleKeyDown(e, 'mm')}
                        className="w-12 text-center text-2xl font-black text-gray-800 font-mono leading-none tracking-tighter bg-transparent focus:text-orange-600 focus:outline-none transition-colors"
                        maxLength={2}
                    />
                    <button type="button" onClick={() => adjustDate('mm', -1)} className="p-1 text-gray-300 hover:text-orange-500 hover:scale-125 transition-all"><ChevronDown size={16}/></button>
                </div>
                
                <div className="bg-orange-50 text-orange-500 text-[10px] font-black px-1.5 py-0.5 rounded-md self-center">น.</div>
            </div>
        </div>
    );
};

// ✅ IOS Switch Component
const IOSSwitch = ({ checked, onChange, label, subLabel, icon: Icon, color = "orange", disabled = false }) => (
    <div className={`
        group flex items-center justify-between p-4 bg-white rounded-2xl border transition-all duration-300
        ${checked ? `border-${color}-200 shadow-lg shadow-${color}-100/50` : 'border-gray-100 hover:border-gray-200'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    `} onClick={() => !disabled && onChange(!checked)}>
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${checked ? `bg-${color}-500 text-white shadow-md` : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                {Icon && <Icon size={22} weight={checked ? "fill" : "regular"} />}
            </div>
            <div>
                <div className={`font-bold text-sm transition-colors ${checked ? 'text-gray-900' : 'text-gray-600'}`}>{label}</div>
                {subLabel && <div className="text-xs text-gray-400 font-medium">{subLabel}</div>}
            </div>
        </div>
        <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${checked ? `bg-${color}-500` : 'bg-gray-200'}`}>
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    </div>
);

// ✅ Time Input Component
const TimeInput = ({ label, value, onChange, icon: Icon }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            {Icon && <Icon size={12} />} {label}
        </label>
        <div className="relative group">
            <input 
                type="time" 
                value={value}
                onChange={onChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-bold text-lg rounded-xl px-4 py-3 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-center"
            />
        </div>
    </div>
);

// ✅ Configuration Summary (New Component)
const ConfigSummary = ({ data }) => {
    const activeOptions = [
        { label: 'เปิดใช้งาน', val: data.is_active, color: 'orange' },
        { label: 'ปิดเก็บเงินปลายทาง', val: data.no_cod, color: 'red' },
        { label: 'ใช้ร่วมคูปอง', val: data.can_use_coupon, color: 'purple' },
        { label: 'เฉพาะสมาชิก', val: data.is_member_only, color: 'indigo' },
    ].filter(opt => opt.val);

    const durationText = (() => {
        if (!data.start_time || !data.end_time) return "-";
        const diff = new Date(data.end_time) - new Date(data.start_time);
        if (diff <= 0) return "0 ชม.";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} วัน ${hours % 24} ชม.`;
        return `${hours} ชม. ${mins} นาที`;
    })();

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <SlidersHorizontal size={12} className="text-orange-500" />
                สรุปการตั้งค่า
            </h4>
            
            <div className="space-y-4">
                {/* 🏷️ Campaign Name */}
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-400">ชื่อแคมเปญ</span>
                    <span className="text-sm font-black text-gray-800 text-right max-w-[150px] truncate">{data.name || "ยังไม่ได้ระบุ"}</span>
                </div>

                {/* ⏳ Duration */}
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">ระยะเวลาทั้งหมด</span>
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">{durationText}</span>
                </div>

                {/* 📦 Products count */}
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">จำนวนสินค้า</span>
                    <span className="text-sm font-black text-gray-800 flex items-center gap-1">
                        <Package size={14} className="text-gray-400" />
                        {data.products.length} รายการ
                    </span>
                </div>

                {/* ✨ Active Features */}
                <div className="pt-2 border-t border-dashed border-gray-100">
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {activeOptions.length > 0 ? (
                            activeOptions.map(opt => (
                                <span key={opt.label} className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-${opt.color}-50 text-${opt.color}-500 border border-${opt.color}-100`}>
                                    {opt.label}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] text-gray-300 italic font-medium">ไม่มีเงื่อนไขพิเศษ</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FlashSaleManagement = () => {
    const { user, token: authContextToken } = useAuth();
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    // ✅ สถานะสำหรับตัวกรองและเรียงลำดับ (Filter & Sort State)
    const [filterStatus, setFilterStatus] = useState('all'); // all, Live, Upcoming, Ended
    const [sortConfig, setSortConfig] = useState({ key: 'start_time', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [formData, setFormData] = useState({
        name: '', 
        description: '', 
        banner_image: null, 
        start_time: new Date(), 
        end_time: new Date(Date.now() + 86400000), 
        is_active: true, 
        priority: 0,
        show_in_hero: false,
        enable_notification: true,
        bg_color: '#f97316',
        text_color: '#ffffff',
        products: [],
        campaign_id: '',
        is_member_only: false,
        can_use_coupon: true,
        no_cod: false,
        conditions_text: []
    });
    
    // ✅ NEW: Image Preview State
    const [previewImage, setPreviewImage] = useState(null);

    // For selecting products
    const [selectedProduct, setSelectedProduct] = useState('');
    const [discountType, setDiscountType] = useState('percent');
    const [discountInput, setDiscountInput] = useState('10');
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [productToAdd, setProductToAdd] = useState(null); // New State for Modal logic
    
    // Validation State
    const [rowErrors, setRowErrors] = useState({});

    // ✅ NEW: Campaign & View State
    const [campaigns, setCampaigns] = useState([]);
    const [activeView, setActiveView] = useState('list'); // 'list' | 'timeline' | 'campaigns'
    const [showCampaignForm, setShowCampaignForm] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // ✅ NEW: Tag Selection State
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [tagDiscountType, setTagDiscountType] = useState('percent'); // 'percent' | 'fixed'
    const [tagDiscountValue, setTagDiscountValue] = useState('10'); // Default 10%
    const [useTagMode, setUseTagMode] = useState(false); // Toggle between Manual / Tag Mode

    // Refs for DatePickers
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    const API_BASE_URL = "http://localhost:8000";

    const getImageUrl = (path) => {
        if (!path) return "/placeholder.png";
        if (path.startsWith("http") || path.startsWith("blob:")) return path;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        if (cleanPath.startsWith('media/')) return `${API_BASE_URL}/${cleanPath}`;
        return `${API_BASE_URL}/media/${cleanPath}`;
    };

    useEffect(() => {
        fetchFlashSales();
        fetchProducts();
        fetchCategories();
        fetchCampaigns();
        fetchTags(); // ✅ NEW: Fetch tags
    }, []);

    // ✅ NEW: Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, banner_image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getFlashSaleStatus = (flashSale) => {
        const now = new Date();
        const start = new Date(flashSale.start_time);
        const end = new Date(flashSale.end_time);

        if (now < start) {
            return 'Upcoming';
        } else if (now >= start && now <= end) {
            return 'Live';
        } else {
            return 'Ended';
        }
    };

    const filteredFlashSales = flashSales.filter(fs => {
        const status = getFlashSaleStatus(fs);
        const matchesStatus = filterStatus === 'all' || status === filterStatus;
        const matchesSearch = fs.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const sortedFlashSales = [...filteredFlashSales].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === 'status') {
            const statusOrder = { 'Live': 1, 'Upcoming': 2, 'Ended': 3 };
            const aStatus = getFlashSaleStatus(a);
            const bStatus = getFlashSaleStatus(b);
            if (statusOrder[aStatus] < statusOrder[bStatus]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (statusOrder[aStatus] > statusOrder[bStatus]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.ceil(sortedFlashSales.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedSales = sortedFlashSales.slice(startIndex, startIndex + itemsPerPage);


    const fetchFlashSales = async () => {
        try {
            const token = authContextToken || localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(API_BASE_URL + "/api/admin/flash-sales/", {
                headers: { Authorization: "Token " + token }
            });
            setFlashSales(res.data.map(fs => ({ ...fs, status: getFlashSaleStatus(fs) })));
        } catch (error) {
            console.error("Error fetching flash sales", error);
        }
    };

    const toggleFlashSaleStatus = async (id, currentStatus) => {
        try {
            const token = authContextToken || localStorage.getItem('token');
            // Optimistic Update
            setFlashSales(prev => prev.map(fs => fs.id === id ? { ...fs, is_active: !currentStatus } : fs));
            
            await axios.patch(`${API_BASE_URL}/api/admin/flash-sales/${id}/`, {
                is_active: !currentStatus
            }, { 
                headers: { Authorization: `Token ${token}` } 
            });

            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
            Toast.fire({ 
                icon: 'success', 
                title: !currentStatus ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว' 
            });
        } catch (error) {
            console.error("Error toggling status:", error);
            fetchFlashSales(); // Revert
            Swal.fire({ icon: 'error', title: 'Error', text: 'ไม่สามารถเปลี่ยนสถานะได้' });
        }
    };

    // ✅ RECURSIVE FETCH: Get ALL products regardless of pagination limits
    const fetchProducts = async () => {
        try {
            let allProducts = [];
            let nextUrl = `${API_BASE_URL}/api/products/?limit=1000`; // Start big, but standard
            
            while (nextUrl) {
                const res = await axios.get(nextUrl);
                const data = res.data;
                const results = Array.isArray(data) ? data : (data.results || []);
                
                allProducts = [...allProducts, ...results];
                nextUrl = data.next ? data.next : null;
                
                // Safety break for huge datasets or infinite loops
                if (allProducts.length > 5000) break; 
            }
            
            setProducts(allProducts);
        } catch (error) { 
             console.error("Error fetching products", error);
             // Fallback attempt if pagination fails
             try {
                const res = await axios.get(`${API_BASE_URL}/api/products/?no_page`);
                setProducts(res.data.results || res.data);
             } catch (e) { console.error("Fallback failed", e); }
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(API_BASE_URL + "/api/categories/?limit=1000");
            if (res.data) {
                setCategories(res.data.categories || res.data.results || res.data);
            }
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    // ✅ NEW: Fetch Tags
    const fetchTags = async () => {
        try {
            const res = await axios.get(API_BASE_URL + "/api/tags/");
            setTags(res.data);
        } catch (error) {
            console.error("Error fetching tags", error);
        }
    };

    // ✅ NEW: Handle Add Products by Tag
    // ✅ NEW: Handle Add Products by Tag (Backend Integrated)
    const handleAddProductsByTags = async () => {
        if (selectedTags.length === 0) {
            Swal.fire('Warning', 'กรุณาเลือกป้ายกำกับอย่างน้อย 1 รายการ', 'warning');
            return;
        }
        if (!tagDiscountValue || parseFloat(tagDiscountValue) < 0) {
            Swal.fire('Warning', 'กรุณาระบุส่วนลดที่ถูกต้อง', 'warning');
            return;
        }

        try {
            // Show Loading State
            Swal.fire({
                title: 'กำลังค้นหาสินค้า...',
                text: 'กรุณารอสักครู่',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const token = authContextToken || localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/products/by-tags/`, {
                tag_ids: selectedTags
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            const matchingProducts = res.data;

            if (matchingProducts.length === 0) {
                Swal.fire('Info', 'ไม่พบสินค้าที่มีป้ายกำกับที่เลือก', 'info');
                return;
            }

            const discountVal = parseFloat(tagDiscountValue);
            let addedCount = 0;
            const newProducts = [...formData.products];
            const existingIds = new Set(newProducts.map(p => p.product_id || p.id));

            matchingProducts.forEach(product => {
                // Avoid duplicates
                if (existingIds.has(product.id)) return;

                let salePrice = 0;
                const originalPrice = parseFloat(product.price);

                // 2. Calculate Price
                if (tagDiscountType === 'percent') {
                    // Formula: Original - (Original * % / 100)
                    salePrice = originalPrice - (originalPrice * discountVal / 100);
                } else {
                    // Fixed Price
                    salePrice = discountVal;
                }

                // Safety Clamp
                salePrice = Math.max(0, Math.floor(salePrice)); // Floor to integer for cleanliness
                
                // 3. Add to list
                newProducts.push({
                    product_id: product.id,
                    product_name: product.title,
                    product_image: product.thumbnail,
                    original_price: product.price,
                    sale_price: salePrice,
                    stock: product.stock, // Show stock for reference
                    stock: product.stock, // Show stock for reference
                    limit: product.stock // Default quota to Max Stock (User friendly)
                });
                
                addedCount++;
            });

            setFormData({ ...formData, products: newProducts });
            
            Swal.fire({
                icon: 'success',
                title: 'เพิ่มสินค้าเรียบร้อย',
                text: `เพิ่มสินค้า ${addedCount} รายการจากป้ายกำกับ`,
                timer: 1500
            });

        } catch (error) {
            console.error("Error fetching matching products:", error);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากระบบ', 'error');
        }
    };

    // ✅ NEW: Campaign API Functions
    const fetchCampaigns = async () => {
        try {
            const token = authContextToken || localStorage.getItem('token');
            if (!token) return;
            const res = await axios.get(`${API_BASE_URL}/api/admin/campaigns/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setCampaigns(res.data);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    const saveCampaign = async (campaignData, campaignId = null) => {
        try {
            const token = authContextToken || localStorage.getItem('token');
            // ✅ FIX: ใช้ campaignData.id ถ้าไม่มี campaignId parameter
            const actualId = campaignId || campaignData.id;
            const method = actualId ? 'put' : 'post';
            const url = actualId 
                ? `${API_BASE_URL}/api/admin/campaigns/${actualId}/`
                : `${API_BASE_URL}/api/admin/campaigns/`;

            // ✅ Clean & Format Data
            const payload = {
                name: campaignData.name,
                description: campaignData.description || '',
                campaign_start: new Date(campaignData.campaign_start).toISOString(),
                campaign_end: new Date(campaignData.campaign_end).toISOString(),
                theme_color: campaignData.theme_color || '#f97316',
                is_active: campaignData.is_active,
                priority: parseInt(campaignData.priority) || 0,
                flash_sale_ids: campaignData.flash_sale_ids || []
            };

            await axios[method](url, payload, {
                headers: { Authorization: `Token ${token}` }
            });

            await Swal.fire({
                icon: 'success',
                title: campaignId ? 'แก้ไขสำเร็จ!' : 'สร้างสำเร็จ!',
                text: `Campaign ${campaignId ? 'ถูกแก้ไข' : 'ถูกสร้าง'}เรียบร้อยแล้ว`,
                confirmButtonColor: '#9333ea'
            });

            fetchCampaigns();
            fetchFlashSales(); // Refresh to show updated campaign assignments
            setShowCampaignForm(false);
            setSelectedCampaign(null);
        } catch (error) {
            console.error("Error saving campaign:", error);
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : "เกิดข้อผิดพลาด";
            Swal.fire({
                icon: 'error',
                title: 'บันทึกไม่สำเร็จ (400)',
                text: `ข้อมูลไม่ถูกต้อง: ${errorMsg}`,
                confirmButtonColor: '#ef4444'
            });
            throw error;
        }
    };

    const deleteCampaign = async (campaignId) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: 'Flash Sales ภายใน Campaign นี้จะกลับสู่สถานะไม่มีแคมเปญ',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                const token = authContextToken || localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/admin/campaigns/${campaignId}/`, {
                    headers: { Authorization: `Token ${token}` }
                });

                await Swal.fire({
                    icon: 'success',
                    title: 'ลบสำเร็จ!',
                    text: 'Campaign ถูกลบแล้ว',
                    confirmButtonColor: '#9333ea'
                });

                fetchCampaigns();
            } catch (error) {
                console.error("Error deleting campaign:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'ลบไม่สำเร็จ',
                    text: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };



    const removeProductFromSale = (index) => {
        const newProds = [...formData.products];
        newProds.splice(index, 1);
        setFormData({ ...formData, products: newProds });
        
        const newErrors = { ...rowErrors };
        delete newErrors[index];
        setRowErrors(newErrors); // Simple clear
    };

    const updateProductRow = (index, field, value) => {
        const newProds = [...formData.products];
        let newValue = value;
        const product = newProds[index];

        // 🛡️ NO-NONSENSE Sanitization & Clamping
        const sanitize = (val, type) => {
            if (val === '') return '';
            
            if (type === 'price') {
                // Must be a number. Allow 1 decimal. No + - * /
                let clean = val.toString().replace(/[^0-9.]/g, ''); 
                // Ensure only one dot
                const parts = clean.split('.');
                if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('');
                return clean;
            }
            if (type === 'int') {
                // Strict Interger. No decimals, no signs.
                return val.toString().replace(/[^0-9]/g, '');
            }
            return val;
        };

        if (field === 'sale_price') {
            const cleanVal = sanitize(value, 'price');
            
            if (cleanVal === '') {
                newValue = '';
            } else {
                let price = parseFloat(cleanVal);
                if (isNaN(price)) price = 0;
                
                // Clamp: 0 <= price < original_price (Prevention Mode)
                if (price < 0) price = 0; // Double check though regex removed signs
                if (price >= product.original_price) {
                     price = Math.max(0, product.original_price - 1); 
                }
                newValue = price;
            }
        }

        if (field === 'limit') {
            const cleanVal = sanitize(value, 'int');
            
             if (cleanVal === '') {
                newValue = '';
            } else {
                let limit = parseInt(cleanVal);
                if (isNaN(limit)) limit = 0;

                // Clamp: 0 <= limit <= stock
                if (product.stock !== undefined && limit > product.stock) {
                    limit = product.stock;
                }
                newValue = limit;
            }
        }

        newProds[index] = { ...newProds[index], [field]: newValue };
        setFormData({ ...formData, products: newProds });

        // Clear errors since we enforce validity
        setRowErrors(prev => {
            const newErrs = { ...prev };
            if (newErrs[index]) {
                delete newErrs[index][field];
                if (Object.keys(newErrs[index]).length === 0) delete newErrs[index];
            }
            return newErrs;
        });
    };

    // ✅ NEW: Handle Date Change from Calendar
    const handleDateSelect = (date) => {
        // Keep the current time, change the date
        const newStart = new Date(formData.start_time);
        newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        
        // Update Form
        updateTimeAndRollover(newStart, formData.end_time);
    };

    // ✅ NEW: Handle Time Change & Auto Rollover
    const handleTimeChange = (type, timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return;

        // ✅ Validation: Prevent Past Time (if Today)
        const now = new Date();
        const currentStart = formData.start_time ? new Date(formData.start_time) : new Date();
        
        // Check if we are modifying Start Time
        if (type === 'start') {
            const newStart = new Date(currentStart);
            newStart.setHours(hours, minutes);

            // If Date is Today, Time cannot be in past (allow 1 min buffer)
            if (newStart < now && newStart.getDate() === now.getDate() && newStart.getMonth() === now.getMonth() && newStart.getFullYear() === now.getFullYear()) {
                 Swal.fire({
                    icon: 'warning',
                    title: 'เวลาไม่ถูกต้อง',
                    text: 'ไม่สามารถเลือกเวลาในอดีตได้',
                    timer: 1500,
                    showConfirmButton: false
                 });
                 return; 
            }
            updateTimeAndRollover(newStart, formData.end_time);
        } else {
            // End Time Changed
            const newEnd = new Date(formData.end_time);
            newEnd.setHours(hours, minutes);
            
            // Logic: Base date is usually same as start, UNLESS time is smaller (rollover)
             const start = new Date(formData.start_time);
             
             // Reset End Date to Start Date first
             newEnd.setFullYear(start.getFullYear(), start.getMonth(), start.getDate());
             
             // Check Rollover
             if (newEnd < start) {
                 newEnd.setDate(newEnd.getDate() + 1);
             }
             
             setFormData(prev => ({ ...prev, end_time: newEnd }));
        }
    };

    const updateTimeAndRollover = (newStart, currentEnd) => {
         // ฟังก์ชันสำหรับคำนวณวันสิ้นสุดอัตโนมัติ เมื่อมีการเปลี่ยนวันเริ่มต้น
         // โดยจะพยายามรักษา "เวลา" (HH:MM) เดิมไว้ และเลื่อนวันที่ให้สัมพันธ์กัน
         // หากเวลาสิ้นสุดน้อยกว่าเวลาเริ่ม จะปัดวันสิ้นสุดไป +1 วันอัตโนมัติ (Rollover)
         // Let's keep the user's set "End Time (HH:MM)" but adjust the Date part.
         
         const end = new Date(currentEnd); // Current End (Date+Time)
         
         // 1. Reset End Date to New Start Date
         const newEnd = new Date(newStart);
         newEnd.setHours(end.getHours(), end.getMinutes());
         
         // 2. Check Rollover
         if (newEnd < newStart) {
             newEnd.setDate(newEnd.getDate() + 1);
         }
         
         setFormData(prev => ({ ...prev, start_time: newStart, end_time: newEnd }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.products.length === 0) {
            Swal.fire('ไม่มีสินค้า', 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ', 'warning');
            return;
        }

        if (Object.keys(rowErrors).length > 0) {
            Swal.fire('ข้อมูลไม่ถูกต้อง', 'กรุณาแก้ไขราคาหรือจำนวนในตารางให้ถูกต้อง', 'warning');
            return;
        }

        try {
            const token = authContextToken || localStorage.getItem('token');
            if (!token) {
                Swal.fire({
                    title: 'ข้อผิดพลาด', 
                    text: 'ไม่พบ Token กรุณา Login ใหม่', 
                    icon: 'error'
                }).then(() => window.location.href = '/admin/login');
                return;
            }
            
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('description', formData.description || '');
            payload.append('priority', formData.priority || 0);
            if (formData.campaign_id) payload.append('campaign_id', formData.campaign_id); // ✅ Append Campaign ID
            if(formData.banner_image instanceof File) {
                payload.append('banner_image', formData.banner_image);
            }
            
            const start = typeof formData.start_time === 'object' ? formData.start_time.toISOString() : formData.start_time;
            const end = typeof formData.end_time === 'object' ? formData.end_time.toISOString() : formData.end_time;
            payload.append('start_time', start);
            payload.append('end_time', end);
            payload.append('is_active', formData.is_active);
            payload.append('show_in_hero', formData.show_in_hero);
            payload.append('enable_notification', formData.enable_notification);
            payload.append('bg_color', formData.bg_color);
            payload.append('text_color', formData.text_color);
            payload.append('is_member_only', formData.is_member_only);
            payload.append('can_use_coupon', formData.can_use_coupon);
            payload.append('no_cod', formData.no_cod);
            payload.append('conditions_text', JSON.stringify(formData.conditions_text));


            // Send products as JSON string
            payload.append('products', JSON.stringify(formData.products));

            if (formData.id) {
                // ✅ UPDATE (PUT)
                await axios.put(`${API_BASE_URL}/api/admin/flash-sales/${formData.id}/`, payload, {
                    headers: { 
                        Authorization: `Token ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                 // ✅ CREATE (POST)
                await axios.post(`${API_BASE_URL}/api/admin/flash-sales/`, payload, {
                    headers: { 
                        Authorization: `Token ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
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
                }).then(() => window.location.href = '/admin/login');
            } else {
                const errorMsg = error.response?.data?.error || (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : String(error.response?.data)) || 'เกิดข้อผิดพลาดในการบันทึก';
                Swal.fire('ข้อผิดพลาด', errorMsg, 'error');
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
                const token = authContextToken || localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/admin/flash-sales/${id}/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                Swal.fire('Deleted!', 'ลบแคมเปญเรียบร้อยแล้ว', 'success');
                fetchFlashSales();
            } catch (error) {
                Swal.fire('Error', 'ลบไม่สำเร็จ', 'error'); 
            }
        }
    };

    // 📊 Analytics Calculation
    const stats = useMemo(() => {
        const now = new Date();
        return {
            total: flashSales.length,
            live: flashSales.filter(fs => {
                const start = new Date(fs.start_time);
                const end = new Date(fs.end_time);
                return now >= start && now <= end;
            }).length,
            upcoming: flashSales.filter(fs => new Date(fs.start_time) > now).length,
            products: flashSales.reduce((acc, fs) => acc + (fs.products?.length || 0), 0)
        };
    }, [flashSales]);

    // 🧮 Modal Live Summary Logic
    const currentDurationText = useMemo(() => {
        if (!formData.start_time || !formData.end_time) return "Invalid Timeline";
        const diff = new Date(formData.end_time) - new Date(formData.start_time);
        if (diff <= 0) return "Invalid Timeline";
        const diffHrs = Math.floor(diff / (1000 * 60 * 60));
        const diffMins = Math.floor((diff / (1000 * 60)) % 60);
        return `${diffHrs}h ${diffMins}m`;
    }, [formData.start_time, formData.end_time]);

    const modalActiveOptions = useMemo(() => [
        { label: 'เฉพาะสมาชิก', active: formData.is_member_only, color: 'purple' },
        { label: 'ปิดเก็บเงินปลายทาง', active: formData.no_cod, color: 'red' },
        { label: 'ใช้ร่วมคูปอง', active: formData.can_use_coupon, color: 'blue' },
        { label: 'แจ้งเตือน', active: formData.enable_notification, color: 'orange' },
        { label: 'แสดงใน Hero', active: formData.show_in_hero, color: 'indigo' },
        { label: 'สถานะ', active: formData.is_active, color: 'green' }
    ].filter(opt => opt.active), [
        formData.is_member_only, formData.no_cod, formData.can_use_coupon, 
        formData.enable_notification, formData.show_in_hero, formData.is_active
    ]);

    return (
        <div id="flash-sale-root" className="p-8 lg:p-12 bg-[#fcfcfd] min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900 relative overflow-hidden">
             <DatePickerStyles />
             
             {/* 🎬 Hero Header Section (Cinematic Design) */}
             <div className="max-w-7xl mx-auto mb-16 relative">
                {/* Decorative Background Elements */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-200/20 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-100/30 rounded-full blur-[80px] -z-10" />

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100/50 shadow-sm animate-in fade-in slide-in-from-left duration-700">
                             <Zap size={14} className="fill-orange-500" />
                             สถานะระบบ: พร้อมใช้งาน
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-black text-gray-900 tracking-[-0.05em] leading-[0.9] animate-in fade-in slide-in-from-bottom duration-1000">
                            ระบบจัดการ <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Flash Sale</span>
                        </h1>
                        <p className="text-gray-400 font-bold text-lg max-w-xl leading-relaxed opacity-80">
                            สร้างและจัดการแคมเปญลดราคาของคุณได้อย่างมืออาชีพ ควบคุมทุกช่วงเวลาและกระตุ้นยอดขายได้อย่างแม่นยำ
                        </p>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-6">
                        
                        {activeView === 'list' && (
                            <motion.button  
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setFormData({ 
                                        name: '', description: '', banner_image: null, priority: 0, 
                                        start_time: new Date(), end_time: new Date(Date.now() + 86400000), 
                                        is_active: true, products: [], campaign_id: '',
                                        show_in_hero: false, enable_notification: true,
                                        bg_color: '#f97316', text_color: '#ffffff',
                                        is_member_only: false, can_use_coupon: true, no_cod: false, conditions_text: []
                                    });
                                    setPreviewImage(null);
                                    setShowModal(true);
                                }}
                                className="group bg-gray-900 text-white pl-10 pr-12 py-6 rounded-[2.5rem] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all flex items-center gap-5 font-black text-2xl relative overflow-hidden active:scale-95 shadow-xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-2 bg-orange-500 rounded-2xl group-hover:rotate-90 transition-transform duration-500">
                                    <Plus size={24} strokeWidth={4} />
                                </div>
                                <span className="relative z-10 tracking-tighter">สร้างรายการใหม่</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* 📊 High-Fidelity Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                    {[
                        { label: 'แคมเปญทั้งหมด', value: stats.total, icon: Archive, color: 'gray', trend: 'ทั้งหมด' },
                        { label: 'กำลังใช้งาน', value: stats.live, icon: Zap, color: 'orange', trend: 'ออนไลน์', pulse: true },
                        { label: 'กำลังจะมาถึง', value: stats.upcoming, icon: Clock, color: 'blue', trend: 'รอเริ่ม' },
                        { label: 'สินค้าในระบบ', value: stats.products, icon: Package, color: 'indigo', trend: 'รายการ' }
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-2xl hover:shadow-orange-100/40 transition-all duration-500 group cursor-default">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                    stat.color === 'orange' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' :
                                    stat.color === 'blue' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' :
                                    stat.color === 'indigo' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' :
                                    'bg-gray-900 text-white'
                                } group-hover:scale-110 group-hover:-rotate-6`}>
                                    <stat.icon size={28} className={stat.pulse ? 'animate-pulse' : ''} />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'
                                }`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</div>
                                <div className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {activeView === 'list' && (
            <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                
                {/* 🔍 Advanced Filter Center */}
                <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] border border-white flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex bg-gray-100/50 p-2 rounded-[1.5rem] border border-gray-100 shadow-inner">
                         {['all', 'Live', 'Upcoming', 'Ended'].map(status => (
                             <button
                                 key={status}
                                 onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                                 className={`px-8 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
                                     filterStatus === status 
                                     ? 'bg-white text-orange-600 shadow-md translate-y-0 scale-105' 
                                     : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                                 }`}
                             >
                                 {status === 'all' ? 'ทั้งหมด' : status === 'Live' ? 'กำลังใช้งาน' : status === 'Upcoming' ? 'กำลังจะมาถึง' : 'จบแล้ว'}
                             </button>
                         ))}
                    </div>
                    <div className="relative w-full lg:max-w-md group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 group-focus-within:scale-110 transition-transform" size={20} />
                        <input 
                            type="text" 
                            placeholder="ค้นหาแคมเปญ..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-[1.5rem] focus:ring-[10px] focus:ring-orange-100/50 outline-none font-black text-gray-800 transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>

                {/* 📊 Premium Event Ledger (Main Table) */}
                <div className="bg-white rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.08)] border border-gray-50 overflow-hidden group">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-50 backdrop-blur-md">
                                <tr>
                                    <th onClick={() => handleSort('name')} className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] cursor-pointer hover:text-orange-600 transition-colors group/head">
                                        <div className="flex items-center gap-2">ชื่อแคมเปญ {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
                                    </th>
                                    <th onClick={() => handleSort('status')} className="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] cursor-pointer hover:text-orange-600 transition-colors">
                                        <div className="flex items-center gap-2">สถานะ {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
                                    </th>
                                    <th onClick={() => handleSort('start_time')} className="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] cursor-pointer hover:text-orange-600 transition-colors">
                                        <div className="flex items-center gap-2">ช่วงเวลา {sortConfig.key === 'start_time' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
                                    </th>
                                    <th className="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">จำนวนสินค้า</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayedSales.length > 0 ? displayedSales.map((fs) => {
                                     const statusClass = fs.status === 'Live' ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 
                                                        fs.status === 'Ended' ? 'bg-gray-100 text-gray-400' : 'bg-blue-500 text-white shadow-lg shadow-blue-100';
                                     return (
                                        <tr key={fs.id} className="group/row hover:bg-orange-50/20 transition-all duration-300">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover/row:scale-110 duration-500 ${statusClass}`}>
                                                        <Zap size={24} fill={fs.status === 'Ended' ? "none" : "currentColor"} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-black text-gray-900 text-base tracking-tight truncate max-w-[200px]">{fs.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60">REF: {fs.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-3 items-start">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent transition-all ${
                                                        fs.status === 'Live' && fs.is_active
                                                        ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm' 
                                                        : fs.status === 'Ended' 
                                                            ? 'bg-gray-50 text-gray-400' 
                                                            : 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${fs.status === 'Live' && fs.is_active ? 'bg-orange-500 animate-pulse' : fs.status === 'Ended' ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                                                        {fs.status === 'Live' ? 'กำลังใช้งาน' : fs.status === 'Upcoming' ? 'รอเริ่ม' : 'จบแล้ว'}
                                                    </span>

                                                    {/* 🔘 Active/Inactive Toggle */}
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); toggleFlashSaleStatus(fs.id, fs.is_active); }}
                                                        className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all cursor-pointer hover:bg-white hover:shadow-sm ${fs.is_active ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'}`}
                                                    >
                                                        <div className={`w-7 h-4 rounded-full p-0.5 transition-colors relative ${fs.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-all absolute top-0.5 ${fs.is_active ? 'left-[14px]' : 'left-0.5'}`} />
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase ${fs.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {fs.is_active ? 'เปิดใช้งาน' : 'ปิด'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-800 text-sm tracking-tighter">{new Date(fs.start_time).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        {new Date(fs.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(fs.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                    <Package size={14} className="text-gray-400" />
                                                    <span className="text-sm font-black text-gray-600">{fs.products?.length || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-300 translate-x-4 group-hover/row:translate-x-0">
                                                    <button 
                                                        onClick={() => {
                                                            setFormData({
                                                                ...fs,
                                                                start_time: new Date(fs.start_time),
                                                                end_time: new Date(fs.end_time),
                                                                products: fs.products || [],
                                                                campaign_id: typeof fs.campaign === 'object' ? fs.campaign?.id : fs.campaign
                                                            });
                                                            setPreviewImage(fs.banner_image ? (fs.banner_image.startsWith('http') ? fs.banner_image : API_BASE_URL + fs.banner_image) : null);
                                                            setShowModal(true);
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center border border-orange-100 shadow-sm active:scale-90"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(fs.id)}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100 shadow-sm active:scale-90"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                     );
                                }) : (
                                <tr>
                                    <td colSpan="5" className="px-10 py-32 text-center text-gray-300">
                                        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border border-dashed border-gray-200">
                                                <Search size={40} className="opacity-20" />
                                            </div>
                                            <div>
                                                <p className="font-black text-xl text-gray-400 tracking-tight">ไม่พบข้อมูลแคมเปญ</p>
                                                <p className="text-sm font-bold opacity-60">ลองปรับตัวกรองใหม่ หรือเริ่มสร้าง Flash Sale ได้เลย</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* High-Fidelity Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center group/pager">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">หน้า</span>
                                <span className="bg-white px-3 py-1 rounded-lg border border-gray-200 text-xs font-black text-gray-900 shadow-sm">
                                    {currentPage} <span className="text-gray-300 mx-1">/</span> {totalPages}
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="w-12 h-12 rounded-2xl border-2 border-transparent bg-white shadow-sm flex items-center justify-center text-gray-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 disabled:hover:border-transparent transition-all active:scale-90"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="w-12 h-12 rounded-2xl border-2 border-transparent bg-white shadow-sm flex items-center justify-center text-gray-600 hover:border-orange-500 hover:text-orange-600 disabled:opacity-30 disabled:hover:border-transparent transition-all active:scale-90"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* 📅 CALENDAR VIEW - แสดงปฏิทิน Campaign + Flash Sale */}
            {activeView === 'calendar' && (
                <CalendarView 
                    flashSales={flashSales}
                    campaigns={campaigns}
                    onEdit={(sale) => {
                        setFormData({
                            ...sale,
                            start_time: new Date(sale.start_time),
                            end_time: new Date(sale.end_time),
                            banner_image: sale.banner_image,
                            products: sale.products || [],
                            campaign_id: sale.campaign?.id || ''
                        });
                        setPreviewImage(sale.banner_image);
                        setShowModal(true);
                    }}
                    onDelete={handleDelete}
                    onCreate={(day) => {
                        setFormData({ 
                            name: '', 
                            description: '', 
                            banner_image: null, 
                            priority: 0, 
                            start_time: day, 
                            end_time: new Date(day.getTime() + 86400000), 
                            is_active: true, 
                            products: [], 
                            campaign_id: '' 
                        });
                        setPreviewImage(null);
                        setShowModal(true);
                    }}
                    onCreateCampaign={(day) => {
                        setSelectedCampaign(null);
                        setShowCampaignForm(true);
                    }}
                />
            )}

            {/* 🏆 CAMPAIGN BATCH VIEW */}
            {activeView === 'campaigns' && (
                <CampaignBatchView 
                    campaigns={campaigns}
                    onEdit={(campaign) => {
                        setSelectedCampaign(campaign);
                        setShowCampaignForm(true);
                    }}
                    onDelete={async (id) => {
                        const result = await Swal.fire({
                            title: 'ยืนยันการลบ Campaign?',
                            text: 'Flash Sales ใน Campaign จะกลายเป็น Orphan',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#ef4444',
                            confirmButtonText: 'ลบ Campaign'
                        });
                        if (result.isConfirmed) {
                            try {
                                const token = authContextToken || localStorage.getItem('token');
                                await axios.delete(`${API_BASE_URL}/api/admin/campaigns/${id}/`, {
                                    headers: { Authorization: `Token ${token}` }
                                });
                                Swal.fire('ลบแล้ว!', 'Campaign ถูกลบเรียบร้อย', 'success');
                                fetchCampaigns();
                                fetchFlashSales();
                            } catch (error) {
                                Swal.fire('Error', 'ลบไม่สำเร็จ', 'error');
                            }
                        }
                    }}
                    onCreate={() => {
                        setSelectedCampaign(null);
                        setShowCampaignForm(true);
                    }}
                    onViewFlashSales={(campaign) => console.log('View:', campaign)}
                    onEditFlashSale={(sale) => {
                        setFormData({
                            ...sale,
                            name: sale.name || '',
                            description: sale.description || '',
                            start_time: new Date(sale.start_time),
                            end_time: new Date(sale.end_time),
                            banner_image: sale.banner_image,
                            products: sale.products || [],
                            campaign_id: sale.campaign?.id || ''
                        });
                        setPreviewImage(sale.banner_image);
                        setShowModal(true);
                    }}
                />
            )}


            {/* ✅ Flash Sale Creation/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] overflow-y-auto flash-sale-scrollbar">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-orange-950/20 backdrop-blur-md" 
                                onClick={() => setShowModal(false)} 
                            />
                            
                {/* Modal Content */}
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-visible relative z-[1001] border border-orange-100 flex flex-col max-h-[90vh] ml-[280px]"
                            >
                                {/* 🎨 Premium Glassmorphism Header */}
                                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white shrink-0 relative overflow-hidden backdrop-blur-md">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                        <Zap size={180} />
                                    </div>
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            <div className="p-4 bg-white/20 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white/30 group">
                                                <Zap size={32} fill="white" className="group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black tracking-tighter leading-none mb-1">
                                                    {formData.id ? 'แก้ไข Flash Sale' : 'สร้าง Flash Sale ใหม่'}
                                                </h2>
                                                <div className="flex items-center gap-2 text-orange-100 text-sm font-bold opacity-80">
                                                    <div className="w-2 h-2 rounded-full bg-orange-300 animate-pulse" />
                                                    ระบบจัดการแคมเปญระดับมืออาชีพ
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowModal(false)}
                                            className="w-12 h-12 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center transition-all border border-white/20 backdrop-blur-md shadow-lg"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 p-6">
                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                                        
                                        {/* ⬅️ LEFT COLUMN: Form & Products (65%) */}
                                        <div className="lg:col-span-8 space-y-6">
                                            {/* 1. Basic Info Card (Ultra Rounded) */}
                                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 space-y-6 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                                                        <Archive size={24} />
                                                    </div>
                                                    <div className="flex-1 space-y-6">
                                                        <div className="relative">

                                                            <input 
                                                                type="text" 
                                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-orange-500 focus:ring-[6px] focus:ring-orange-100 transition-all font-black text-gray-800 outline-none placeholder:text-gray-300 text-xl"
                                                                placeholder="ตัวอย่าง: Midnight Flash 11.11"
                                                                value={formData.name || ''}
                                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">รายละเอียดการตลาด</label>
                                                            <textarea 
                                                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-orange-500 focus:ring-[6px] focus:ring-orange-100 transition-all font-bold text-gray-600 outline-none resize-none h-28"
                                                                placeholder="เขียนคำบรรยายที่น่าสนใจสำหรับแคมเปญนี้..."
                                                                value={formData.description || ''}
                                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
 
                                            {/* 📅 DUAL CLENDARS (Cascading Logic) */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* --- START DATE/TIME BLOCK --- */}
                                                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-orange-100/20 border border-orange-100/50 relative group transition-all hover:shadow-2xl">
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {/* 🔥 Date Selection */}
                                                        <div className="w-full relative z-30">
                                                            <DatePicker 
                                                                calendarClassName="!bg-white !font-sans !border-0 !shadow-2xl !rounded-[1.5rem] !p-4 font-medium"
                                                                dayClassName={(date) => {
                                                                    const today = new Date();
                                                                    today.setHours(0,0,0,0);
                                                                    if (date < today) return "text-gray-200 opacity-20 pointer-events-none";

                                                                    const isSelected = date.getTime() === new Date(formData.start_time).setHours(0,0,0,0);
                                                                    return `rounded-full m-1 w-10 h-10 flex items-center justify-center text-sm transition-all ${
                                                                        isSelected 
                                                                            ? "bg-orange-500 text-white font-bold shadow-lg shadow-orange-200" 
                                                                            : "text-gray-700 hover:bg-gray-100"
                                                                    }`;
                                                                }}
                                                                weekDayClassName={() => "text-gray-400 text-[10px] font-bold uppercase tracking-widest py-3"}
                                                                renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth }) => (
                                                                    <div className="flex items-center justify-between px-2 pb-4 pt-2 gap-1">
                                                                        <button onClick={decreaseMonth} type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-800 transition-all"><ChevronLeft size={20}/></button>
                                                                        <div className="flex items-center gap-2">
                                                                            <select 
                                                                                value={date.getMonth()} 
                                                                                onChange={({ target: { value } }) => changeMonth(Number(value))}
                                                                                className="bg-gray-50 border-none py-1 px-2 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-100 cursor-pointer appearance-none"
                                                                            >
                                                                                {['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'].map((m, i) => (
                                                                                    <option key={m} value={i}>{m}</option>
                                                                                ))}
                                                                            </select>
                                                                            <select 
                                                                                value={date.getFullYear()} 
                                                                                onChange={({ target: { value } }) => changeYear(Number(value))}
                                                                                className="bg-gray-50 border-none py-1 px-2 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-100 cursor-pointer appearance-none"
                                                                            >
                                                                                {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                                                                                    <option key={y} value={y}>{y + 543}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <button onClick={increaseMonth} type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-800 transition-all"><ChevronRight size={20}/></button>
                                                                    </div>
                                                                )}
                                                                selected={formData.start_time}
                                                                onChange={(date) => {
                                                                    const newDate = new Date(formData.start_time);
                                                                    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                                                    updateTimeAndRollover(newDate, formData.end_time);
                                                                }}
                                                                locale="th"
                                                                minDate={new Date()}
                                                                customInput={
                                                                    <CustomDateInput 
                                                                        icon={Calendar} 
                                                                        onQuickSelect={(date) => {
                                                                            const newD = new Date(formData.start_time);
                                                                            newD.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                                                            updateTimeAndRollover(newD, formData.end_time);
                                                                        }}
                                                                    />
                                                                }
                                                                dateFormat="eee d MMM yyyy"
                                                                popperPlacement="bottom-start"
                                                            >

                                                            </DatePicker>
                                                        </div>
                                                        
                                                        {/* ⏰ Time Selection (Cascading Date-Time Picker) */}
                                                        <ThaiTimePicker 
                                                            label="เวลาเริ่ม" 
                                                            value={formData.start_time} 
                                                            onDateChange={(newDate) => updateTimeAndRollover(newDate, formData.end_time)}
                                                            icon={Clock}
                                                        />
                                                    </div>
                                                </div>

                                                {/* --- END DATE/TIME BLOCK --- */}
                                                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-red-100/20 border border-red-100/50 relative group transition-all hover:shadow-2xl">
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {/* 🔥 Date Selection */}
                                                        <div className="w-full relative z-30">
                                                            <DatePicker 
                                                                calendarClassName="!bg-white !font-sans !border-0 !shadow-2xl !rounded-[1.5rem] !p-4 font-medium"
                                                                dayClassName={(date) => {
                                                                    const start = new Date(formData.start_time);
                                                                    start.setHours(0,0,0,0);
                                                                    if (date < start) return "text-gray-200 opacity-20 pointer-events-none";

                                                                    const isSelected = date.getTime() === new Date(formData.end_time).setHours(0,0,0,0);
                                                                    return `rounded-full m-1 w-10 h-10 flex items-center justify-center text-sm transition-all ${
                                                                        isSelected 
                                                                            ? "bg-red-500 text-white font-bold shadow-lg shadow-red-200" 
                                                                            : "text-gray-700 hover:bg-gray-100"
                                                                    }`;
                                                                }}
                                                                weekDayClassName={() => "text-gray-400 text-[10px] font-bold uppercase tracking-widest py-3"}
                                                                renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth }) => (
                                                                    <div className="flex items-center justify-between px-2 pb-4 pt-2 gap-1">
                                                                        <button onClick={decreaseMonth} type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-800 transition-all"><ChevronLeft size={20}/></button>
                                                                        <div className="flex items-center gap-2">
                                                                            <select 
                                                                                value={date.getMonth()} 
                                                                                onChange={({ target: { value } }) => changeMonth(Number(value))}
                                                                                className="bg-gray-50 border-none py-1 px-2 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 cursor-pointer appearance-none"
                                                                            >
                                                                                {['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'].map((m, i) => (
                                                                                    <option key={m} value={i}>{m}</option>
                                                                                ))}
                                                                            </select>
                                                                            <select 
                                                                                value={date.getFullYear()} 
                                                                                onChange={({ target: { value } }) => changeYear(Number(value))}
                                                                                className="bg-gray-50 border-none py-1 px-2 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 cursor-pointer appearance-none"
                                                                            >
                                                                                {Array.from({length: 10}, (_, i) => new Date().getFullYear() - 1 + i).map(y => (
                                                                                    <option key={y} value={y}>{y + 543}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <button onClick={increaseMonth} type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-800 transition-all"><ChevronRight size={20}/></button>
                                                                    </div>
                                                                )}
                                                                selected={formData.end_time}
                                                                onChange={(date) => {
                                                                    const newD = new Date(formData.end_time);
                                                                    newD.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                                                    if (newD < formData.start_time) {
                                                                        Swal.fire({ icon: 'warning', title: 'วันที่ไม่ถูกต้อง', text: 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม', timer: 2000 });
                                                                        return;
                                                                    }
                                                                    setFormData(prev => ({ ...prev, end_time: newD }));
                                                                }}
                                                                locale="th"
                                                                minDate={formData.start_time}
                                                                customInput={
                                                                    <CustomDateInput 
                                                                        icon={Calendar} 
                                                                        onQuickSelect={(date) => {
                                                                            const newD = new Date(formData.end_time);
                                                                            newD.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                                                            if (newD < formData.start_time) {
                                                                                Swal.fire({ icon: 'warning', title: 'วันที่ไม่ถูกต้อง', text: 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม', timer: 2000 });
                                                                                return;
                                                                            }
                                                                            setFormData(prev => ({ ...prev, end_time: newD }));
                                                                        }}
                                                                    />
                                                                }
                                                                dateFormat="eee d MMM yyyy"
                                                                popperPlacement="bottom-start"
                                                            >

                                                            </DatePicker>
                                                        </div>

                                                        {/* ⏰ Time Selection (Cascading Date-Time Picker) */}
                                                        <ThaiTimePicker 
                                                            label="เวลาสิ้นสุด" 
                                                            value={formData.end_time} 
                                                            onDateChange={(newDate) => {
                                                                if (newDate < formData.start_time) {
                                                                    return;
                                                                }
                                                                setFormData(prev => ({ ...prev, end_time: newDate }));
                                                            }} 
                                                            icon={Clock}
                                                        />
                                                    </div>

                                                {/* ⏳ DURATION FEEDBACK (Contextual Feedback) */}
                                                {formData.start_time && formData.end_time && (
                                                    <div className="mt-4 flex items-center justify-center">
                                                        <div className="px-4 py-1.5 bg-gray-900 rounded-full flex items-center gap-2 shadow-lg shadow-gray-200 border border-white/10 group overflow-hidden relative">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <Clock size={12} className="text-orange-400" />
                                                            <span className="text-[10px] font-black text-white tracking-widest uppercase">
                                                                {(() => {
                                                                    const diff = formData.end_time - formData.start_time;
                                                                    if (diff <= 0) return "ระยะเวลา 0 ชม.";
                                                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                                                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                                    const days = Math.floor(hours / 24);
                                                                    const remainingHours = hours % 24;
                                                                    
                                                                    if (days > 0) return `ระยะเวลา ${days} วัน ${remainingHours} ชม.`;
                                                                    if (hours > 0) return `ระยะเวลา ${hours} ชม. ${mins} นาที`;
                                                                    return `ระยะเวลา ${mins} นาที`;
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            </div>

                                            {/* 2. Logic Controls (Ultra Rounded) */}
                                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                    <SlidersHorizontal size={80} />
                                                </div>

                                                <IOSSwitch 
                                                    label="เก็บเงินปลายทาง (COD)" 
                                                    subLabel={!formData.no_cod ? "อนุญาตเก็บเงินปลายทาง" : "ไม่อนุญาต COD"} 
                                                    checked={!formData.no_cod} 
                                                    onChange={v => setFormData({...formData, no_cod: !v})} 
                                                    icon={Truck}
                                                    color={!formData.no_cod ? "green" : "red"}
                                                />
                                                <IOSSwitch 
                                                    label="ใช้ร่วมคูปอง" 
                                                    subLabel="ลดทับซ้อนได้" 
                                                    checked={formData.can_use_coupon} 
                                                    onChange={v => setFormData({...formData, can_use_coupon: v})} 
                                                    icon={Ticket}
                                                    color="purple"
                                                />
                                                <IOSSwitch 
                                                    label="ดีลเฉพาะสมาชิก" 
                                                    subLabel="สิทธิ์ Member Only" 
                                                    checked={formData.is_member_only} 
                                                    onChange={v => setFormData({...formData, is_member_only: v})} 
                                                    icon={User}
                                                    color="indigo"
                                                />
                                            </div>

                                            {/* 3. Inventory Integration (Extended Table) */}
                                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 flex flex-col gap-6">

                                                {/* 🏷️✨ Smart Selection Mode */}
                                                <div className="flex flex-col gap-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="flex items-center gap-3 text-2xl font-black text-gray-800 tracking-tighter">
                                                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                                                <Package size={20} />
                                                            </div>
                                                            Deal Inventory
                                                            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-black ml-2 shadow-lg">{formData.products.length}</span>
                                                        </h3>
                                                        
                                                        {/* 🔄 Mode Toggle */}
                                                        <div className="bg-gray-100 p-1.5 rounded-xl flex items-center gap-1 shadow-inner">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setUseTagMode(false)}
                                                                className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all ${
                                                                    !useTagMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                            >
                                                                <List size={14} /> รายชิ้น
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => setUseTagMode(true)}
                                                                className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 transition-all ${
                                                                    useTagMode ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                            >
                                                                <Tag size={14} /> เลือกจาก Tags
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 🚀 TAG MODE UI */}
                                                    {useTagMode && (
                                                        <div className="bg-orange-50/50 rounded-[2rem] p-6 border border-orange-100 animation-fade-in-up">
                                                            <div className="flex flex-col gap-6">
                                                                {/* 1. Tag List */}
                                                                <div>
                                                                    <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">
                                                                        1. เลือกกลุ่มสินค้า (Tags)
                                                                    </label>
                                                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                                                        {tags.map(tag => {
                                                                            const isSelected = selectedTags.includes(tag.id);
                                                                            return (
                                                                                <button
                                                                                    key={tag.id}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        if (isSelected) setSelectedTags(prev => prev.filter(id => id !== tag.id));
                                                                                        else setSelectedTags(prev => [...prev, tag.id]);
                                                                                    }}
                                                                                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                                                                        isSelected 
                                                                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 scale-105' 
                                                                                        : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200 hover:text-orange-500'
                                                                                    }`}
                                                                                >
                                                                                    {tag.name}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                        {tags.length === 0 && <div className="text-gray-400 text-sm">ไม่พบ Tags ในระบบ</div>}
                                                                    </div>
                                                                </div>

                                                                {/* 2. Pricing Rule */}
                                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                                                                    <div className="lg:col-span-2">
                                                                        <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">
                                                                            2. ตั้งราคาทั้งกลุ่ม (Pricing Rule)
                                                                        </label>
                                                                        <div className="flex flex-col sm:flex-row gap-6 p-6 bg-white rounded-2xl border border-orange-100 shadow-sm">
                                                                            <div className="flex-1">
                                                                                <label className="text-xs text-gray-400 font-bold mb-2 block">รูปแบบราคา</label>
                                                                                <div className="flex bg-gray-50 rounded-xl p-1.5 gap-1">
                                                                                    <button 
                                                                                        type="button" 
                                                                                        onClick={() => setTagDiscountType('percent')}
                                                                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${tagDiscountType === 'percent' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                                                                                    >
                                                                                        % ส่วนลด
                                                                                    </button>
                                                                                    <button 
                                                                                        type="button" 
                                                                                        onClick={() => setTagDiscountType('fixed')}
                                                                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${tagDiscountType === 'fixed' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}
                                                                                    >
                                                                                        ราคาเดียว
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            <div className="hidden sm:block w-px bg-gray-100 my-2" />
                                                                            <div className="flex-1">
                                                                                <label className="text-xs text-xs text-gray-400 font-bold mb-2 block">
                                                                                    {tagDiscountType === 'percent' ? 'ลดกี่ % (จากราคาเต็ม)' : 'ขายราคาเท่าไหร่ (บาท)'}
                                                                                </label>
                                                                                <div className="relative">
                                                                                    <input 
                                                                                        type="number" 
                                                                                        value={tagDiscountValue}
                                                                                        onChange={e => setTagDiscountValue(e.target.value)}
                                                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-100 rounded-xl px-4 py-2.5 font-black text-gray-900 focus:ring-4 focus:ring-orange-50 outline-none text-lg transition-all"
                                                                                        placeholder="0"
                                                                                    />
                                                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">
                                                                                        {tagDiscountType === 'percent' ? '%' : '฿'}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* 3. Action Button */}
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleAddProductsByTags}
                                                                        disabled={selectedTags.length === 0}
                                                                        className="h-[108px] w-full bg-gray-900 text-white rounded-[1.5rem] font-black hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-200 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:grayscale active:scale-95 group"
                                                                    >
                                                                        <div className="bg-white/10 p-2 rounded-full mb-1 group-hover:bg-white/20 transition-all">
                                                                            <Plus size={20} className={selectedTags.length > 0 ? 'animate-bounce' : ''} />
                                                                        </div>
                                                                        <span className="text-sm tracking-widest uppercase">ดึงสินค้าลงตาราง</span>
                                                                        <span className="text-[10px] text-gray-400 font-normal group-hover:text-white/80">พร้อมคำนวณราคาอัตโนมัติ</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* MANUAL BUTTON (Only in Manual Mode) */}
                                                    {!useTagMode && (
                                                        <div className="flex justify-end">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setShowProductSelector(true)}
                                                                className="px-6 py-3 bg-gray-900 text-white rounded-[1.25rem] font-black text-sm hover:bg-orange-600 hover:shadow-2xl hover:shadow-orange-200 transition-all flex items-center gap-2 active:scale-95 group"
                                                            >
                                                                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                                                เปิดคลังเลือกรายชิ้น
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expanded Product List */}
                                                <div className="bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200 overflow-hidden min-h-[300px] flex flex-col">
                                                    {formData.products.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-left">
                                                                <thead className="bg-white/50 backdrop-blur-sm text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
                                                                    <tr>
                                                                        <th className="px-6 py-4">รายละเอียดสินค้า</th>
                                                                        <th className="px-6 py-4 text-center">ราคาปกติ</th>
                                                                        <th className="px-4 py-3 w-[200px] text-center">ราคา FLASH SALE</th>
                                                                        <th className="px-4 py-3 text-center w-32">โควต้า</th>
                                                                        <th className="px-4 py-3 text-center w-10"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {formData.products.map((item, idx) => (
                                                                        <tr key={idx} className="border-b border-gray-50 hover:bg-orange-50/20 transition-all group/row">
                                                                            <td className="px-6 py-5">
                                                                                <div className="flex items-center gap-5">
                                                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 p-1 shrink-0 shadow-sm overflow-hidden group-hover/row:scale-110 group-hover/row:rotate-3 transition-all duration-300">
                                                                                        {item.product_image ? (
                                                                                            <img src={getImageUrl(item.product_image)} className="w-full h-full object-cover rounded-[1rem]" alt="" />
                                                                                        ) : <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300"><Package size={20} /></div>}
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <div className="font-black text-gray-900 text-base line-clamp-1 tracking-tight" title={item.product_name}>{item.product_name}</div>
                                                                                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">ID: {item.product_id}</div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-5 text-center">
                                                                                <span className="text-xs font-black text-gray-300 line-through tracking-tighter">
                                                                                    ฿{parseFloat(item.original_price).toLocaleString()}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-6 py-5">
                                                                                <div className="relative group/price w-[180px]">
                                                                                    {/* 🛠️ Improved Price Visibility: pl-10 for icon space, text-right for alignment */}
                                                                                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-orange-500 font-black text-sm z-10 pointer-events-none">฿</span>
                                                                                    
                                                                                    {/* ➕➖ Stepper Controls */}
                                                                                    <div className="flex items-center">
                                                                                        <button 
                                                                                            type="button" 
                                                                                            onClick={() => {
                                                                                                const val = parseFloat(item.sale_price) || 0;
                                                                                                updateProductRow(idx, 'sale_price', Math.max(0, val - 1));
                                                                                            }}
                                                                                            className="w-8 h-12 bg-gray-50 border-y-2 border-l-2 border-gray-100 rounded-l-2xl text-gray-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 flex items-center justify-center transition-all active:scale-95"
                                                                                        >
                                                                                            <Minus size={12} strokeWidth={4} />
                                                                                        </button>
                                                                                        
                                                                                        <input 
                                                                                            type="text" 
                                                                                            className={`w-full pl-2 pr-2 py-3 bg-gray-50 border-y-2 border-transparent transition-all font-black text-gray-900 outline-none text-xl tracking-tighter shadow-inner text-center h-12
                                                                                                ${rowErrors[idx]?.sale_price 
                                                                                                    ? 'bg-red-50 text-red-600 focus:bg-white' 
                                                                                                    : 'focus:bg-white focus:border-orange-500 hover:bg-white'
                                                                                                }`}
                                                                                            value={item.sale_price}
                                                                                            onChange={(e) => updateProductRow(idx, 'sale_price', e.target.value)}
                                                                                        />

                                                                                        <button 
                                                                                            type="button" 
                                                                                            onClick={() => {
                                                                                                const val = parseFloat(item.sale_price) || 0;
                                                                                                updateProductRow(idx, 'sale_price', Math.min(item.original_price, val + 1));
                                                                                            }}
                                                                                            className="w-8 h-12 bg-gray-50 border-y-2 border-r-2 border-gray-100 rounded-r-2xl text-gray-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 flex items-center justify-center transition-all active:scale-95"
                                                                                        >
                                                                                            <Plus size={12} strokeWidth={4} />
                                                                                        </button>
                                                                                    </div>

                                                                                    {rowErrors[idx]?.sale_price && (
                                                                                        <div className="absolute -bottom-5 left-0 w-full text-center">
                                                                                            <span className="text-[9px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">{rowErrors[idx].sale_price}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-tighter animate-pulse">
                                                                                        -{item.original_price && item.sale_price ? Math.floor(((item.original_price - item.sale_price)/item.original_price)*100) : 0}%
                                                                                    </span>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-5 text-center">
                                                                                <div className="relative flex items-center">
                                                                                    <button 
                                                                                        type="button" 
                                                                                        onClick={() => {
                                                                                            const val = parseInt(item.limit) || 0;
                                                                                            updateProductRow(idx, 'limit', Math.max(0, val - 1));
                                                                                        }}
                                                                                        className="w-8 h-12 bg-gray-50 border-y-2 border-l-2 border-gray-100 rounded-l-2xl text-gray-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 flex items-center justify-center transition-all active:scale-95"
                                                                                    >
                                                                                        <Minus size={12} strokeWidth={4} />
                                                                                    </button>

                                                                                    <input 
                                                                                        type="text" 
                                                                                        value={item.limit}
                                                                                        onChange={(e) => updateProductRow(idx, 'limit', e.target.value)}
                                                                                        onKeyDown={(e) => {
                                                                                            // 🚫 Block special chars & signs
                                                                                            if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                                                                                                e.preventDefault();
                                                                                            }
                                                                                        }}
                                                                                        className={`w-16 px-0 py-3 bg-gray-50 border-y-2 border-transparent transition-all font-black text-gray-900 outline-none text-center text-lg shadow-inner h-12
                                                                                            ${rowErrors[idx]?.limit 
                                                                                                ? 'bg-red-50 text-red-600 focus:bg-white' 
                                                                                                : 'focus:bg-white focus:border-orange-500 hover:bg-white'
                                                                                            }`}
                                                                                        placeholder="Quota"
                                                                                    />

                                                                                    <button 
                                                                                        type="button" 
                                                                                        onClick={() => {
                                                                                            const val = parseInt(item.limit) || 0;
                                                                                            updateProductRow(idx, 'limit', Math.min(item.stock, val + 1));
                                                                                        }}
                                                                                        className="w-8 h-12 bg-gray-50 border-y-2 border-r-2 border-gray-100 rounded-r-2xl text-gray-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 flex items-center justify-center transition-all active:scale-95"
                                                                                    >
                                                                                        <Plus size={12} strokeWidth={4} />
                                                                                    </button>

                                                                                    {rowErrors[idx]?.limit && (
                                                                                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-32 text-center pointer-events-none z-10">
                                                                                            <span className="text-[9px] font-black text-white bg-red-500 px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">{rowErrors[idx].limit}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-5 text-center">
                                                                                <button 
                                                                                    type="button"
                                                                                    onClick={() => removeProductFromSale(idx)}
                                                                                    className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100 shadow-sm active:scale-95 group/del"
                                                                                >
                                                                                    <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-gray-400">
                                                            <Package size={48} className="mb-4 opacity-20" />
                                                            <p className="font-bold">ยังไม่ได้เลือกสินค้า</p>
                                                            <p className="text-sm">กดปุ่ม "เพิ่มสินค้า" เพื่อเริ่มจัดการ</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ➡️ RIGHT COLUMN: Sticky Sidebar (35%) */}
                                        <div className="lg:col-span-4 relative">
                                            <div className="sticky top-0 space-y-4">
                                                {/* 📊 CONFIGURATION SUMMARY (Smart Overview) */}
                                                {/* 🏷️ Smart Summary Section (Live Sidebar) */}
                                                <div className="bg-white rounded-[2.5rem] border border-orange-100 p-8 shadow-2xl shadow-orange-100/30 space-y-6 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:bg-orange-100 transition-colors" />
                                                    
                                                    <h4 className="text-[11px] font-black text-orange-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 relative z-10">
                                                        <SlidersHorizontal size={14} className="text-orange-500" />
                                                        สรุปข้อมูลแบบเรียลไทม์
                                                    </h4>
                                                    
                                                    <div className="space-y-5 relative z-10">




                                                        {/* 📦 Products count */}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">สินค้า</span>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                                                                    <Package size={16} className="text-orange-500" />
                                                                    {formData.products.length} รายการ
                                                                </span>
                                                                <span className="text-[9px] font-bold text-gray-300">ความจุสินค้าที่รอคิว</span>
                                                            </div>
                                                        </div>

                                                        {/* ✨ Feature Matrix */}
                                                        <div className="pt-2">
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {modalActiveOptions.length > 0 ? (
                                                                    modalActiveOptions.map(opt => (
                                                                        <span key={opt.label} className={`text-[10px] font-black uppercase px-3 py-1 rounded-full bg-${opt.color}-50 text-${opt.color}-600 border border-${opt.color}-100 shadow-sm animate-in fade-in zoom-in duration-300`}>
                                                                            {opt.label}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-[10px] text-gray-300 italic font-medium p-2 bg-gray-50 rounded-xl w-full text-center border border-dashed">ไม่มีเงื่อนไขพิเศษเพิ่มเติม</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Save Button (Action) */}
                                                <button 
                                                    type="submit" 
                                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg uppercase tracking-wider shadow-xl shadow-gray-200 hover:bg-orange-600 hover:shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                                                >
                                                    <Save size={20} />
                                                    บันทึก Flash Sale
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product Selection Modal (New) */}
            <ProductSelectorModal 
                isOpen={showProductSelector}
                onClose={() => setShowProductSelector(false)}
                products={products}
                categories={categories}
                apiBaseUrl={API_BASE_URL}
                initialSelected={formData.products}
                onConfirm={(selectedObjects) => {
                    const currentMap = new Map(formData.products.map(p => [p.product_id || p.id, p]));
                    const newProducts = selectedObjects.map(p => {
                        const existing = currentMap.get(p.id);
                        if (existing) return existing;
                        return {
                             product_id: p.id,
                             product_name: p.title || p.product_name || 'No Name',
                             product_image: p.image || p.thumbnail,
                             original_price: parseFloat(p.price) || 0,
                             sale_price: parseFloat(p.price) || 0,
                             limit: p.stock || 0, // Default to full stock or 0
                             stock: p.stock || 0, // Keep track of real stock
                             limit_per_user: 1,
                             discount_mode: 'price',
                             discount_percent: 0
                        };
                    });
                    setFormData({ ...formData, products: newProducts });
                }}
            />

            {/* Add Product Modal (Price/Percent Toggle) */}
            <AnimatePresence>
                {productToAdd && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setProductToAdd(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-[1101] overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center">
                                <h3 className="text-xl font-black uppercase tracking-wider">เพิ่มสินค้า</h3>
                                <p className="text-orange-100 text-sm font-medium mt-1">{productToAdd.title}</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Price / Percent Checkbox */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                            {productToAdd.discount_mode === 'percent' ? 'ส่วนลด (%)' : 'ราคาขาย (บาท)'}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProductToAdd(prev => {
                                                    const isToPercent = prev.discount_mode !== 'percent';
                                                    let updates = { discount_mode: isToPercent ? 'percent' : 'price' };
                                                    
                                                    if (isToPercent) {
                                                        // Calculate current percent from price
                                                        const currentPrice = prev.sale_price !== undefined ? prev.sale_price : prev.original_price;
                                                        const percent = prev.original_price ? Math.round(((prev.original_price - currentPrice) / prev.original_price) * 100) : 0;
                                                        updates.discount_percent = percent > 0 ? percent : 0;
                                                        updates.sale_price = currentPrice; // Keep price consistent
                                                    } else {
                                                        // Switching back to price, ensure price is correct
                                                        const percent = prev.discount_percent || 0;
                                                        const price = Math.floor(prev.original_price * (1 - (percent / 100)));
                                                        updates.sale_price = price;
                                                    }
                                                    return { ...prev, ...updates };
                                                });
                                            }}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                                        >
                                            {productToAdd.discount_mode === 'percent' ? 'เปลี่ยนเป็น บาท (฿)' : 'เปลี่ยนเป็น เปอร์เซ็นต์ (%)'}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        {productToAdd.discount_mode === 'percent' ? (
                                            <input 
                                                type="number"
                                                min="0" max="99"
                                                autoFocus
                                                value={productToAdd.discount_percent || ''}
                                                onKeyDown={(e) => ["-", "e", "+"].includes(e.key) && e.preventDefault()}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    // Remove non-digits just in case
                                                    val = val.replace(/[^0-9]/g, '');
                                                    const percent = Math.min(parseInt(val) || 0, 99);
                                                    
                                                    const newPrice = Math.floor(productToAdd.original_price * (1 - (percent / 100)));
                                                    setProductToAdd(prev => ({ 
                                                        ...prev, 
                                                        discount_percent: percent,
                                                        sale_price: newPrice 
                                                    }));
                                                }}
                                                placeholder="0"
                                                className="w-full bg-red-50 border border-red-100 text-red-600 font-black text-3xl text-center rounded-xl py-4 focus:ring-4 focus:ring-red-100 outline-none placeholder-red-200"
                                            />
                                        ) : (
                                            <input 
                                                type="number"
                                                min="0"
                                                max={productToAdd.original_price}
                                                autoFocus
                                                value={productToAdd.sale_price}
                                                onKeyDown={(e) => ["-", "e", "+"].includes(e.key) && e.preventDefault()}
                                                onChange={(e) => {
                                                    let val = parseInt(e.target.value) || 0;
                                                    if (val > productToAdd.original_price) val = productToAdd.original_price;
                                                    if (val < 0) val = 0;
                                                    
                                                    setProductToAdd(prev => ({ ...prev, sale_price: val }));
                                                }}
                                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 font-black text-3xl text-center rounded-xl py-4 focus:ring-4 focus:ring-gray-100 outline-none"
                                            />
                                        )}
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                                            {productToAdd.discount_mode === 'percent' ? '%' : '฿'}
                                        </span>
                                    </div>

                                    {/* Calculation Result */}
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-500">
                                            {productToAdd.discount_mode === 'percent' ? (
                                                <>ราคาขายจริง: <span className="text-red-500">฿{(productToAdd.sale_price ?? 0).toLocaleString()}</span></>
                                            ) : (
                                                <>ลดไป: <span className="text-red-500">{productToAdd.sale_price && productToAdd.original_price ? Math.round(((productToAdd.original_price - productToAdd.sale_price) / productToAdd.original_price) * 100) : 0}%</span></>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">จากปกติ ฿{(productToAdd.original_price ?? 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">โควต้า (ชิ้น)</label>
                                    <input 
                                        type="number"
                                        value={productToAdd.quantity_limit}
                                        onChange={(e) => setProductToAdd(prev => ({ ...prev, quantity_limit: parseInt(e.target.value) || 0 }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center font-bold text-gray-800 focus:border-orange-500 outline-none"
                                    />
                                </div>
                                
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => setProductToAdd(null)}
                                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, products: [...prev.products, {
                                                product_id: productToAdd.id,
                                                product_name: productToAdd.title,
                                                product_image: productToAdd.thumbnail,
                                                original_price: productToAdd.original_price,
                                                sale_price: productToAdd.sale_price,
                                                discount_mode: productToAdd.discount_mode,
                                                quantity_limit: productToAdd.quantity_limit,
                                                limit_per_user: productToAdd.limit_per_user || 1,
                                                sold_count: 0
                                            }] }));
                                            setProductToAdd(null);
                                            // Optional: Close selector too
                                            // setShowProductSelector(false); 
                                        }}
                                        className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-colors"
                                    >
                                        ยืนยัน
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* 📝 Campaign Form Modal */}
            <CampaignForm 
                isOpen={showCampaignForm}
                onClose={() => {
                    setShowCampaignForm(false);
                    setSelectedCampaign(null);
                }}
                campaign={selectedCampaign}
                onSave={(data) => saveCampaign(data, data.id)}
                availableFlashSales={flashSales}
            />

        </div>
    );
};
export default FlashSaleManagement;
