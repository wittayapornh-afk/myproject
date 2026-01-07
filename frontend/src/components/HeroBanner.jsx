
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/formatUtils';

const HeroBanner = () => {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch Featured Products (Assume random or latest)
        fetch('http://localhost:8000/api/products/?page_size=5') 
            .then(res => res.json())
            .then(data => {
                const items = data.results || data;
                if (Array.isArray(items) && items.length > 0) {
                    // Pick top 3-5 items
                    setSlides(items.slice(0, 5));
                    setLoading(false);
                } else {
                    // Fallback if no products
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Hero Fetch Error", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000); // 6 seconds
        return () => clearInterval(timer);
    }, [slides]);

    if (loading) return <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded-[3rem] mx-auto my-6"></div>;
    if (slides.length === 0) return null;

    const slide = slides[current];

    // Background colors based on index (Cycle through 4 themes)
    const themes = [
        { bg: "bg-[#1a4d2e]", text: "text-white", accent: "text-green-300", ball: "bg-white/10" },
        { bg: "bg-[#263A33]", text: "text-white", accent: "text-orange-300", ball: "bg-white/5" },
        { bg: "bg-[#E6E2DE]", text: "text-[#263A33]", accent: "text-[#1a4d2e]", ball: "bg-black/5" },
        { bg: "bg-[#0f172a]", text: "text-white", accent: "text-blue-300", ball: "bg-white/10" }
    ];
    const theme = themes[current % themes.length];

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4 pt-6 pb-12">
            <div className={`relative w-full h-[550px] md:h-[600px] overflow-hidden rounded-[3rem] shadow-2xl transition-colors duration-700 ${theme.bg}`}>
                
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-8 md:p-20 relative z-10"
                    >
                        {/* ✅ Decor Text Background */}
                        <div className="absolute top-10 left-10 text-[10rem] md:text-[15rem] font-black opacity-5 whitespace-nowrap select-none pointer-events-none truncate max-w-full">
                            {slide.category}
                        </div>

                         {/* Left: Content */}
                        <div className={`md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-20 ${theme.text}`}>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full ${theme.ball} backdrop-blur-md border border-white/20 text-sm font-bold tracking-wider uppercase`}
                            >
                                <TrendingUp size={16} className={theme.accent}/> Trending Now
                            </motion.div>
                            
                            <motion.h1
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl md:text-7xl font-black mb-6 leading-tight max-w-xl"
                            >
                                {slide.title}
                            </motion.h1>

                            <motion.p
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className={`text-lg md:text-xl mb-8 font-medium opacity-80 max-w-lg line-clamp-2`}
                            >
                                {slide.description}
                            </motion.p>
                             
                            <motion.div
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex flex-col md:flex-row gap-4 items-center"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-60 font-bold uppercase">Price</span>
                                    <span className={`text-4xl font-black ${theme.accent}`}>{formatPrice(slide.price)}</span>
                                </div>
                                <div className="w-px h-12 bg-white/20 mx-4 hidden md:block"></div>
                                {/* <button 
                                    onClick={() => navigate(`/product/${slide.id}`)}
                                    className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-black text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 group"
                                >
                                    <ShoppingBag size={20} className="group-hover:fill-black transition-colors"/>
                                    Buy Now
                                </button> */}
                            </motion.div>
                        </div>

                        {/* Right: Image */}
                        <motion.div 
                            initial={{ x: 100, opacity: 0, rotate: 10 }}
                            animate={{ x: 0, opacity: 1, rotate: 0 }}
                            exit={{ x: -100, opacity: 0, rotate: -10 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="md:w-1/2 h-full flex items-center justify-center relative mt-10 md:mt-0"
                        >
                            {/* Circle Background */}
                            <div className={`absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full ${theme.ball} blur-3xl -z-10`}></div>
                            
                            <img 
                                src={getImageUrl(slide.image || slide.thumbnail)} 
                                alt={slide.title} 
                                className="w-[80%] md:w-full max-h-[400px] md:max-h-[500px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-110 transition-transform duration-500"
                                onClick={() => navigate(`/product/${slide.id}`)}
                            />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                current === index ? `w-12 bg-white` : `w-2 bg-white/30 hover:bg-white/60`
                            }`}
                        />
                    ))}
                </div>

                {/* Navigation Buttons */}
                <button 
                    onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="absolute top-1/2 left-4 z-40 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all -translate-y-1/2"
                >
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                    className="absolute top-1/2 right-4 z-40 p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all -translate-y-1/2"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default HeroBanner;
