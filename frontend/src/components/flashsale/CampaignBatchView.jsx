import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Calendar, Zap, Edit2, Trash2, Plus, ChevronRight, Eye } from 'lucide-react';
import CampaignDetailView from './CampaignDetailView';

/**
 * 📦 CampaignBatchView Component
 * 
 * แสดงรายการ Campaigns ทั้งหมดในรูปแบบ Card Grid
 * - แสดงสถานะ (Active/Inactive, Upcoming/Live/Ended)
 * - ปุ่มแก้ไข / ลบ
 * - แสดงจำนวน Flash Sale ในแต่ละ Campaign
 */
const CampaignBatchView = ({ campaigns = [], onEdit, onDelete, onCreate, onViewFlashSales, onEditFlashSale }) => {
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const getStatusColor = (status) => {
        const colors = {
            'Active': 'green',
            'Upcoming': 'blue',
            'Ended': 'gray',
            'Inactive': 'red'
        };
        return colors[status] || 'gray';
    };

    const getStatusIcon = (status) => {
        if (status === 'Active') return '🔥';
        if (status === 'Upcoming') return '⏰';
        if (status === 'Ended') return '✅';
        return '⚪';
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <FolderKanban className="text-purple-600" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Campaign Campaigns</h2>
                        <p className="text-sm text-gray-500">
                            จัดกลุ่ม Flash Sales เป็นแคมเปญใหญ่
                        </p>
                    </div>
                </div>

                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    <span>สร้าง Campaign</span>
                </button>
            </div>

            {/* Campaign Grid */}
            {campaigns.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <FolderKanban className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-400 font-bold text-lg">ยังไม่มี Campaign</p>
                    <p className="text-gray-300 text-sm mt-2">คลิก "สร้าง Campaign" เพื่อเริ่มต้น</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns.map((campaign, index) => {
                        const statusColor = getStatusColor(campaign.status);
                        const statusIcon = getStatusIcon(campaign.status);

                        return (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 p-5 hover:shadow-2xl hover:border-purple-200 transition-all cursor-pointer"
                                onClick={() => onViewFlashSales(campaign)}
                            >
                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold bg-${statusColor}-100 text-${statusColor}-700 flex items-center gap-1`}>
                                    <span>{statusIcon}</span>
                                    <span>{campaign.status}</span>
                                </div>

                                {/* Campaign Name */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 pr-20 line-clamp-2">
                                        {campaign.name}
                                    </h3>
                                    {campaign.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {campaign.description}
                                        </p>
                                    )}
                                </div>

                                {/* Date Range */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span className="font-semibold">
                                        {new Date(campaign.campaign_start).toLocaleDateString('th-TH', { 
                                            day: 'numeric', 
                                            month: 'short' 
                                        })}
                                        {' - '}
                                        {new Date(campaign.campaign_end).toLocaleDateString('th-TH', { 
                                            day: 'numeric', 
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>

                                {/* Flash Sale Count */}
                                <div className="flex items-center gap-2 text-sm mb-4">
                                    <Zap size={16} className="text-orange-500" />
                                    <span className="font-bold text-gray-700">
                                        {campaign.flash_sale_count || 0} Flash Sales
                                    </span>
                                </div>

                                {/* Theme Color Preview */}
                                {campaign.theme_color && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <div 
                                            className="w-6 h-6 rounded-lg border-2 border-gray-200 shadow-sm"
                                            style={{ backgroundColor: campaign.theme_color }}
                                        />
                                        <span className="text-xs text-gray-400 font-mono">
                                            {campaign.theme_color}
                                        </span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCampaign(campaign);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-bold transition-all"
                                    >
                                        <Eye size={14} />
                                        <span>ดูรายละเอียด</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(campaign);
                                        }}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-all"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(campaign.id);
                                        }}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* View Details Arrow */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="text-purple-400" size={20} strokeWidth={3} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Campaign Detail Modal */}
            <AnimatePresence>
                {selectedCampaign && (
                    <CampaignDetailView 
                        campaign={selectedCampaign}
                        onClose={() => setSelectedCampaign(null)}
                        onEditFlashSale={onEditFlashSale}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CampaignBatchView;
