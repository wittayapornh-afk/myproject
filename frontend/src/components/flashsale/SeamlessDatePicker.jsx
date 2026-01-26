import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { th } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';

registerLocale('th', th);

/**
 * 🎨 Dynamic Theme Styles for DatePicker
 */
const DatePickerStyles = ({ theme = 'orange' }) => {
    const colors = {
        orange: {
            primary: '#fb923c', // orange-400
            dark: '#ea580c',    // orange-600
            light: '#fed7aa',   // orange-200
            bg: '#fff7ed',      // orange-50
            gradientStart: '#fb923c',
            gradientEnd: '#ea580c'
        },
        purple: {
            primary: '#a855f7', // purple-500
            dark: '#7e22ce',    // purple-700
            light: '#e9d5ff',   // purple-200
            bg: '#faf5ff',      // purple-50
            gradientStart: '#a855f7',
            gradientEnd: '#7e22ce'
        }
    };

    const c = colors[theme] || colors.orange;

    return (
        <style>{`
            /* 📅 Main Calendar Container */
            .react-datepicker-popper { z-index: 9999 !important; }
            .react-datepicker {
                font-family: 'Inter', 'Sarabun', sans-serif;
                border: 2px solid ${c.primary} !important;
                border-radius: 16px;
                box-shadow: 0 20px 60px -10px ${c.primary}50; /* 50 = alpha 0.3 approx */
                font-size: 0.875rem;
                background: white;
                padding: 12px !important;
                overflow: visible !important;
            }
            
            /* 🎨 Header Section */
            .react-datepicker__header {
                background: linear-gradient(135deg, ${c.gradientStart} 0%, ${c.gradientEnd} 100%);
                border-bottom: none;
                padding: 14px 8px !important;
                border-radius: 12px 12px 0 0;
                margin: -12px -12px 8px -12px;
            }
            .react-datepicker__current-month {
                color: white;
                font-weight: 800;
                font-size: 1.1rem !important;
                margin-bottom: 8px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            /* 📆 Day Names */
            .react-datepicker__day-names {
                display: flex !important;
                justify-content: space-between !important;
                margin-top: 8px;
            }
            .react-datepicker__day-name {
                color: rgba(255, 255, 255, 0.95);
                font-weight: 700;
                width: 2.2rem !important;
                height: 2.2rem !important;
                line-height: 2.2rem !important;
                margin: 2px !important;
                font-size: 0.75rem !important;
                text-transform: uppercase;
                text-align: center !important;
            }
            
            /* 📅 Date Cells */
            .react-datepicker__day {
                color: #1f2937 !important;
                width: 2.2rem !important;
                height: 2.2rem !important;
                line-height: 2.2rem !important;
                margin: 2px !important;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.875rem !important;
                border: 1px solid #f3f4f6 !important;
                background: white !important;
            }
            .react-datepicker__day:hover {
                background: ${c.light} !important;
                color: ${c.dark} !important;
                transform: scale(1.05);
                z-index: 10;
                border-color: ${c.primary} !important;
                box-shadow: 0 2px 8px ${c.primary}50 !important;
            }
            
            /* ✨ Selected Date */
            .react-datepicker__day--selected,
            .react-datepicker__day--keyboard-selected {
                background: linear-gradient(135deg, ${c.gradientStart}, ${c.gradientEnd}) !important;
                color: white !important;
                font-weight: 700;
                box-shadow: 0 4px 12px ${c.dark}80 !important;
                border: 2px solid ${c.dark} !important;
                transform: scale(1.05);
            }
            
            /* 🌟 Today */
            .react-datepicker__day--today {
                color: ${c.dark} !important;
                font-weight: 700 !important;
                border: 2px solid ${c.primary} !important;
                background: ${c.bg} !important;
            }
            
            /* 🎭 Disabled/Outside */
            .react-datepicker__day--disabled {
                color: #d1d5db !important;
                background: #f9fafb !important;
                opacity: 0.4 !important;
            }
            .react-datepicker__day--outside-month {
                opacity: 0.3 !important;
            }
            
            /* 🔘 Navigation Arrows */
            .react-datepicker__navigation:hover {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 8px;
            }
            .react-datepicker__navigation-icon::before {
                border-color: white;
            }

            /* Tooltip Arrow */
            .react-datepicker-popper[data-placement^="bottom"]:before {
                content: '';
                position: absolute;
                top: -6px;
                right: 30px;
                width: 12px;
                height: 12px;
                background: linear-gradient(135deg, ${c.gradientStart} 0%, ${c.gradientEnd} 100%);
                transform: rotate(45deg);
                z-index: -1;
            }
            
            /* ⏰ Time Picker Items */
            .react-datepicker__time-list-item:hover {
                background: linear-gradient(135deg, ${c.light} 0%, ${c.bg} 100%) !important;
                color: ${c.dark} !important;
            }
            .react-datepicker__time-list-item--selected {
                background: linear-gradient(135deg, ${c.gradientStart} 0%, ${c.gradientEnd} 100%) !important;
                color: white !important;
            }
        `}</style>
    );
};

/**
 * 🗓️ SeamlessDatePicker Component (Shared)
 * Supports 'orange' (default) and 'purple' themes.
 * Uses Portal to render outside parent container (fixing overflow issues).
 */
const SeamlessDatePicker = ({ 
    label, 
    selectedDate, 
    onChange, 
    minDate, 
    icon: Icon, 
    theme = 'orange',
    timeIntervals = 1
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Theme Config
    const themeConfig = {
        orange: {
            label: 'text-orange-600',
            border: 'border-orange-200',
            borderActive: 'border-orange-500',
            ring: 'ring-orange-50/50',
            shadow: 'shadow-orange-100',
            shadowPanel: 'shadow-orange-200/40',
            text: 'text-orange-600',
            textHover: 'group-hover:text-orange-500',
            bgHover: 'hover:bg-orange-100',
            btnBg: 'bg-orange-100',
            btnText: 'text-orange-700',
            btnHover: 'hover:bg-orange-200',
            btnPrimary: 'bg-orange-500 hover:bg-orange-600',
            gradFrom: 'from-orange-50',
            gradTo: 'to-orange-100'
        },
        purple: {
            label: 'text-purple-600',
            border: 'border-purple-200',
            borderActive: 'border-purple-500',
            ring: 'ring-purple-50/50',
            shadow: 'shadow-purple-100',
            shadowPanel: 'shadow-purple-200/40',
            text: 'text-purple-600',
            textHover: 'group-hover:text-purple-500',
            bgHover: 'hover:bg-purple-100',
            btnBg: 'bg-purple-100',
            btnText: 'text-purple-700',
            btnHover: 'hover:bg-purple-200',
            btnPrimary: 'bg-purple-600 hover:bg-purple-700',
            gradFrom: 'from-purple-50',
            gradTo: 'to-purple-100'
        }
    };

    const t = themeConfig[theme] || themeConfig.orange;

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is inside input OR the portal content (which is not in containerRef)
            // We'll handle portal outside click separately via a backdrop or just document listener logic if cleaner
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                 // Also need to check if target is inside the portal. 
                 // Simple hack: give portal a specific ID/Class check?
                 // Safer: Use a backdrop in the portal.
                 const portalEl = document.getElementById('datepicker-portal-content');
                 if (portalEl && !portalEl.contains(event.target)) {
                     setIsOpen(false);
                 }
            }
        };
        if (isOpen) {
             // Calculate position
             if (containerRef.current) {
                 const rect = containerRef.current.getBoundingClientRect();
                 const scrollY = window.scrollY;
                 // Position: Force Right Side (as requested)
                 setPosition({
                     top: rect.top + scrollY, // Align top
                     left: rect.right + 16 // 16px gap to the right
                 });
             }
             document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Handle Scroll/Resize to close or re-position (Close is simpler)
    useEffect(() => {
        const handleScroll = () => { if(isOpen) setIsOpen(false); };
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);


    return (
        <div ref={containerRef} className="relative z-30 select-none">
             <DatePickerStyles theme={theme} />
             
             <label className={`text-xs font-bold uppercase tracking-widest mb-2 block pl-1 ${t.label}`}>
                 {label}
             </label>
             
             {/* Main Input Box */}
             <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all duration-300 relative z-20 group
                    ${isOpen 
                        ? `${t.borderActive} shadow-xl ${t.shadow} ring-4 ${t.ring}` 
                        : `${t.border} hover:border-gray-400 hover:shadow-md`}
                `}
             >
                <div className={`mr-3 transition-colors shrink-0 ${isOpen ? t.text : `text-gray-400 ${t.textHover}`}`}>
                    <Icon size={20} strokeWidth={2} />
                </div>
                
                <span className={`text-sm font-bold flex-1 truncate ${selectedDate ? 'text-gray-800' : 'text-gray-400'}`}>
                    {selectedDate 
                        ? (typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : "เลือกวัน-เวลา..."}
                </span>

                <ChevronRight 
                    className={`transition-transform duration-300 shrink-0 ${isOpen ? `rotate-90 ${t.text}` : `text-gray-400 ${t.textHover}`}`} 
                    size={16} 
                />
             </div>

             {/* Portal for Slide-out Panel - Rendered at Body Level */}
             {isOpen && createPortal(
                 <div 
                    id="datepicker-portal-content"
                    className={`
                        fixed z-[9999]
                        bg-white border ${t.borderActive} rounded-xl shadow-2xl ${t.shadowPanel}
                        overflow-hidden
                        animate-in zoom-in-95 duration-200
                        w-[340px]
                    `}
                    style={{
                        top: position.top,
                        left: position.left,
                        // Ensure it doesn't go off screen bottom
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                 >
                    <div className="p-3 w-full">
                        <div className={`mb-2 flex items-center gap-2 font-bold text-xs ${t.text}`}>
                             <Icon size={14} /> <span>เลือกวันและเวลา</span>
                        </div>
                        
                        <DatePicker 
                            selected={selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate) : null}
                            onChange={(date) => {
                                const newDate = new Date(date);
                                if (selectedDate) {
                                    const currentDate = typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate;
                                    newDate.setHours(currentDate.getHours());
                                    newDate.setMinutes(currentDate.getMinutes());
                                }
                                onChange(newDate);
                            }}
                            inline
                            minDate={minDate}
                            locale="th"
                            calendarStartDay={0}
                            filterDate={(date) => date >= (minDate || new Date())}
                            calendarClassName="!shadow-none !border-none !bg-transparent"
                            showMonthDropdown
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={5}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={timeIntervals}
                            timeCaption="เวลา"
                            dateFormat="d MMMM yyyy HH:mm"
                        />
                        
                        {/* Quick Filters */}
                        <div className={`mb-3 pb-3 border-b ${t.border}`}>
                            <div className={`text-[10px] font-bold mb-2 uppercase tracking-wide ${t.text}`}>ตัวกรองด่วน</div>
                            <div className="flex flex-wrap gap-1">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const now = new Date();
                                        now.setHours(new Date().getHours() + 1, 0, 0, 0);
                                        onChange(now);
                                    }}
                                    className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${t.btnBg} ${t.btnHover} ${t.btnText}`}
                                >
                                    🕒 วันนี้
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        tomorrow.setHours(9, 0, 0, 0);
                                        onChange(tomorrow);
                                    }}
                                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md font-semibold transition-colors"
                                >
                                    ⭐ พรุ่งนี้
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const nextWeek = new Date();
                                        nextWeek.setDate(nextWeek.getDate() + 7);
                                        nextWeek.setHours(9, 0, 0, 0);
                                        onChange(nextWeek);
                                    }}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-semibold transition-colors"
                                >
                                    📅 1 สัปดาห์
                                </button>
                            </div>
                        </div>
                        
                        {/* Time Selector */}
                        <div className={`mt-3 pt-3 border-t ${t.border}`}>
                            <div className={`text-[10px] font-bold mb-2 uppercase tracking-wide ${t.text}`}>เวลา</div>
                            
                            <div className="flex flex-wrap gap-1 mb-2">
                                {[9, 12, 15, 18, 21].map(hour => (
                                    <button
                                        key={hour}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newDate = selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : new Date(selectedDate)) : new Date();
                                            newDate.setHours(hour, 0, 0, 0);
                                            onChange(newDate);
                                        }}
                                        className={`px-2 py-1 text-xs bg-gradient-to-r ${t.gradFrom} ${t.gradTo} hover:brightness-95 ${t.btnText} rounded-md font-bold transition-all`}
                                    >
                                        {String(hour).padStart(2, '0')}:00
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex gap-4 items-center justify-center py-4 px-2">
                                {/* Hour Stepper */}
                                <div className="flex-1">
                                    <div className="text-[10px] text-gray-500 mb-1 text-center font-semibold">ชั่วโมง</div>
                                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const baseDate = selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : new Date(selectedDate)) : new Date();
                                                const newDate = new Date(baseDate);
                                                newDate.setHours(newDate.getHours() - 1);
                                                const now = new Date();
                                                onChange(newDate < now ? now : newDate);
                                            }}
                                            className={`w-10 h-10 flex items-center justify-center bg-white ${t.bgHover} ${t.text} rounded-md font-bold text-xl shadow-sm border border-gray-200 transition-all active:scale-95`}
                                        >
                                            −
                                        </button>
                                        <div className="flex-1 text-center">
                                            <div className="text-3xl font-bold text-gray-800 font-mono tracking-wider">
                                                {String(selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate).getHours() : new Date().getHours()).padStart(2, '0')}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const baseDate = selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : new Date(selectedDate)) : new Date();
                                                const newDate = new Date(baseDate);
                                                newDate.setHours(newDate.getHours() + 1);
                                                onChange(newDate);
                                            }}
                                            className={`w-10 h-10 flex items-center justify-center bg-white ${t.bgHover} ${t.text} rounded-md font-bold text-xl shadow-sm border border-gray-200 transition-all active:scale-95`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="text-3xl font-bold text-gray-300 pb-5 opacity-50">:</div>
                                
                                {/* Minute Stepper */}
                                <div className="flex-1">
                                    <div className="text-[10px] text-gray-500 mb-1 text-center font-semibold">นาที</div>
                                    <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const baseDate = selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : new Date(selectedDate)) : new Date();
                                                const newDate = new Date(baseDate);
                                                newDate.setMinutes(newDate.getMinutes() - 1);
                                                 const now = new Date();
                                                onChange(newDate < now ? now : newDate);
                                            }}
                                            className={`w-10 h-10 flex items-center justify-center bg-white ${t.bgHover} ${t.text} rounded-md font-bold text-xl shadow-sm border border-gray-200 transition-all active:scale-95`}
                                        >
                                            −
                                        </button>
                                        <div className="flex-1 text-center">
                                            <div className="text-3xl font-bold text-gray-800 font-mono tracking-wider">
                                                {String(selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate).getMinutes() : 0).padStart(2, '0')}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const baseDate = selectedDate ? (typeof selectedDate === 'string' ? new Date(selectedDate) : new Date(selectedDate)) : new Date();
                                                const newDate = new Date(baseDate);
                                                newDate.setMinutes(newDate.getMinutes() + 1);
                                                onChange(newDate);
                                            }}
                                            className={`w-10 h-10 flex items-center justify-center bg-white ${t.bgHover} ${t.text} rounded-md font-bold text-xl shadow-sm border border-gray-200 transition-all active:scale-95`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Done Button */}
                        <div className={`mt-3 pt-2 border-t ${t.border} text-center`}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className={`w-full ${t.btnPrimary} text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors`}
                            >
                                ✓ ตกลง
                            </button>
                        </div>
                    </div>
                 </div>,
                 document.body
             )}
        </div>
    );
};

export default SeamlessDatePicker;
