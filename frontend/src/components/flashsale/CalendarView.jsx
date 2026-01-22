import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
    addDays
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
    MapPin
} from 'lucide-react';

/**
 * 🗓️ CalendarView Component (UX Redesigned)
 * 
 * ✨ New Features:
 * - วันภาษาไทย
 * - Quick Action Buttons (🏆 Campaign / ⚡ Flash Sale)
 * - Smart Create Logic
 * - Better Visual Hierarchy
 * - Larger, Clearer UI
 * - Enhanced Tooltips
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

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Filter data for current month
    const currentMonthSales = useMemo(() => {
        return flashSales.filter(fs => {
            const fsDate = parseISO(fs.start_time);
            return isSameMonth(fsDate, monthStart);
        });
    }, [flashSales, monthStart]);

    const currentMonthCampaigns = useMemo(() => {
        return campaigns.filter(c => {
            const start = parseISO(c.campaign_start);
            const end = parseISO(c.campaign_end);
            return isWithinInterval(monthStart, { start, end }) ||
                   isWithinInterval(monthEnd, { start, end }) ||
                   (start <= monthStart && end >= monthEnd);
        });
    }, [campaigns, monthStart, monthEnd]);

    // Thai day names
    const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* 📅 Header with Navigation */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl">
                        <CalendarIcon className="text-orange-600" size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-800">
                            {format(currentMonth, 'MMMM yyyy', { locale: th })}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            {flashSales.length} Flash Sales • {campaigns.length} Campaigns
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <ChevronLeft size={24} className="text-gray-600" strokeWidth={2.5} />
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all"
                    >
                        วันนี้
                    </button>
                    <button 
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <ChevronRight size={24} className="text-gray-600" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* 📋 Days Header */}
            <div className="grid grid-cols-7 mb-4">
                {thaiDays.map((day, i) => (
                    <div 
                        key={day} 
                        className={`text-center font-black text-base py-4 ${
                            i === 0 || i === 6 ? 'text-orange-500' : 'text-gray-500'
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 🗓️ Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 auto-rows-fr">
                {calendarDays.map((day) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);
                    const isPast = day < new Date().setHours(0, 0, 0, 0);

                    // Find events for this day
                    const daySales = currentMonthSales.filter(fs => 
                        isSameDay(parseISO(fs.start_time), day)
                    );

                    // Find active campaigns
                    const activeCampaigns = currentMonthCampaigns.filter(c => 
                        isWithinInterval(day, { 
                            start: parseISO(c.campaign_start), 
                            end: parseISO(c.campaign_end) 
                        })
                    );

                    const hasCampaign = activeCampaigns.length > 0;

                    return (
                        <motion.div
                            key={day.toString()}
                            whileHover={!isPast && isCurrentMonth ? { scale: 1.02 } : {}}
                            className={`
                                min-h-[160px] rounded-2xl p-4 border-2 transition-all relative group
                                ${isPast ? 'opacity-25 cursor-not-allowed bg-gray-50 border-gray-100' : 
                                  isCurrentMonth ? 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-lg cursor-pointer' : 
                                  'bg-gray-50/30 border-gray-100 text-gray-300'}
                                ${isTodayDate ? 'ring-4 ring-orange-400 shadow-xl' : ''}
                            `}
                        >
                            {/* 📍 Date Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`
                                        text-xl font-black w-10 h-10 flex items-center justify-center rounded-xl
                                        ${isTodayDate ? 'bg-orange-500 text-white shadow-md' : 
                                          isPast ? 'text-gray-300' : 
                                          isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {isTodayDate && (
                                        <MapPin size={16} className="text-orange-500 fill-orange-500" />
                                    )}
                                    {isPast && (
                                        <Lock size={14} className="text-gray-300" />
                                    )}
                                    {/* 🏆 แสดง Badge ถ้ามี Campaign */}
                                    {hasCampaign && !isPast && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-bold">
                                            <Award size={10} fill="currentColor" />
                                            <span>Campaign</span>
                                        </div>
                                    )}
                                </div>

                                {/* ⚡ Quick Action Buttons */}
                                {!isPast && isCurrentMonth && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        {!hasCampaign ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCreateCampaign && onCreateCampaign(day);
                                                }}
                                                className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-all"
                                                title="สร้าง Campaign"
                                            >
                                                <Award size={14} strokeWidth={2.5} />
                                            </button>
                                        ) : (
                                            <>
                                                {/* ✅ มี Campaign แล้ว → แสดงปุ่ม Flash Sale */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onCreate && onCreate(day);
                                                    }}
                                                    className="p-1.5 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition-all"
                                                    title="สร้าง Flash Sale"
                                                >
                                                    <Zap size={14} strokeWidth={2.5} fill="currentColor" />
                                                </button>
                                                {/* ❌ ซ่อนปุ่ม Campaign เพราะมีแล้ว */}
                                                <button
                                                    disabled
                                                    className="p-1.5 bg-gray-100 text-gray-300 rounded-lg cursor-not-allowed opacity-50"
                                                    title="วันนี้มี Campaign แล้ว (1 วัน = 1 Campaign)"
                                                >
                                                    <Award size={14} strokeWidth={2.5} />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCreate && onCreate(day);
                                            }}
                                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
                                            title="เพิ่มเหตุการณ์"
                                        >
                                            <Plus size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 🏆 Campaign Blocks */}
                            <div className="space-y-2">
                                {activeCampaigns.map((camp) => {
                                    const campaignSales = daySales.filter(fs => 
                                        (typeof fs.campaign === 'object' ? fs.campaign?.id : fs.campaign) === camp.id
                                    );

                                    // Check continuity
                                    const prevDay = subDays(day, 1);
                                    const nextDay = addDays(day, 1);
                                    const isContinuesFromPrev = isWithinInterval(prevDay, {
                                        start: parseISO(camp.campaign_start),
                                        end: parseISO(camp.campaign_end)
                                    });
                                    const isContinuesToNext = isWithinInterval(nextDay, {
                                        start: parseISO(camp.campaign_start),
                                        end: parseISO(camp.campaign_end)
                                    });

                                    return (
                                        <div 
                                            key={`camp-${camp.id}`}
                                            className={`
                                                rounded-xl overflow-hidden shadow-sm
                                                ${isContinuesFromPrev ? 'rounded-l-none' : ''}
                                                ${isContinuesToNext ? 'rounded-r-none' : ''}
                                            `}
                                            style={{ 
                                                backgroundColor: camp.theme_color || '#f97316',
                                                marginLeft: isContinuesFromPrev ? '-8px' : '0',
                                                marginRight: isContinuesToNext ? '-8px' : '0',
                                                paddingLeft: isContinuesFromPrev ? '8px' : '0',
                                                paddingRight: isContinuesToNext ? '8px' : '0',
                                            }}
                                        >
                                            {/* Campaign Name */}
                                            {(!isContinuesFromPrev || day.getDay() === 0) && (
                                                <div className="px-2 py-1 flex items-center justify-between">
                                                    <span className="text-white font-bold text-xs flex items-center gap-1">
                                                        <Award size={12} fill="currentColor" />
                                                        {camp.name}
                                                    </span>
                                                    {campaignSales.length > 0 && (
                                                        <span className="bg-white/30 text-white text-[10px] font-bold px-1.5 rounded">
                                                            {campaignSales.length}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Flash Sales in Campaign */}
                                            <div 
                                                className="px-1 pb-1 space-y-1"
                                                style={{ backgroundColor: `${camp.theme_color}15` }}
                                            >
                                                {campaignSales.map((sale) => (
                                                    <div
                                                        key={sale.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(sale);
                                                        }}
                                                        className={`
                                                            px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs font-bold flex items-center gap-1.5
                                                            ${sale.status === 'Live' ? 
                                                              'bg-red-500 text-white shadow-md animate-pulse' : 
                                                              'bg-white text-gray-700 hover:bg-gray-50'}
                                                        `}
                                                    >
                                                        <Zap 
                                                            size={10} 
                                                            fill={sale.status === 'Live' ? 'currentColor' : 'none'}
                                                            className={sale.status === 'Live' ? 'text-white' : 'text-orange-500'}
                                                        />
                                                        <span className="text-[10px]">
                                                            {format(new Date(sale.start_time), 'HH:mm')}
                                                        </span>
                                                        <span className="flex-1 truncate">
                                                            {sale.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* ⚡ Orphan Flash Sales */}
                                {daySales.filter(fs => !fs.campaign).map((sale) => (
                                    <div
                                        key={sale.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(sale);
                                        }}
                                        className={`
                                            px-2 py-2 rounded-lg cursor-pointer transition-all text-xs font-bold flex items-center gap-2
                                            ${sale.status === 'Live' ? 
                                              'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' : 
                                              'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200'}
                                        `}
                                    >
                                        <Zap 
                                            size={12} 
                                            fill="currentColor"
                                            className={sale.status === 'Live' ? 'text-white' : 'text-orange-500'}
                                        />
                                        <span className="text-[10px] font-mono">
                                            {format(new Date(sale.start_time), 'HH:mm')}
                                        </span>
                                        <span className="flex-1 truncate">
                                            {sale.name}
                                        </span>
                                    </div>
                                ))}

                                {/* Empty State */}
                                {!isPast && isCurrentMonth && daySales.length === 0 && activeCampaigns.length === 0 && (
                                    <div className="text-center py-4 opacity-0 group-hover:opacity-100 transition-all">
                                        <p className="text-xs text-gray-400 font-medium">
                                            {hasCampaign ? 'คลิกเพื่อเพิ่ม Flash Sale' : 'คลิกเพื่อสร้าง Campaign'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
