import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
    MoreHorizontal, X, AlertTriangle, Layers, Zap, Tag,
    Info, CheckCircle, Search, Filter
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// ------------------- MOCK DATA -------------------
const MOCK_EVENTS = [
    { id: 1, type: 'flash', title: 'Flash Sale', date: new Date(2024, 3, 10), duration: 2, color: 'bg-gray-200 text-gray-700 border-gray-300' }, // April 10, 2024
    { id: 2, type: 'coupon', title: 'New User Code', date: new Date(2024, 3, 15), duration: 5, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { id: 3, type: 'flash', title: 'Mid-Month Madness', date: new Date(2024, 3, 15), duration: 1, color: 'bg-gray-200 text-gray-700 border-gray-300' },
    { id: 4, type: 'flash', title: 'Payday Sale', date: new Date(2024, 3, 23), duration: 3, color: 'bg-gray-200 text-gray-700 border-gray-300' },
];

// ------------------- UTILS -------------------
const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
};

const TERMS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ------------------- COMPONENTS -------------------

// 1. Tab Navigation
const Tabs = ({ tabs, activeTab, setActiveTab }) => (
    <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold transition-all relative ${
                    activeTab === tab 
                    ? 'text-gray-900 border-b-2 border-gray-900' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                {tab}
            </button>
        ))}
    </div>
);

const PromotionManager = () => {
    // --- State ---
    // Left Panel Form
    const [promoName, setPromoName] = useState('');
    const [couponCode, setCouponCode] = useState(''); // New
    const [promoType, setPromoType] = useState('coupon'); // 'coupon' | 'flash'
    const [status, setStatus] = useState('active');
    const [activeTab, setActiveTab] = useState('Basic'); // 'Basic' | 'Conditions' | 'Visibility'
    
    // Conditions & Values
    const [discountType, setDiscountType] = useState('percent');
    const [discountValue, setDiscountValue] = useState(0);
    const [maxDiscount, setMaxDiscount] = useState('');
    const [minSpend, setMinSpend] = useState(0); // New
    const [isMemberOnly, setIsMemberOnly] = useState(false); // New
    
    // Dates
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));

    // Right Panel Calendar
    const [currentDate, setCurrentDate] = useState(new Date(2024, 3, 1)); // Start at April 2024 per mockup
    const [viewMode, setViewMode] = useState('Monthly'); // 'Monthly' | 'Weekly' | 'Daily'
    const [selectedDate, setSelectedDate] = useState(null);

    // --- Computed ---
    const daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const firstDay = getFirstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());

    // Generate Calendar Grid
    const calendarDays = useMemo(() => {
        let days = [];
        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null });
        }
        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            // Find events for this day
            const events = MOCK_EVENTS.filter(e => {
                const eventEnd = new Date(e.date);
                eventEnd.setDate(e.date.getDate() + e.duration - 1);
                return date >= e.date && date <= eventEnd;
            });
            days.push({ day: i, date, events });
        }
        return days;
    }, [currentDate]);

    // --- Handlers ---
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
            {/* Top Bar removed for integration (contained in standard Layout of app) */}
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-screen overflow-hidden">
                
                {/* ================= LEFT PANEL: Create/Edit Promotion ================= */}
                <div className="lg:col-span-4 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-xl overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                        <h2 className="text-lg font-black tracking-tight text-gray-800">Create/Edit Promotion</h2>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
                    </div>

                    <div className="p-6 space-y-6 flex-1">
                        {/* Top Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Promotion Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Songkran Splash Sale"
                                    value={promoName}
                                    onChange={(e) => setPromoName(e.target.value)}
                                />
                            </div>

                            {promoType === 'coupon' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Coupon Code</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag size={16} className="text-gray-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase tracking-wider"
                                            placeholder="CODE123"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Promotion Type</label>
                                    <div className="flex items-center gap-4 py-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="ptype" checked={promoType === 'coupon'} onChange={() => setPromoType('coupon')} className="accent-blue-600 w-4 h-4"/>
                                            <span className="text-sm font-bold text-gray-700">Coupon</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="ptype" checked={promoType === 'flash'} onChange={() => setPromoType('flash')} className="accent-blue-600 w-4 h-4"/>
                                            <span className="text-sm font-bold text-gray-700">Flash Sale</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Status</label>
                                    <select 
                                        value={status} onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date Range Selectors */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Start Date</label>
                                    <DatePicker 
                                        selected={startDate} 
                                        onChange={(date) => setStartDate(date)} 
                                        showTimeSelect
                                        dateFormat="d MMM yyyy, HH:mm"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">End Date</label>
                                    <DatePicker 
                                        selected={endDate} 
                                        onChange={(date) => setEndDate(date)} 
                                        showTimeSelect
                                        dateFormat="d MMM yyyy, HH:mm"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs tabs={['Basic', 'Conditions', 'Visibility']} activeTab={activeTab} setActiveTab={setActiveTab} />

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'Basic' && (
                                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="space-y-6">
                                    
                                    {/* Discount Section */}
                                    {/* Discount Section */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-black text-gray-900 border-b pb-2">Conditions & Discount</h3>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Discount Type</label>
                                                <select 
                                                    value={discountType} onChange={(e) => setDiscountType(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm font-medium"
                                                >
                                                    <option value="percent">Percent (%)</option>
                                                    <option value="amount">Fixed Amount (฿)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Value</label>
                                                <input 
                                                    type="number" 
                                                    value={discountValue}
                                                    onChange={(e) => setDiscountValue(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm font-medium text-right" 
                                                    placeholder="0" 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Minimum Spend</label>
                                                <input 
                                                    type="number" 
                                                    value={minSpend}
                                                    onChange={(e) => setMinSpend(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm font-medium" 
                                                    placeholder="0" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Maximum Discount</label>
                                                <input 
                                                    type="number" 
                                                    value={maxDiscount}
                                                    onChange={(e) => setMaxDiscount(e.target.value)}
                                                    disabled={discountType !== 'percent'}
                                                    className={`w-full border border-gray-300 rounded-md px-2 py-2 text-sm font-medium ${discountType !== 'percent' ? 'bg-gray-100 text-gray-400' : ''}`}
                                                    placeholder={discountType === 'percent' ? "No limit" : "N/A"} 
                                                />
                                            </div>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={isMemberOnly}
                                                onChange={(e) => setIsMemberOnly(e.target.checked)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                                            />
                                            <span className="text-sm font-bold text-gray-700">Member Only Exclusive</span>
                                        </label>

                                        <div className="space-y-2 pt-2 border-t border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase">Usage Scope</h4>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <span className="text-xs font-bold text-gray-600">Can use with Flash Sale</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <span className="text-xs font-bold text-gray-600">Stackable with other coupons</span>
                                            </label>
                                        </div>
                                    </section>

                                    {/* Scope Section */}
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-black text-gray-900 border-b pb-2">Scope</h3>
                                        <div className="flex gap-4">
                                            {['All Products', 'Category', 'Specific SKUs'].map(option => (
                                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="scope" className="accent-blue-600" defaultChecked={option === 'Category'}/>
                                                    <span className="text-xs font-bold text-gray-600">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Quota Section */}
                                    <section className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <h3 className="text-sm font-black text-gray-900">Quota & Limits</h3>
                                        
                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-4">
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Total Supply</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" value="1,000"/>
                                            </div>
                                            <div className="col-span-8 flex items-center gap-2">
                                                <input type="checkbox" className="accent-blue-600 w-4 h-4" defaultChecked />
                                                <span className="text-xs font-bold text-gray-600">Quota Per User</span>
                                                <input type="text" className="w-16 border border-gray-300 rounded-md px-2 py-1 text-xs text-center" value="1/person" readOnly/>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-4">
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Daily Limit</label>
                                                <input type="text" className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm" value="100/day"/>
                                            </div>
                                            <div className="col-span-8 flex items-center gap-2">
                                                <input type="checkbox" className="accent-blue-600 w-4 h-4" />
                                                <span className="text-xs font-bold text-gray-600">Limit / User / Day</span>
                                            </div>
                                        </div>
                                    </section>

                                     {/* Date Range - Updated to look like mockup */}
                                     {/* This actually belongs in 'Visibility' or 'Basic' bottom usually */}
                                     <section className="space-y-2">
                                         <label className="text-xs font-bold text-gray-500 uppercase">Active Duration</label>
                                         <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200">
                                             <CalendarIcon size={16} className="text-gray-500"/>
                                             <span className="text-xs font-bold text-gray-700">04/20/2024 08:00</span>
                                             <span className="text-gray-400">—</span>
                                             <span className="text-xs font-bold text-gray-700">04/25/2024 23:59</span>
                                         </div>
                                     </section>

                                </motion.div>
                            )}
                            {activeTab !== 'Basic' && (
                                <div className="flex items-center justify-center h-48 text-gray-400 text-sm font-medium italic">
                                    Content for {activeTab} tab...
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0 z-20 flex gap-3">
                        <button className="flex-1 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 text-sm transition-colors">Preview</button>
                        <button className="flex-1 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 text-sm transition-colors">Cancel</button>
                        <button className="flex-1 py-3 rounded-lg bg-[#2B5F9E] hover:bg-[#20497A] text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all transform active:scale-95">Activate</button>
                    </div>
                </div>

                {/* ================= RIGHT PANEL: Calendar ================= */}
                <div className="lg:col-span-8 bg-gray-50 flex flex-col h-full relative overflow-hidden">
                    
                    {/* Calendar Header */}
                    <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
                        <h2 className="text-lg font-black text-gray-800">Promotion Calendar</h2>
                        <div className="flex gap-2 text-sm font-bold text-gray-500">
                           <button className="hover:text-gray-900"><MoreHorizontal size={20}/></button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="px-6 py-4 flex justify-between items-center">
                        {/* View Switcher */}
                        <div className="bg-white border border-gray-300 rounded-lg p-1 flex">
                            {['Monthly', 'Weekly', 'Daily'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setViewMode(v)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === v ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        {/* Date Nav */}
                        <div className="flex items-center gap-4">
                             <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                <ChevronRight size={16} className="text-gray-400 rotate-90" /> {/* Mock dropdown arrow */}
                             </div>
                             <div className="flex item-center bg-white border border-gray-300 rounded-lg">
                                 <button onClick={prevMonth} className="p-2 border-r border-gray-200 hover:bg-gray-50 text-gray-600"><ChevronLeft size={16}/></button>
                                 <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-bold text-gray-600 hover:bg-gray-50">Today</button>
                                 <button onClick={nextMonth} className="p-2 border-l border-gray-200 hover:bg-gray-50 text-gray-600"><ChevronRight size={16}/></button>
                             </div>
                        </div>
                    </div>

                    {/* Calendar Grid Container */}
                    <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            
                            {/* Days Header */}
                            <div className="grid grid-cols-7 border-b border-gray-200">
                                {TERMS.map(d => (
                                    <div key={d} className="py-2.5 text-center text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50/50">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-5">
                                {calendarDays.map((dateObj, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => dateObj.day && setSelectedDate(dateObj.date)}
                                        className={`
                                            border-b border-r border-gray-100 p-2 relative transition-all group hover:bg-gray-50 cursor-pointer
                                            ${!dateObj.day ? 'bg-gray-50/20' : ''}
                                            ${i % 7 === 0 ? 'border-l-0' : ''}
                                            ${i % 7 === 6 ? 'border-r-0' : ''}
                                        `}
                                    >
                                        {dateObj.day && (
                                            <>
                                                <span className={`text-xs font-bold ${
                                                    new Date().toDateString() === dateObj.date?.toDateString() 
                                                    ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-md' 
                                                    : 'text-gray-700 group-hover:text-black'
                                                }`}>
                                                    {dateObj.day}
                                                </span>

                                                {/* Events List */}
                                                <div className="mt-2 space-y-1">
                                                    {dateObj.events.map((event, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className={`
                                                                text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 truncate
                                                                ${event.color}
                                                                ${event.type === 'flash' && dateObj.date.getDate() % 2 === 0 ? 'bg-[length:4px_4px] bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)]' : ''} 
                                                            `}
                                                        >
                                                            <span className={`uppercase text-[8px] font-black tracking-tighter opacity-80 ${event.type === 'flash' ? 'text-gray-500' : 'text-indigo-600'}`}>
                                                                {event.type === 'flash' ? 'FL' : 'CO'}
                                                            </span>
                                                            <span className="truncate">{event.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        
                                        {/* Mock Collision Tooltip (Visual Only - pinned to a specific date for demo) */}
                                        {dateObj.day === 15 && (
                                            <motion.div 
                                                initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}}
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-3"
                                            >
                                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                                    <div className="text-xs font-bold text-red-500 flex items-center gap-1">
                                                        <X size={12}/> Overlap
                                                    </div>
                                                    <ChevronRight size={12} className="rotate-90 text-gray-300"/>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                                                        <div className="text-[10px] font-bold text-gray-700">Flash Sale</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-indigo-500 rounded-sm"></div>
                                                        <div className="text-[10px] font-bold text-gray-700">Buy 2 Get 1 Free</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-indigo-300 rounded-sm"></div>
                                                        <div className="text-[10px] font-bold text-gray-700">CO NEW100</div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-[9px] text-gray-400 font-medium bg-red-50 p-1.5 rounded text-center">
                                                    ⚠️ 5 overlapping items
                                                </div>
                                            </motion.div>
                                        )}

                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer (Legend & Actions) */}
                        <div className="mt-4 flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
                                    <span className="text-xs font-bold text-gray-600">Flash Sale</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-indigo-100 border border-indigo-200"></div>
                                    <span className="text-xs font-bold text-gray-600">Coupon</span>
                                </div>
                            </div>
                             <div className="flex gap-2">
                                <button className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">New Promotion</button>
                             </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PromotionManager;
