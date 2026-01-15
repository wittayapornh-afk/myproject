import React, { useState, useEffect } from 'react';
import { Zap, Clock, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const FlashSaleSection = ({ flashSale }) => {
    if (!flashSale || !flashSale.is_active) return null;

    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(flashSale.end_time) - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    hours: Math.floor((difference / (1000 * 60 * 60))),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            } else {
                timeLeft = { hours: 0, minutes: 0, seconds: 0 };
            }
            setTimeLeft(timeLeft);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [flashSale]);

    const products = flashSale.products || [];

    return (
        <section className="mb-16 -mt-8 relative z-30">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-red-100 relative overflow-hidden">
                    
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-50 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative z-10 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 transform rotate-3">
                                <Zap className="fill-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-800 italic uppercase tracking-tighter">
                                    Flash <span className="text-red-500">Sale</span>
                                </h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{flashSale.name}</p>
                            </div>
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center gap-2">
                             <span className="text-xs font-black text-red-400 uppercase tracking-widest mr-2 hidden md:block">สิ้นสุดใน</span>
                             <div className="flex gap-2">
                                <div className="bg-gray-900 text-white w-10 h-10 rounded-lg flex flex-col items-center justify-center font-black shadow-lg">
                                    <span className="text-sm leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                                    <span className="text-[8px] text-gray-400 font-bold uppercase">ชม.</span>
                                </div>
                                <span className="text-2xl font-black text-gray-300 self-center">:</span>
                                <div className="bg-red-500 text-white w-10 h-10 rounded-lg flex flex-col items-center justify-center font-black shadow-lg shadow-red-200">
                                    <span className="text-sm leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                    <span className="text-[8px] text-red-100 font-bold uppercase">นาที</span>
                                </div>
                                <span className="text-2xl font-black text-gray-300 self-center">:</span>
                                <div className="bg-gray-900 text-white w-10 h-10 rounded-lg flex flex-col items-center justify-center font-black shadow-lg">
                                    <span className="text-sm leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                    <span className="text-[8px] text-gray-400 font-bold uppercase">วิ.</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Product Grid (Horizontal Scroll on Mobile) */}
                    <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide snap-x md:grid md:grid-cols-4 md:overflow-visible">
                        {products.map((item) => (
                            <Link 
                                to={`/product/${item.product}`} // Linking to main product page
                                key={item.id} 
                                className="min-w-[200px] md:min-w-0 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all group snap-center relative"
                            >
                                {/* Sale Badge */}
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10 shadow-sm">
                                    -{Math.round(((item.original_price - item.sale_price) / item.original_price) * 100)}%
                                </div>

                                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-50">
                                    <img 
                                        src={item.product_image ? `${API_BASE_URL}${item.product_image}` : '/placeholder.png'} 
                                        alt={item.product_name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Quick Overlay */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <span className="bg-white/90 backdrop-blur text-xs font-black px-4 py-2 rounded-full shadow-lg">ดูสินค้า</span>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{item.product_name}</h3>
                                
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-lg font-black text-red-600">฿{parseFloat(item.sale_price).toLocaleString()}</span>
                                    <span className="text-xs text-gray-400 line-through font-bold">฿{parseFloat(item.original_price).toLocaleString()}</span>
                                </div>

                                {/* Stock Bar */}
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                                    <div 
                                        className="h-full bg-red-500 rounded-full" 
                                        style={{ width: `${(item.sold_count / item.quantity_limit) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase">
                                    <span>ขายแล้ว {item.sold_count}</span>
                                    {item.sold_count >= item.quantity_limit ? (
                                        <span className="text-red-500">หมดแล้ว</span>
                                    ) : (
                                        <span>เหลือ {item.quantity_limit - item.sold_count}</span>
                                    )}
                                </div>

                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FlashSaleSection;
