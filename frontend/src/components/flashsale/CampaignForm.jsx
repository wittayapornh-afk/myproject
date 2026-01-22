import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Palette, Zap } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

/**
 * 📝 CampaignForm Component
 * 
 * ใช้สำหรับสร้างและแก้ไขข้อมูล Campaign
 * - มี DatePicker สำหรับเลือกวันเริ่มต้น-สิ้นสุด
 * - เลือกสีธีม (Theme Color)
 * - อัปโหลดรูปแบนเนอร์
 */
const CampaignForm = ({ campaign, onSave, onClose, isOpen, availableFlashSales = [] }) => {
    const [formData, setFormData] = useState({
        id: null, // ✅ เพิ่ม id สำหรับ Edit
        name: '',
        description: '',
        campaign_start: new Date(),
        campaign_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        theme_color: '#f97316',
        is_active: true,
        priority: 0,
        flash_sale_ids: [] // Store selected IDs
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Load existing campaign data
    useEffect(() => {
        if (campaign) {
            setFormData({
                id: campaign.id, // ✅ สำคัญมาก!
                name: campaign.name || '',
                description: campaign.description || '',
                campaign_start: campaign.campaign_start ? new Date(campaign.campaign_start) : new Date(),
                campaign_end: campaign.campaign_end ? new Date(campaign.campaign_end) : new Date(),
                theme_color: campaign.theme_color || '#f97316',
                is_active: campaign.is_active ?? true,
                priority: campaign.priority || 0,
                flash_sale_ids: campaign.flash_sales?.map(fs => fs.id) || []
            });
        } else {
            // ✅ Reset form เมื่อสร้างใหม่
            setFormData({
                id: null,
                name: '',
                description: '',
                campaign_start: new Date(),
                campaign_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                theme_color: '#f97316',
                is_active: true,
                priority: 0,
                flash_sale_ids: []
            });
        }
    }, [campaign]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.name = 'กรุณากรอกชื่อแคมเปญ';
        }

        if (formData.campaign_end <= formData.campaign_start) {
            newErrors.campaign_end = 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await onSave(formData, campaign?.id);
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
            setErrors({ submit: 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold">
                                    {campaign ? '✏️ แก้ไข Campaign' : '➕ สร้าง Campaign'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        ชื่อแคมเปญ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="เช่น Mega Sale 12.12"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                                            errors.name ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        คำอธิบาย
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        placeholder="รายละเอียดแคมเปญ (ไม่บังคับ)"
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all resize-none"
                                    />
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            วันที่เริ่มต้น <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <DatePicker
                                                selected={formData.campaign_start}
                                                onChange={(date) => handleChange('campaign_start', date)}
                                                showTimeSelect
                                                timeIntervals={1}
                                                dateFormat="dd/MM/yyyy HH:mm"
                                                popperPlacement="bottom-start"
                                                portalId="root"
                                                popperProps={{ strategy: 'fixed' }}
                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            วันที่สิ้นสุด <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <DatePicker
                                                selected={formData.campaign_end}
                                                onChange={(date) => handleChange('campaign_end', date)}
                                                showTimeSelect
                                                timeIntervals={1}
                                                dateFormat="dd/MM/yyyy HH:mm"
                                                minDate={formData.campaign_start}
                                                popperPlacement="bottom-start"
                                                portalId="root"
                                                popperProps={{ strategy: 'fixed' }}
                                                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all ${
                                                    errors.campaign_end ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                            />
                                        </div>
                                        {errors.campaign_end && (
                                            <p className="text-red-500 text-sm mt-1">{errors.campaign_end}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Theme Color */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        สีธีม
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="color"
                                                value={formData.theme_color}
                                                onChange={(e) => handleChange('theme_color', e.target.value)}
                                                className="w-24 h-12 pl-12 pr-2 border-2 border-gray-200 rounded-xl cursor-pointer"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.theme_color}
                                            onChange={(e) => handleChange('theme_color', e.target.value)}
                                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all font-mono text-sm"
                                            placeholder="#ff6600"
                                        />
                                    </div>
                                </div>

                                {/* Priority & Active */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            ลำดับความสำคัญ
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.priority}
                                            onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
                                            min={0}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">เลขมากแสดงก่อน</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            สถานะ
                                        </label>
                                        <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                            <span className="font-semibold text-gray-700">
                                                เปิดใช้งาน
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* ⚡ Select Flash Sales (New Feature) */}
                                <div className="mt-6">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">
                                        เลือก Flash Sales ที่จะเข้าร่วม
                                    </label>
                                    
                                    <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 max-h-[200px] overflow-y-auto">
                                        {availableFlashSales.length === 0 ? (
                                            <div className="text-center text-gray-400 py-4 text-sm">
                                                ไม่มี Flash Sale ที่สามารถเลือกได้
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {availableFlashSales.map(fs => {
                                                    const isSelected = formData.flash_sale_ids.includes(fs.id);
                                                    // Check if already in another campaign (and not this one)
                                                    const inOtherCampaign = fs.campaign && (typeof fs.campaign === 'object' ? fs.campaign.id : fs.campaign) !== campaign?.id;
                                                    
                                                    return (
                                                        <div 
                                                            key={fs.id}
                                                            onClick={() => {
                                                                if (inOtherCampaign) return;
                                                                const newIds = isSelected 
                                                                    ? formData.flash_sale_ids.filter(id => id !== fs.id)
                                                                    : [...formData.flash_sale_ids, fs.id];
                                                                setFormData(prev => ({ ...prev, flash_sale_ids: newIds }));
                                                            }}
                                                            className={`
                                                                flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer relative
                                                                ${inOtherCampaign ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100 border-gray-200' : 
                                                                  isSelected ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-gray-100 hover:border-purple-200'}
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-5 h-5 rounded-md border flex items-center justify-center transition-colors
                                                                ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 bg-white'}
                                                            `}>
                                                                {isSelected && <Zap size={12} fill="currentColor" />}
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-gray-700 text-sm truncate">{fs.name}</div>
                                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <span>{new Date(fs.start_time).toLocaleDateString()}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(fs.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                                </div>
                                                            </div>

                                                            {inOtherCampaign && (
                                                                <div className="absolute right-2 top-2 text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded font-bold">
                                                                    In Campaign
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 px-1">
                                        * Flash Sale ที่อยู่ใน Campaign อื่นแล้วจะไม่สามารถเลือกได้
                                    </p>
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                        <p className="text-red-700 font-semibold">{errors.submit}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                                        disabled={loading}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={20} />
                                        <span>{loading ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CampaignForm;
