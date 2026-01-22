import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Edit2, Trash2, Plus } from 'lucide-react';

/**
 * 📅 TimelineView Component
 * 
 * แสดง Flash Sales บนแถบเวลา 24 ชั่วโมง
 * 
 * Features:
 * - แถบเวลา 00:00 - 23:00 พร้อม grid
 * - Flash Sale blocks วางตำแหน่งตาม timeline_position_percent
 * - สีตาม timeline_color จาก backend
 * - Hover แสดงรายละเอียด
 * - Click เพื่อแก้ไข
 */
const TimelineView = ({ flashSales = [], onEdit, onDelete, onCreate }) => {
    const [hoveredSale, setHoveredSale] = useState(null);

    // สร้าง hour markers (00:00 - 23:00)
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // กรอง Flash Sales ที่มี timeline data
    const timelineSales = flashSales.filter(fs => 
        fs.timeline_position_percent !== undefined && 
        fs.timeline_width_percent !== undefined
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-xl">
                        <Clock className="text-orange-600" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Timeline View</h2>
                        <p className="text-sm text-gray-500">แสดง Flash Sales บนแถบเวลา 24 ชั่วโมง</p>
                    </div>
                </div>

                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    <span>สร้าง Flash Sale</span>
                </button>
            </div>

            {/* Timeline Container */}
            <div className="relative">
                {/* Hour Grid */}
                <div className="flex border-b-2 border-gray-200 pb-2 mb-8">
                    {hours.map(hour => (
                        <div
                            key={hour}
                            className="flex-1 text-center border-r border-gray-100 last:border-r-0"
                        >
                            <span className="text-xs font-bold text-gray-400">
                                {String(hour).padStart(2, '0')}:00
                            </span>
                        </div>
                    ))}
                </div>

                {/* Timeline Bar */}
                <div className="relative h-32 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl border-2 border-gray-100 overflow-visible">
                    {/* Vertical grid lines */}
                    {hours.map(hour => (
                        <div
                            key={`grid-${hour}`}
                            className="absolute top-0 bottom-0 border-l border-gray-100"
                            style={{ left: `${(hour / 24) * 100}%` }}
                        />
                    ))}

                    {/* Flash Sale Blocks */}
                    <AnimatePresence>
                        {timelineSales.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <Zap className="mx-auto text-gray-300 mb-2" size={48} />
                                    <p className="text-gray-400 font-bold">ยังไม่มี Flash Sale</p>
                                    <p className="text-gray-300 text-sm">คลิก "สร้าง Flash Sale" เพื่อเริ่มต้น</p>
                                </div>
                            </motion.div>
                        ) : (
                            timelineSales.map((sale, index) => (
                                <motion.div
                                    key={sale.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="absolute top-4 bottom-4 group cursor-pointer"
                                    style={{
                                        left: `${sale.timeline_position_percent}%`,
                                        width: `${sale.timeline_width_percent}%`,
                                        backgroundColor: sale.timeline_color || '#f97316',
                                        minWidth: '60px' // ขั้นต่ำเพื่อให้คลิกได้
                                    }}
                                    onMouseEnter={() => setHoveredSale(sale.id)}
                                    onMouseLeave={() => setHoveredSale(null)}
                                >
                                    {/* Block Content */}
                                    <div className="h-full rounded-lg px-3 py-2 flex flex-col justify-center relative overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow">
                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                        
                                        {/* Content */}
                                        <div className="relative z-10">
                                            <p className="text-white font-bold text-sm truncate">
                                                {sale.name}
                                            </p>
                                            <p className="text-white/90 text-xs">
                                                {sale.duration_hours?.toFixed(1) || 0}h
                                            </p>
                                        </div>

                                        {/* Hover Actions */}
                                        {hoveredSale === sale.id && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="absolute top-2 right-2 flex gap-1"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(sale);
                                                    }}
                                                    className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all"
                                                >
                                                    <Edit2 size={14} className="text-gray-700" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(sale.id);
                                                    }}
                                                    className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-all"
                                                >
                                                    <Trash2 size={14} className="text-red-600" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Tooltip */}
                                    {hoveredSale === sale.id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl text-xs whitespace-nowrap z-50"
                                        >
                                            <div className="font-bold mb-1">{sale.name}</div>
                                            <div className="text-gray-300">
                                                {new Date(sale.start_time).toLocaleTimeString('th-TH', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })} 
                                                {' - '}
                                                {new Date(sale.end_time).toLocaleTimeString('th-TH', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                            <div className="text-gray-400 text-xs mt-1">
                                                Status: <span className="font-semibold text-green-400">{sale.status}</span>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-indigo-500" />
                        <span className="text-xs font-bold text-gray-600">Midnight (00:00-06:00)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500" />
                        <span className="text-xs font-bold text-gray-600">Lunch (11:00-15:00)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span className="text-xs font-bold text-gray-600">Evening (18:00-23:00)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500" />
                        <span className="text-xs font-bold text-gray-600">Other</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
