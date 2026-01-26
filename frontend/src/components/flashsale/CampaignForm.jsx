import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Save, Calendar, Palette, Zap, Clock, ChevronDown, 
    Edit2, Plus, Layout, Package, Check, Trash2
} from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { th } from 'date-fns/locale';

registerLocale('th', th);

// ✅ Custom Date Input with Quick Select (Premium Design)
const CustomDateInput = React.forwardRef(({ value, onClick, label, icon: Icon, onQuickSelect }, ref) => (
    <div className="flex flex-col gap-2 w-full group">
        {label && (
            <div className="flex justify-between items-center mb-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 ml-1">
                    {Icon && <Icon size={12} />} {label}
                </label>
                {/* ⚡ Quick Date Buttons (Purple) */}
                <div className="flex gap-1">
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onQuickSelect(new Date()); }}
                        className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-400 hover:bg-purple-500 hover:text-white transition-all border border-purple-100 uppercase"
                    >
                        วันนี้
                    </button>
                    <button 
                        type="button"
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            onQuickSelect(tomorrow);
                        }}
                        className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-100 uppercase"
                    >
                        พรุ่งนี้
                    </button>
                </div>
            </div>
        )}
        <button
            type="button"
            className="w-full bg-white border border-gray-200 text-gray-800 font-bold text-lg rounded-xl px-4 py-3 hover:border-purple-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all flex items-center justify-between gap-3 shadow-sm active:scale-[0.98] group-hover:bg-purple-50/30 overflow-hidden relative"
            onClick={onClick}
            ref={ref}
        >
            <div className="flex items-center gap-3">
                <Calendar size={20} className="text-purple-500" />
                <span>{value || "เลือกวันที่"}</span>
            </div>
            <ChevronDown size={16} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
        </button>
    </div>
));

// ✅ Wheel-style Time Picker with Quick Slots (Purple)
const ThaiTimePicker = ({ label, value, onChange, icon: Icon }) => {
    let hh = '00';
    let mm = '00';
    if (value instanceof Date) {
        hh = value.getHours().toString().padStart(2, '0');
        mm = value.getMinutes().toString().padStart(2, '0');
    }

    const adjustTime = (type, direction) => {
        let currentH = parseInt(hh);
        let currentM = parseInt(mm);
        if (type === 'hh') {
            currentH = (currentH + direction + 24) % 24;
        } else {
            currentM = (currentM + direction + 60) % 60;
        }
        onChange(`${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`);
    };

    const quickSlots = [
        { label: '00:00', val: '00:00' },
        { label: '12:00', val: '12:00' },
        { label: '23:59', val: '23:59' }
    ];

    return (
        <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    {Icon && <Icon size={12} />} {label}
                </label>
                <div className="flex gap-1">
                    {quickSlots.map(slot => (
                        <button 
                            key={slot.val}
                            type="button"
                            onClick={() => onChange(slot.val)}
                            className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-white text-gray-400 border border-gray-100 hover:border-purple-200 hover:text-purple-500 transition-all"
                        >
                            {slot.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-around gap-2 bg-white rounded-lg p-2 border border-gray-100 shadow-inner">
                {/* 🕒 Hour Picker */}
                <div className="flex flex-col items-center">
                    <button type="button" onClick={() => adjustTime('hh', 1)} className="p-1 text-gray-300 hover:text-purple-500 transition-colors"><ChevronUp size={14}/></button>
                    <div className="text-xl font-black text-gray-800 font-mono leading-none">{hh}</div>
                    <button type="button" onClick={() => adjustTime('hh', -1)} className="p-1 text-gray-300 hover:text-purple-500 transition-colors"><ChevronDown size={14}/></button>
                </div>
                
                <span className="text-gray-300 font-black animate-pulse">:</span>

                {/* 🕒 Minute Picker */}
                <div className="flex flex-col items-center">
                    <button type="button" onClick={() => adjustTime('mm', 1)} className="p-1 text-gray-300 hover:text-purple-500 transition-colors"><ChevronUp size={14}/></button>
                    <div className="text-xl font-black text-gray-800 font-mono leading-none">{mm}</div>
                    <button type="button" onClick={() => adjustTime('mm', -1)} className="p-1 text-gray-300 hover:text-purple-500 transition-colors"><ChevronDown size={14}/></button>
                </div>
                <span className="text-xs font-bold text-gray-400">น.</span>
            </div>
        </div>
    );
};

// ✅ Premium iOS Style Switch (เหมือนหน้า Flash Sale)
const IOSSwitch = ({ label, subLabel, checked, onChange, icon: Icon, color = "orange" }) => {
    const colorClasses = {
        orange: "peer-checked:bg-orange-500 peer-focus:ring-orange-200",
        green: "peer-checked:bg-green-500 peer-focus:ring-green-200",
        red: "peer-checked:bg-red-500 peer-focus:ring-red-200",
        purple: "peer-checked:bg-purple-500 peer-focus:ring-purple-200",
        indigo: "peer-checked:bg-indigo-500 peer-focus:ring-indigo-200",
    };

    return (
        <label className="flex items-center justify-between p-4 bg-white rounded-[24px] border border-gray-100 hover:border-orange-100 transition-all cursor-pointer group shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-500 transition-colors group-hover:scale-110 duration-300`}>
                    {Icon && <Icon size={20} />}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-800 tracking-tight leading-none mb-1">{label}</span>
                    {subLabel && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{subLabel}</span>}
                </div>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={checked} 
                    onChange={e => onChange(e.target.checked)} 
                />
                <div className={`w-12 h-6 bg-gray-200 rounded-full peer ${colorClasses[color] || colorClasses.orange} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-md shadow-inner`}></div>
            </div>
        </label>
    );
};

const CampaignForm = ({ campaign, onSave, onClose, isOpen, availableFlashSales = [] }) => {
    const [formData, setFormData] = useState({
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

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (campaign) {
            setFormData({
                id: campaign.id,
                name: campaign.name || '',
                description: campaign.description || '',
                campaign_start: campaign.campaign_start ? new Date(campaign.campaign_start) : new Date(),
                campaign_end: campaign.campaign_end ? new Date(campaign.campaign_end) : new Date(),
                theme_color: campaign.theme_color || '#f97316',
                is_active: campaign.is_active ?? true,
                priority: campaign.priority || 0,
                flash_sale_ids: campaign.flash_sales?.map(fs => fs.id) || []
            });
        }
    }, [campaign]);

    const handleTimeChange = (type, timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const field = type === 'start' ? 'campaign_start' : 'campaign_end';
        const newDate = new Date(formData[field]);
        newDate.setHours(hours, minutes);
        setFormData(prev => ({ ...prev, [field]: newDate }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'กรุณากรอกชื่อแคมเปญ';
        if (formData.campaign_end <= formData.campaign_start) newErrors.campaign_end = 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น';
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
            setErrors({ submit: 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden relative z-[1001] border border-purple-100 flex flex-col max-h-[90vh]"
                    >
                        {/* 🎨 Header (Premium Purple Theme) */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Layout size={140} />
                            </div>
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
                                        <Layout size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight leading-none mb-1">
                                            {campaign ? 'จัดการ Campaign' : 'สร้าง Campaign ใหม่'}
                                        </h2>
                                        <p className="text-purple-100 text-sm font-medium opacity-90">จัดการคอลเลกชันและตารางเวลา</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/10">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 p-6">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                                
                                {/* ⬅️ LEFT COLUMN: Core Config */}
                                <div className="lg:col-span-8 space-y-6">
                                    {/* 1. Basic Info */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-50 space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                                <Edit2 size={20} />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 ml-1">ชื่อแคมเปญ</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all font-bold text-gray-800 outline-none placeholder:font-medium text-lg"
                                                        placeholder="เช่น Big Brand Sale 10.10"
                                                        value={formData.name}
                                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 ml-1">รายละเอียด</label>
                                                    <textarea 
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all font-medium text-gray-600 outline-none resize-none h-20"
                                                        placeholder="คำอธิบายสั้นๆ..."
                                                        value={formData.description}
                                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Schedule Grid (Popup Mode) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Start Block */}
                                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-purple-100 relative group transition-all hover:shadow-md">
                                            <div className="grid grid-cols-2 gap-4 items-end">
                                                <DatePicker 
                                                    selected={formData.campaign_start}
                                                    onChange={date => setFormData({...formData, campaign_start: date})}
                                                    locale="th"
                                                    minDate={new Date()}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    customInput={
                                                        <CustomDateInput 
                                                            label="วันเริ่มต้น" 
                                                            icon={Calendar} 
                                                            onQuickSelect={(date) => setFormData({...formData, campaign_start: date})}
                                                        />
                                                    }
                                                    dateFormat="d MMM yyyy"
                                                    popperPlacement="bottom-start"
                                                />
                                                <ThaiTimePicker 
                                                    label="เวลาเริ่ม" 
                                                    value={formData.campaign_start} 
                                                    onChange={val => handleTimeChange('start', val)}
                                                    icon={Clock}
                                                />
                                            </div>
                                        </div>

                                        {/* End Block */}
                                        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-red-100 relative group transition-all hover:shadow-md">
                                            <div className="grid grid-cols-2 gap-4 items-end">
                                                <DatePicker 
                                                    selected={formData.campaign_end}
                                                    onChange={date => setFormData({...formData, campaign_end: date})}
                                                    locale="th"
                                                    minDate={formData.campaign_start}
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    customInput={
                                                        <CustomDateInput 
                                                            label="วันสิ้นสุด" 
                                                            icon={Calendar} 
                                                            onQuickSelect={(date) => setFormData({...formData, campaign_end: date})}
                                                        />
                                                    }
                                                    dateFormat="d MMM yyyy"
                                                    popperPlacement="bottom-start"
                                                />
                                                <ThaiTimePicker 
                                                    label="เวลาสิ้นสุด" 
                                                    value={formData.campaign_end} 
                                                    onChange={val => handleTimeChange('end', val)}
                                                    icon={Clock}
                                                />
                                            </div>

                                            {/* ⏳ DURATION FEEDBACK (Contextual Feedback) */}
                                            {formData.campaign_start && formData.campaign_end && (
                                                <div className="mt-4 flex items-center justify-center">
                                                    <div className="px-4 py-1.5 bg-gray-900 rounded-full flex items-center gap-2 shadow-lg shadow-gray-200 border border-white/10 group overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <Clock size={12} className="text-purple-400" />
                                                        <span className="text-[10px] font-black text-white tracking-widest uppercase">
                                                            {(() => {
                                                                const diff = formData.campaign_end - formData.campaign_start;
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

                                    {/* 3. Flash Sale Selection */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-lg font-black text-gray-800">
                                                <Zap className="text-purple-500" size={20} />
                                                เลือกรายการ Flash Sale
                                                <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-lg text-xs font-bold">{formData.flash_sale_ids.length}</span>
                                            </h3>
                                        </div>
                                        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 max-h-[300px] overflow-y-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {availableFlashSales.map(fs => {
                                                    const isSelected = formData.flash_sale_ids.includes(fs.id);
                                                    return (
                                                        <div 
                                                            key={fs.id}
                                                            onClick={() => {
                                                                const newIds = isSelected 
                                                                    ? formData.flash_sale_ids.filter(id => id !== fs.id)
                                                                    : [...formData.flash_sale_ids, fs.id];
                                                                setFormData({...formData, flash_sale_ids: newIds});
                                                            }}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100 hover:border-purple-200'}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300'}`}>
                                                                {isSelected && <Check size={12} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-gray-700 text-sm truncate">{fs.name}</div>
                                                                <div className="text-[10px] text-gray-400 font-mono">
                                                                    {new Date(fs.start_time).toLocaleDateString()} {new Date(fs.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ➡️ RIGHT COLUMN: Sidebar Settings */}
                                <div className="lg:col-span-4 space-y-4 relative">
                                    <div className="sticky top-0 space-y-4">
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg uppercase tracking-wider shadow-xl shadow-gray-200 hover:bg-purple-600 hover:shadow-purple-200 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                        >
                                            <Save size={20} />
                                            {loading ? 'กำลังบันทึก...' : 'บันทึกแคมเปญ'}
                                        </button>

                                        {/* Theme & Priority */}
                                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <Palette size={12} /> สีธีม (Theme Color)
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="color" 
                                                        value={formData.theme_color}
                                                        onChange={e => setFormData({...formData, theme_color: e.target.value})}
                                                        className="w-12 h-12 rounded-xl cursor-pointer border-none p-1 bg-gray-50"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={formData.theme_color}
                                                        onChange={e => setFormData({...formData, theme_color: e.target.value})}
                                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-mono font-bold text-gray-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">ลำดับความสำคัญ (Priority)</label>
                                                <input 
                                                    type="number" 
                                                    value={formData.priority}
                                                    onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-black text-gray-800 focus:bg-white outline-none"
                                                />
                                            </div>

                                            <div className="pt-2">
                                                <IOSSwitch 
                                                    label="เปิดใช้งานทันที" 
                                                    subLabel="แสดงผลทันที" 
                                                    checked={formData.is_active} 
                                                    onChange={v => setFormData({...formData, is_active: v})} 
                                                    icon={Zap}
                                                    color="purple"
                                                />
                                            </div>
                                        </div>

                                        {/* Errors */}
                                        {errors.submit && (
                                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100">
                                                {errors.submit}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CampaignForm;

