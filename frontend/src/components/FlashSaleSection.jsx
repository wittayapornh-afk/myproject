import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const FlashSaleSection = ({ flashSale }) => {
    const [status, setStatus] = useState('active'); // 'active' | 'upcoming' | 'ended'
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, days: 0 });

    useEffect(() => {
        if (!flashSale || !flashSale.end_time) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const start = new Date(flashSale.start_time).getTime();
            const end = new Date(flashSale.end_time).getTime();
            
            let target = end;
            let currentStatus = 'active';

            if (now < start) {
                target = start;
                currentStatus = 'upcoming';
            } else if (now > end) {
                currentStatus = 'ended';
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, days: 0 });
                setStatus('ended');
                return;
            }

            const difference = target - now;
            
            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
                setStatus(currentStatus);
            } else {
                // Time reached (Start or End)
                if (currentStatus === 'upcoming') {
                     // Transition to active
                     calculateTimeLeft(); // Recalculate immediately
                } else {
                    setStatus('ended');
                }
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [flashSale]);

    if (!flashSale || !flashSale.is_active) return null;
    
    // ✅ Custom: Hide if expired on frontend
    if (new Date(flashSale.end_time) < new Date()) return null;

    const products = flashSale.products || [];

    return (
        <section className="bg-white py-4 mb-4 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        {/* Title with Icon */}
                        <div className="flex items-center gap-1">
                            <Zap className={`${status === 'upcoming' ? 'fill-blue-500 text-blue-500' : 'fill-orange-500 text-orange-500'}`} size={24} />
                            <h2 className={`text-2xl font-black ${status === 'upcoming' ? 'text-blue-500' : 'text-orange-500'} uppercase italic tracking-tighter`}>
                                {status === 'upcoming' ? 'UPCOMING SALE' : 'FLASH SALE'}
                            </h2>
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center gap-1">
                            {status === 'upcoming' && <span className="text-gray-500 text-xs font-bold mr-1">เริ่มใน:</span>}
                            {timeLeft.days > 0 && <><TimerBox value={timeLeft.days} bg={status === 'upcoming' ? 'bg-blue-600' : 'bg-black'} /><span className="font-bold text-gray-800">:</span></>}
                            <TimerBox value={String(timeLeft.hours).padStart(2, '0')} bg={status === 'upcoming' ? 'bg-blue-600' : 'bg-black'} />
                            <span className="font-bold text-gray-800">:</span>
                            <TimerBox value={String(timeLeft.minutes).padStart(2, '0')} bg={status === 'upcoming' ? 'bg-blue-600' : 'bg-black'} />
                            <span className="font-bold text-gray-800">:</span>
                            <TimerBox value={String(timeLeft.seconds).padStart(2, '0')} bg={status === 'upcoming' ? 'bg-blue-600' : 'bg-black'} />
                        </div>
                    </div>

                    <Link to="/flash-sale" className="text-gray-500 font-medium text-sm flex items-center hover:text-orange-500">
                        ดูทั้งหมด <ChevronRight size={16} />
                    </Link>
                </div>

                {/* ✅ Campaign Description */}
                {flashSale.description && (
                    <div className="mb-6 bg-orange-50 px-4 py-3 rounded-xl border border-orange-100 flex items-start gap-3">
                        <Flame className="text-orange-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{flashSale.description}</p>
                    </div>
                )}

                {products.length === 1 ? (
                    // ✅ SINGLE ITEM LAYOUT (Hero Style - Compact Version)
                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row h-auto md:min-h-[320px]">
                        {/* Left: Image (Reduced Size 35%) */}
                        <div className="w-full md:w-[35%] bg-gray-50 relative">
                            {/* Tags */}
                            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                                <span className="bg-[#D0011B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Mall</span>
                                <span className="bg-[#FFD940] text-orange-900 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    ลด {Math.round(((products[0].original_price - products[0].sale_price) / products[0].original_price) * 100)}%
                                </span>
                            </div>
                             <img 
                                src={products[0].product_image ? `${API_BASE_URL}${products[0].product_image}` : '/placeholder.png'} 
                                alt={products[0].product_name} 
                                className="w-full h-full object-contain mix-blend-multiply p-4"
                            />
                        </div>

                        {/* Right: Details (65%) */}
                        <div className="w-full md:w-[65%] p-6 flex flex-col justify-center">
                             <Link to={`/product/${products[0].product}`} className="group">
                                <h3 className="text-xl font-bold text-gray-800 line-clamp-1 group-hover:text-orange-500 transition-colors mb-2">
                                    {products[0].product_name || "สินค้า Flash Sale สุดพิเศษ"}
                                </h3>
                             </Link>

                             <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-black text-orange-500">฿{parseFloat(products[0].sale_price).toLocaleString()}</span>
                                <span className="text-sm text-gray-400 line-through">฿{parseFloat(products[0].original_price).toLocaleString()}</span>
                             </div>

                             {/* Compact Progress Bar */}
                             <div className="mb-6 w-full max-w-md">
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                    <span>ขายแล้ว {products[0].sold_count}</span>
                                    <span>เหลือ {products[0].quantity_limit - products[0].sold_count}</span>
                                </div>
                                <div className="relative w-full h-3 bg-[#FFE1D1] rounded-full overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full" 
                                        style={{ width: `${(products[0].sold_count / products[0].quantity_limit) * 100}%` }}
                                    />
                                </div>
                             </div>

                             <Link 
                                to={`/product/${products[0].product}`}
                                className="w-full max-w-xs bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold text-base py-3 rounded-lg transition-all text-center"
                             >
                                ดูรายละเอียด
                             </Link>
                        </div>
                    </div>
                ) : (
                    // ✅ MULTI ITEM LAYOUT (Original Carousel)
                    <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x">
                        {products.map((item) => {
                             const percentDiscount = Math.round(((item.original_price - item.sale_price) / item.original_price) * 100);
                             const soldPercent = (item.sold_count / item.quantity_limit) * 100;
                             
                             return (
                                <Link 
                                    to={`/product/${item.product}`}
                                    key={item.id} 
                                    className="min-w-[160px] w-[160px] md:min-w-[190px] md:w-[190px] bg-white hover:shadow-lg transition-all duration-300 relative group snap-start block border border-transparent hover:border-gray-100"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square bg-gray-50 mb-2">
                                        {/* Yellow Discount Flag (Top Right) */}
                                        <div className="absolute top-0 right-0 bg-[#FFD940] text-orange-900 w-10 h-10 flex flex-col items-center justify-center text-xs font-bold z-10 clip-path-flag">
                                            <span className="text-red-600 leading-none mt-1">ลด</span>
                                            <span className="text-white drop-shadow-sm font-black text-[13px]">{percentDiscount}%</span>
                                        </div>
                                        
                                        {/* Mall/Brand Badge (Top Left) */}
                                        <div className="absolute top-0 left-0 bg-[#D0011B] text-white text-[10px] font-bold px-1.5 py-0.5 z-10 uppercase rounded-br">
                                            Mall
                                        </div>
    
                                        <img 
                                            src={item.product_image ? `${API_BASE_URL}${item.product_image}` : '/placeholder.png'} 
                                            alt={item.product_name} 
                                            className="w-full h-full object-cover mix-blend-multiply"
                                        />
                                        
                                        {/* Overlay on Hover */}
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
    
                                    {/* Content */}
                                    <div className="px-1 pb-2">
                                        <div className="h-[46px] flex items-center justify-center">
                                           <div className="text-center">
                                             <p className="text-orange-500 font-medium text-lg leading-none">฿{parseFloat(item.sale_price).toLocaleString()}</p>
                                             <p className="text-gray-400 text-xs line-through decoration-gray-400/60 mt-0.5">฿{parseFloat(item.original_price).toLocaleString()}</p>
                                           </div>
                                        </div>
    
                                        {/* Progress Bar (Shopee Style) */}
                                        <div className="relative w-[90%] mx-auto h-4 bg-[#FFE1D1] rounded-full mt-2 overflow-hidden">
                                            {/* Progress Fill */}
                                            <div 
                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full z-0" 
                                                style={{ width: `${soldPercent}%` }}
                                            />
                                            
                                            {/* Fire Icon (if hot) */}
                                            {soldPercent > 80 && (
                                                <div className="absolute top-0.5 left-1 z-20">
                                                    <Flame size={12} className="fill-white text-white drop-shadow-sm" />
                                                </div>
                                            )}
    
                                            {/* Text Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <span className="text-[10px] font-bold text-white uppercase drop-shadow-sm tracking-wide">
                                                    {item.sold_count >= item.quantity_limit ? 'หมดแล้ว' : `ขายแล้ว ${item.sold_count}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                             );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

// Helper Component for Timer
const TimerBox = ({ value, bg = 'bg-black' }) => (
    <div className={`${bg} text-white text-sm font-bold px-1.5 h-5 rounded-sm flex items-center justify-center leading-none min-w-[24px]`}>
        {value}
    </div>
);

export default FlashSaleSection;
