import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Zap, Package, TrendingUp, Tag, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * 🏆 CampaignDetailView Component
 * 
 * แสดงรายละเอียดครบถ้วนของ Campaign รวมถึง:
 * - ข้อมูลพื้นฐาน Campaign (ชื่อ, วันที่, สี, คำอธิบาย)
 * - รายการ Flash Sales ทั้งหมดที่เข้าร่วม
 * - สินค้าในแต่ละ Flash Sale พร้อมรูปภาพและราคา
 * - สถิติสรุปรวม
 */
const CampaignDetailView = ({ campaign, onClose, onEditFlashSale }) => {
    if (!campaign) return null;

    // คำนวณสถิติ
    const flashSalesCount = campaign.flash_sales?.length || 0;
    const totalProducts = campaign.flash_sales?.reduce((sum, fs) => sum + (fs.products?.length || 0), 0) || 0;
    const totalDiscount = campaign.flash_sales?.reduce((sum, fs) => {
        const fsDiscount = fs.products?.reduce((pSum, p) => 
            pSum + (p.original_price - p.sale_price), 0) || 0;
        return sum + fsDiscount;
    }, 0) || 0;

    // คำนวณช่วงเวลา
    const startDate = new Date(campaign.campaign_start);
    const endDate = new Date(campaign.campaign_end);
    const isActive = campaign.is_active && new Date() >= startDate && new Date() <= endDate;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            >
                {/* Header Section with Banner */}
                <div 
                    className="relative h-64 rounded-t-3xl overflow-hidden"
                    style={{ 
                        background: `linear-gradient(135deg, ${campaign.theme_color || '#f97316'}, ${campaign.theme_color || '#f97316'}dd)`
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all text-white z-10"
                    >
                        <X size={24} />
                    </button>

                    {/* Back Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all text-white z-10"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-bold">กลับ</span>
                    </button>

                    {/* Banner Image or Gradient */}
                    {campaign.banner_image && (
                        <img 
                            src={campaign.banner_image} 
                            alt={campaign.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-30"
                        />
                    )}

                    {/* Campaign Title & Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                                    🏆 {campaign.name}
                                    {isActive && (
                                        <span className="text-sm px-3 py-1 bg-green-500 rounded-full font-bold animate-pulse">
                                            🟢 กำลังดำเนินการ
                                        </span>
                                    )}
                                </h1>
                                <p className="text-white/90 text-lg max-w-2xl">
                                    {campaign.description || 'ไม่มีคำอธิบาย'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Zap className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase">Flash Sales</p>
                                <p className="text-2xl font-black text-gray-800">{flashSalesCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Package className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase">สินค้าทั้งหมด</p>
                                <p className="text-2xl font-black text-gray-800">{totalProducts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Calendar className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase">ระยะเวลา</p>
                                <p className="text-sm font-black text-gray-800">
                                    {format(startDate, 'd MMM', { locale: th })} - {format(endDate, 'd MMM', { locale: th })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase">ส่วนลดรวม</p>
                                <p className="text-xl font-black text-green-600">
                                    ฿{totalDiscount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Sales List */}
                <div className="p-8">
                    <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                        <Zap className="text-orange-500" />
                        รายการ Flash Sales
                    </h2>

                    {flashSalesCount === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl">
                            <Zap className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-400 font-bold text-lg">ยังไม่มี Flash Sale ใน Campaign นี้</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {campaign.flash_sales.map((flashSale, index) => {
                                const fsStart = new Date(flashSale.start_time);
                                const fsEnd = new Date(flashSale.end_time);
                                const now = new Date();
                                const isLive = now >= fsStart && now <= fsEnd;
                                const isUpcoming = now < fsStart;

                                return (
                                    <motion.div
                                        key={flashSale.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                                    >
                                        {/* Flash Sale Header */}
                                        <div 
                                            className="p-6 flex items-center justify-between border-b border-gray-100"
                                            style={{ 
                                                background: `linear-gradient(to right, ${campaign.theme_color}10, transparent)`
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
                                                    style={{ backgroundColor: campaign.theme_color }}
                                                >
                                                    <Zap className="text-white" size={32} fill="currentColor" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                                        {flashSale.name}
                                                        {isLive && (
                                                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                                                                🔴 LIVE
                                                            </span>
                                                        )}
                                                        {isUpcoming && (
                                                            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-bold">
                                                                🔵 เร็วๆ นี้
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={14} />
                                                            {format(fsStart, 'dd MMM HH:mm', { locale: th })} - {format(fsEnd, 'HH:mm', { locale: th })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Package size={14} />
                                                            {flashSale.products?.length || 0} สินค้า
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onEditFlashSale && onEditFlashSale(flashSale)}
                                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                            >
                                                แก้ไข
                                            </button>
                                        </div>

                                        {/* Products Grid */}
                                        <div className="p-6">
                                            {!flashSale.products || flashSale.products.length === 0 ? (
                                                <p className="text-center text-gray-400 py-8">ยังไม่มีสินค้าใน Flash Sale นี้</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {flashSale.products.map((product, pIndex) => {
                                                        const discount = product.original_price - product.sale_price;
                                                        const discountPercent = Math.round((discount / product.original_price) * 100);

                                                        return (
                                                            <motion.div
                                                                key={pIndex}
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: pIndex * 0.05 }}
                                                                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all group"
                                                            >
                                                                <div className="flex gap-3">
                                                                    {/* Product Image */}
                                                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                                                        {product.product_image ? (
                                                                            <img 
                                                                                src={product.product_image} 
                                                                                alt={product.product_name}
                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                                <Package className="text-gray-400" size={32} />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Product Info */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold text-gray-800 text-sm truncate mb-1">
                                                                            {product.product_name}
                                                                        </h4>
                                                                        
                                                                        <div className="flex items-baseline gap-2 mb-2">
                                                                            <span className="text-lg font-black text-red-600">
                                                                                ฿{product.sale_price?.toLocaleString()}
                                                                            </span>
                                                                            <span className="text-xs text-gray-400 line-through">
                                                                                ฿{product.original_price?.toLocaleString()}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                                                                                <Tag size={10} />
                                                                                -{discountPercent}%
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                เหลือ {product.quantity_limit || 0} ชิ้น
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default CampaignDetailView;
