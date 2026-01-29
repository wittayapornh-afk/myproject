
import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 📅 Helper: สร้าง Array ของตัวเลข (เช่น 1-31, 2024-2030)
const generateRange = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

// 📅 Helper: ชื่อเดือนภาษาไทย
const MONTHS_TH = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

const SpinnerColumn = ({ options, value, onChange, label, type = "text" }) => {
    const containerRef = useRef(null);
    const itemHeight = 40; // ความสูงของแต่ละรายการ (px)

    // 🔄 Auto Scroll ไปยังค่าที่เลือกเมื่อเปิดขึ้นมา
    useEffect(() => {
        if (containerRef.current) {
            const index = options.findIndex(opt => opt.value === value);
            if (index !== -1) {
                containerRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [value, options]);

    // 🖱️ Handle Scroll: คำนวณค่าเมื่อหยุดเลื่อน (Snap)
    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (options[index] && options[index].value !== value) {
            // ใช้ debounce เล็กน้อยเพื่อไม่ให้ state เปลี่ยนรัวเกินไป (Optional)
            // แต่ในที่นี้เราจะให้ Parent จัดการ State ตอนท้าย หรือใช้ onScrollEnd
        }
    };

    // 🛑 Scroll Snap Logic (ใช้ onScrollEnd จำลอง)
    const handleScrollEnd = (e) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (options[index]) {
            onChange(options[index].value);
        }
    };

    let scrollTimeout;
    const onScroll = (e) => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => handleScrollEnd(e), 100);
    }

    return (
        <div className="flex-1 flex flex-col items-center relative h-40 overflow-hidden group">
            {/* 🏷️ Label หัวคอลัมน์ */}
            {label && <span className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</span>}
            
            {/* 🎡 Wheel Container */}
            <div 
                ref={containerRef}
                onScroll={onScroll}
                className="w-full h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory relative py-[60px]" // py เพื่อให้ตัวแรก/ตัวท้ายอยู่ตรงกลาง
            >
                {options.map((opt) => (
                    <div 
                        key={opt.value}
                        className={`h-[40px] flex items-center justify-center snap-center transition-all duration-200 cursor-pointer text-sm ${
                            value === opt.value 
                            ? 'font-black text-indigo-600 scale-110 opacity-100' // ✨ Selected Style
                            : 'font-medium text-gray-400 scale-95 opacity-40 hover:opacity-70' 
                        }`}
                        onClick={() => {
                            if (containerRef.current) {
                                containerRef.current.scrollTo({
                                    top: options.indexOf(opt) * itemHeight,
                                    behavior: 'smooth'
                                });
                            }
                            onChange(opt.value);
                        }}
                    >
                        {opt.label}
                    </div>
                ))}
            </div>

            {/* 👓 Selection Lens (Overlay เงาๆ ตรงกลาง) */}
            <div className="absolute top-1/2 left-0 w-full h-[40px] -translate-y-1/2 pointer-events-none border-y border-indigo-100 bg-indigo-50/10 backdrop-blur-[1px] rounded-lg"></div>
        </div>
    );
};

const SpinnerDatePicker = ({ isOpen, onClose, onConfirm, initialDate = new Date(), title = "เลือกวันที่" }) => {
    const [selectedDate, setSelectedDate] = useState(new Date(initialDate));

    // 🔄 Sync State เมื่อเปิด Modal ใหม่
    useEffect(() => {
        if (isOpen) {
            setSelectedDate(new Date(initialDate));
        }
    }, [isOpen, initialDate]);

    // 🛠️ Generate Options
    const years = generateRange(2024, 2030).map(y => ({ value: y, label: y + 543 })); // แสดง พ.ศ.
    const months = MONTHS_TH.map((m, i) => ({ value: i, label: m }));
    const hours = generateRange(0, 23).map(h => ({ value: h, label: h.toString().padStart(2, '0') }));
    const minutes = generateRange(0, 59).map(m => ({ value: m, label: m.toString().padStart(2, '0') }));

    // 📆 Dynamic Days (คำนวณวันในเดือนนั้นๆ)
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const days = generateRange(1, daysInMonth).map(d => ({ value: d, label: d }));

    // 🎮 Handlers
    const updateDate = (key, val) => {
        const newDate = new Date(selectedDate);
        if (key === 'year') newDate.setFullYear(val);
        if (key === 'month') newDate.setMonth(val);
        if (key === 'day') newDate.setDate(Math.min(val, new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate())); // Check day overflow
        if (key === 'hour') newDate.setHours(val);
        if (key === 'minute') newDate.setMinutes(val);
        setSelectedDate(newDate);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center">
                    {/* 🌑 Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* 📱 Modal Content */}
                    <motion.div 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white w-full sm:w-[400px] sm:min-h-[400px] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col"
                    >
                        {/* 🏷️ Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                            <h3 className="text-lg font-black text-gray-800">{title}</h3>
                            <button 
                                onClick={() => { onConfirm(selectedDate); onClose(); }} 
                                className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                            >
                                <Check size={20} />
                            </button>
                        </div>

                        {/* 🎡 Spinner Columns Area */}
                        <div className="flex-1 flex gap-1 p-4 items-center justify-center bg-white h-64">
                            {/* Day */}
                            <SpinnerColumn 
                                label="วัน" 
                                options={days} 
                                value={selectedDate.getDate()} 
                                onChange={(val) => updateDate('day', val)} 
                            />
                            {/* Month */}
                            <div className="flex-[1.5]"> {/* ให้เดือนกว้างหน่อย */}
                                <SpinnerColumn 
                                    label="เดือน" 
                                    options={months} 
                                    value={selectedDate.getMonth()} 
                                    onChange={(val) => updateDate('month', val)} 
                                />
                            </div>
                            {/* Year */}
                            <SpinnerColumn 
                                label="ปี" 
                                options={years} 
                                value={selectedDate.getFullYear()} 
                                onChange={(val) => updateDate('year', val)} 
                            />
                            
                            {/* Divider | */}
                            <div className="w-px h-20 bg-gray-100 mx-1"></div>

                            {/* Hour */}
                            <SpinnerColumn 
                                label="ชม." 
                                options={hours} 
                                value={selectedDate.getHours()} 
                                onChange={(val) => updateDate('hour', val)} 
                            />
                            {/* Minute */}
                            <SpinnerColumn 
                                label="นาที" 
                                options={minutes} 
                                value={selectedDate.getMinutes()} 
                                onChange={(val) => updateDate('minute', val)} 
                            />
                        </div>

                        {/* 📅 Selected Date Preview Footer */}
                        <div className="p-4 bg-indigo-50 border-t border-indigo-100 text-center">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">SELECTED</p>
                            <p className="text-indigo-900 font-bold text-lg">
                                {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                <span className="mx-2 text-indigo-300">|</span>
                                {selectedDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SpinnerDatePicker;
