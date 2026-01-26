import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths, 
    isWithinInterval,
    parseISO,
    isToday,
    subDays,
    addDays,
    startOfDay
} from 'date-fns';
import { th } from 'date-fns/locale';
import { 
    ChevronLeft, 
    ChevronRight, 
    Zap, 
    Calendar as CalendarIcon, 
    Plus,
    Award,
    Lock,
    MapPin,
    MoreHorizontal,
    X,
    Clock,
    Search,
    ChevronDown,
    Package,
    Tag,
    ImageIcon
} from 'lucide-react';

/**
 * 🗓️ CalendarView Component (Visual Product Gallery Layout)
 */
const CalendarView = ({ 
    flashSales = [], 
    campaigns = [], 
    onEdit, 
    onDelete, 
    onCreate,
    onCreateCampaign 
}) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null); 
    const [expandedSaleId, setExpandedSaleId] = useState(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Filter data for current month
    const currentMonthSales = useMemo(() => {
        return flashSales.filter(fs => {
            if (!fs || !fs.start_time) return false;
            try {
                const fsDate = parseISO(fs.start_time);
                return isSameMonth(fsDate, monthStart);
            } catch (e) { return false; }
        });
    }, [flashSales, monthStart]);

    const currentMonthCampaigns = useMemo(() => {
        return campaigns.filter(c => {
            if (!c || !c.campaign_start || !c.campaign_end) return false;
            try {
                const start = parseISO(c.campaign_start);
                const end = parseISO(c.campaign_end);
                return start <= monthEnd && end >= monthStart;
            } catch (e) { return false; }
        });
    }, [campaigns, monthStart, monthEnd]);

    // Thai day names
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    // Helper data
    const getDayData = (day) => {
        const sales = flashSales.filter(fs => {
            if (!fs.start_time) return false;
            try { 
                const start = startOfDay(parseISO(fs.start_time));
                const end = fs.end_time ? startOfDay(parseISO(fs.end_time)) : start;
                const current = startOfDay(day);
                return current >= start && current <= end;
            } catch (e) { return false; }
        });
        const activeCampaigns = campaigns.filter(c => {
            if (!c.campaign_start || !c.campaign_end) return false;
            try {
                const cStart = startOfDay(parseISO(c.campaign_start));
                const cEnd = startOfDay(parseISO(c.campaign_end));
                const current = startOfDay(day);
                return current >= cStart && current <= cEnd;
            } catch (e) { return false; }
        });
        return { sales, activeCampaigns };
    };

    return (
        <div className="bg-white rounded-[1rem] shadow-xl shadow-gray-100 p-6 border border-gray-100 relative overflow-hidden">
            
            {/* 📅 Header with Navigation */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                        <CalendarIcon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {format(currentMonth, 'MMMM yyyy', { locale: th })}
                        </h2>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                             <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span>Live Sales</span>
                             </div>
                             <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                <span>Campaigns</span>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                    <button 
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-white hover:text-orange-600 rounded-md transition-all active:scale-95"
                    >
                        <ChevronLeft size={20} strokeWidth={2} />
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-1.5 bg-white shadow-sm border border-gray-200 text-gray-700 font-bold rounded-md text-sm hover:text-orange-600 transition-all"
                    >
                        วันนี้
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-white hover:text-orange-600 rounded-md transition-all active:scale-95"
                    >
                        <ChevronRight size={20} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* 🗓️ Calendar Grid Container */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-200"> 
                {/* 📋 Days Header */}
                <div className="grid grid-cols-7 bg-white">
                    {thaiDays.map((day, i) => (
                        <div 
                            key={day} 
                            className={`text-center font-bold text-xs uppercase tracking-wider py-3 border-b border-gray-200 ${
                                i === 0 || i === 6 ? 'text-orange-600 bg-orange-50/50' : 'text-gray-500'
                            }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* 🗓️ Days Grid */}
                <div className="grid grid-cols-7 gap-px bg-gray-200"> 
                    {calendarDays.map((day) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);
                        const isPast = day < new Date().setHours(0, 0, 0, 0) && !isTodayDate;

                        const { sales: daySales, activeCampaigns } = getDayData(day);
                        const hasCampaign = activeCampaigns.length > 0;
                        const mainCampaign = hasCampaign ? activeCampaigns[0] : null;

                        const prevDay = subDays(day, 1);
                        const isConnectsPrev = hasCampaign && isWithinInterval(prevDay, {
                            start: parseISO(mainCampaign.campaign_start),
                            end: parseISO(mainCampaign.campaign_end)
                        }) && day.getDay() !== 0;

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => isCurrentMonth && setSelectedDate(day)}
                                className={`
                                    min-h-[100px] p-1 relative group flex flex-col gap-1 transition-all
                                    bg-white
                                    ${isPast ? 'bg-gray-50/80' : 
                                      isCurrentMonth ? 'cursor-pointer hover:bg-gray-50' : 
                                      'bg-gray-50/30 opacity-60 pointer-events-none'}
                                    
                                    ${hasCampaign && isCurrentMonth ? 'hover:brightness-95' : ''}
                                `}
                                style={{
                                    backgroundColor: hasCampaign && isCurrentMonth ? (mainCampaign.theme_color || '#f97316') : undefined,
                                    color: hasCampaign && isCurrentMonth ? 'white' : undefined,
                                }}
                            >
                                {/* 📍 Date Number */}
                                <div className="flex justify-between items-start">
                                    <span className={`
                                        text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                        ${isTodayDate ? 'bg-orange-500 text-white shadow-md' : 
                                            hasCampaign ? 'text-white/90' :
                                            (isCurrentMonth ? 'text-gray-700' : 'text-gray-300')}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    
                                    {!isPast && isCurrentMonth && (daySales.length > 0 || hasCampaign) && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Search size={14} className={hasCampaign ? 'text-white' : 'text-gray-400'} />
                                        </div>
                                    )}
                                </div>

                                {/* 🏆 Campaign Info (Hero Title) */}
                                {hasCampaign && (
                                    <div className="mt-1 flex-1 flex flex-col justify-start pt-1 relative z-10">
                                        {!isConnectsPrev ? (
                                            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                                <div className="flex items-center gap-1 mb-0.5 text-white/90">
                                                    <Award size={10} fill="currentColor" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">เริ่มแคมเปญ</span>
                                                </div>
                                                <div className="font-black text-lg leading-tight tracking-tight drop-shadow-sm">
                                                    {mainCampaign.name}
                                                </div>
                                                <div className="h-1 w-8 bg-white/40 mt-1 rounded-full"></div>
                                            </div>
                                        ) : (
                                            // ❌ On continuing days: SHOW NOTHING (Just the colored block) as requested
                                            <div className="h-full w-full"></div>
                                        )}
                                    </div>
                                )}

                                {/* ⚡ Flash Sales (Visual Gallery) */}
                                <div className={`flex flex-col gap-1.5 mt-auto ${hasCampaign ? 'opacity-90' : ''}`}>
                                    {daySales.slice(0, 3).map((sale) => {
                                        const startTime = new Date(sale.start_time);
                                        const endTime = new Date(sale.end_time);
                                        const isLive = new Date() >= startTime && new Date() <= endTime;
                                        
                                        return (
                                        <div
                                            key={sale.id}
                                            onClick={(e) => { e.stopPropagation(); onEdit(sale); }}
                                            className={`
                                                relative pl-2.5 pr-2 py-1.5 rounded-lg border cursor-pointer hover:scale-[1.02] transition-transform
                                                shadow-sm hover:shadow-md group/sale
                                                ${hasCampaign 
                                                    ? 'bg-white/10 border-white/20 backdrop-blur-sm text-white' 
                                                    : 'bg-white border-orange-100/50 hover:border-orange-200'}
                                            `}
                                        >
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${isLive ? 'bg-gradient-to-b from-red-500 to-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                            
                                            {/* Header */}
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <span className={`text-[10px] font-black truncate ${hasCampaign ? 'text-white' : 'text-gray-800'}`}>
                                                    {sale.name}
                                                </span>
                                                {isLive && <Zap size={8} className="text-orange-500" fill="currentColor" />}
                                            </div>

                                            {/* Time & Count */}
                                            <div className={`flex items-center gap-2 text-[9px] font-medium ${hasCampaign ? 'text-white/70' : 'text-gray-400'}`}>
                                                <div className="flex items-center gap-0.5">
                                                    <Clock size={8} />
                                                    <span>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}</span>
                                                </div>
                                                <div className="w-px h-2 bg-current opacity-30"></div>
                                                <span>{sale.products?.length || 0} items</span>
                                            </div>
                                        </div>
                                    )})}
                                    
                                    {daySales.length > 3 && (
                                        <div className={`text-[9px] text-center font-bold ${hasCampaign ? 'text-white/80' : 'text-orange-400'}`}>
                                            +{daySales.length - 3} More
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 🟢 Detail Modal (Unchanged in Logic, Visuals OK) */}
            <AnimatePresence>
                {selectedDate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedDate(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        รายละเอียดวันที่ {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        รายละเอียดแคมเปญและกิจกรรม
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedDate(null)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                            
                            <div className="p-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                                {/* 🏆 Active Campaign Section */}
                                {getDayData(selectedDate).activeCampaigns.map(camp => (
                                    <div 
                                        key={camp.id} 
                                        className="mb-6 rounded-xl p-4 text-white shadow-lg relative overflow-hidden"
                                        style={{ backgroundColor: camp.theme_color || '#f97316' }}
                                    >
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-1 opacity-90">
                                                <Award size={16} />
                                                <span className="text-xs font-bold uppercase tracking-wider">แคมเปญที่ใช้งานอยู่</span>
                                            </div>
                                            <h4 className="text-xl font-black mb-2">{camp.name}</h4>
                                            <p className="text-sm opacity-90 font-medium">
                                                {format(parseISO(camp.campaign_start), 'd MMM')} - {format(parseISO(camp.campaign_end), 'd MMM yyyy', { locale: th })}
                                            </p>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                    </div>
                                ))}

                                {/* ⚡ Flash Sales List with Expansion */}
                                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Zap size={18} className="text-orange-500" fill="currentColor" />
                                    ไทม์ไลน์ Flash Sale ({getDayData(selectedDate).sales.length})
                                </h4>

                                <div className="space-y-3">
                                    {getDayData(selectedDate).sales.length > 0 ? (
                                        getDayData(selectedDate).sales.map((sale) => {
                                            const isExpanded = expandedSaleId === sale.id;
                                            return (
                                                <div 
                                                    key={sale.id}
                                                    className={`
                                                        rounded-xl border transition-all overflow-hidden
                                                        ${isExpanded ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100 bg-white hover:border-orange-100'}
                                                    `}
                                                >
                                                    {/* Header (Click to Expand) */}
                                                    <div 
                                                        onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                                                        className="flex items-center gap-4 p-3 cursor-pointer group"
                                                    >
                                                        <div className="flex flex-col items-center min-w-[3rem]">
                                                            <span className="text-sm font-bold text-gray-800">
                                                                {format(parseISO(sale.start_time), 'HH:mm')}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">เริ่ม</span>
                                                        </div>
                                                        <div className={`h-8 w-px ${isExpanded ? 'bg-orange-200' : 'bg-gray-200'}`}></div>
                                                        <div className="flex-1">
                                                            <h5 className={`font-bold text-sm transition-colors ${isExpanded ? 'text-orange-700' : 'text-gray-800 group-hover:text-orange-700'}`}>
                                                                {sale.name}
                                                            </h5>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {sale.category && (
                                                                     <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                                        {sale.category}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                    <Package size={10} />
                                                                    {sale.products?.length || 0} รายการ
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ChevronDown 
                                                            size={16} 
                                                            className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-orange-500' : ''}`}
                                                        />
                                                    </div>

                                                    {/* Expanded Content (Product Grid) */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden border-t border-orange-100/50"
                                                            >
                                                                <div className="p-3 bg-white/50 space-y-2">
                                                                    <h6 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                                                                        <Tag size={12} /> สินค้าในรายการ ({sale.products?.length || 0})
                                                                    </h6>
                                                                    
                                                                    {sale.products && sale.products.map((product, idx) => (
                                                                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                                                            <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                                                                {(product.product_image || product.image) ? (
                                                                                    <img 
                                                                                        src={getImageUrl(product.product_image || product.image)} 
                                                                                        alt="" 
                                                                                        className="w-full h-full object-cover" 
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                                        <Package size={16} />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2">
                                                                                     <p className="text-xs font-bold text-gray-800 truncate flex-1">
                                                                                        {product.product_name || product.name || `Product #${idx + 1}`}
                                                                                    </p>
                                                                                    {product.category && (
                                                                                        <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-0.5 whitespace-nowrap">
                                                                                            <Tag size={8} /> {product.category?.name || product.category}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                               
                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                    <span className="text-xs font-bold text-red-500">
                                                                                        ฿{product.sale_price?.toLocaleString() || product.discount_price?.toLocaleString() || '0'}
                                                                                    </span>
                                                                                    {(product.original_price || product.price) && (
                                                                                        <span className="text-[10px] text-gray-400 line-through">
                                                                                            ฿{(product.original_price || product.price).toLocaleString()}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    {(!sale.products || sale.products.length === 0) && (
                                                                        <div className="text-center py-4 text-xs text-gray-400 italic">
                                                                            ไม่มีสินค้าในรายการนี้
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                                            <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">ไม่มี Flash Sale ในวันนี้</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper to resolve image URL
const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `http://localhost:8000${img}`;
};

export default CalendarView;
