import React, { useState, useEffect } from 'react';
import { X, Gift, Zap, ArrowRight, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const MarketingPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [campaignType, setCampaignType] = useState(null); // 'flash_sale' | 'coupon'
    const [data, setData] = useState(null);
    const { user } = useAuth(); // Check if logged in for coupons

    useEffect(() => {
        const checkCampaigns = async () => {
            // 1. Check Session Storage (Show once per session)
            const hasSeen = sessionStorage.getItem('hasSeenMarketingPopup');
            if (hasSeen) return;

            try {
                // 2. Priority 1: Flash Sale
                const fsRes = await axios.get(`${API_BASE_URL}/api/flash-sales/active/`);
                if (fsRes.data && fsRes.data.length > 0) {
                    setData(fsRes.data[0]); // Take the first active one
                    setCampaignType('flash_sale');
                    setIsVisible(true);
                    return;
                }

                // 3. Priority 2: Coupons (Only if logged in)
                if (user) {
                    const token = localStorage.getItem('token');
                    if (token) {
                        try {
                            const couponRes = await axios.get(`${API_BASE_URL}/api/coupons-public/`, {
                                headers: { Authorization: `Token ${token}` }
                            });
                            if (couponRes.data && couponRes.data.length > 0) {
                                setData(couponRes.data);
                                setCampaignType('coupon');
                                setIsVisible(true);
                            }
                        } catch (e) {
                            console.warn("Failed to fetch coupons", e);
                        }
                    }
                }

            } catch (err) {
                console.error("Failed to fetch marketing campaigns", err);
            }
        };

        // Delay slightly for effect
        const timer = setTimeout(checkCampaigns, 1500);
        return () => clearTimeout(timer);
    }, [user]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenMarketingPopup', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            ></div>

            {/* Content Card */}
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
                >
                    <X size={16} className="text-gray-600" />
                </button>

                {/* --- FLASH SALE LAYOUT --- */}
                {campaignType === 'flash_sale' && (
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-red-500 to-orange-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
                            
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-lg">
                                <Zap size={32} className="text-yellow-300 fill-yellow-300 animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight uppercase italic transform -rotate-1">Flash Sale!</h2>
                            <p className="text-white/90 font-bold mt-2 text-sm">{data.name}</p>
                            
                            <div className="mt-6 flex justify-center gap-2">
                                {/* Simple countdown preview or just urgent text */}
                                <span className="bg-red-800/30 px-3 py-1 rounded-lg text-xs font-bold border border-white/20 backdrop-blur-sm">
                                    ⏰ รีบเลย! เวลาจำกัด
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <p className="text-gray-500 text-sm mb-6 font-medium">
                                พบกับสินค้าราคาพิเศษลดกระหน่ำ ห้ามพลาดโอกาสดีๆ แบบนี้ ช้อปเลยก่อนของหมด!
                            </p>
                            <button 
                                onClick={handleClose}
                                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-red-200 hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                เข้าสู่ Flash Sale <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- COUPON LAYOUT --- */}
                {campaignType === 'coupon' && (
                    <div className="text-center">
                        <div className="bg-[#1a4d2e] p-8 text-white relative overflow-hidden">
                             {/* Decor */}
                             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
                                <Gift size={32} className="text-white animate-bounce-slow" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">แจกคูปองส่วนลด!</h2>
                            <p className="text-white/80 font-bold mt-1 text-xs uppercase tracking-widest">สำหรับคุณโดยเฉพาะ</p>
                        </div>

                        <div className="p-6 bg-[#F9F9F7]">
                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {data.slice(0, 3).map((coupon, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-dashed border-gray-300 flex items-center gap-4 relative overflow-hidden group hover:border-[#1a4d2e] transition-colors">
                                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#1a4d2e] shrink-0">
                                            <Ticket size={18} />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-black text-[#1a4d2e] text-lg truncate">{coupon.code}</p>
                                            <p className="text-[10px] text-gray-400 font-bold truncate">{coupon.description}</p>
                                        </div>
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F9F9F7] rounded-full"></div>
                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#F9F9F7] rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 pt-2">
                             <p className="text-gray-400 text-[10px] mb-4 font-bold">
                                *เงื่อนไขเป็นไปตามที่บริษัทกำหนด
                            </p>
                            <button 
                                onClick={handleClose}
                                className="w-full bg-[#1a4d2e] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-900/10 hover:bg-[#143d24] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                เก็บโค้ดแล้วช้อปเลย
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketingPopup;
