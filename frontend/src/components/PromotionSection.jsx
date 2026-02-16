import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShoppingCart, Heart, Zap, Tag } from 'lucide-react';
import { getImageUrl, formatPrice } from '../utils/formatUtils';
import { useNavigate } from 'react-router-dom';

const PromotionSection = ({ title, subtitle, products = [], bgColor = "bg-orange-500", bannerImage, linkTo }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = direction === 'left' ? -300 : 300;
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative mb-8 group/section">
      {/* 🏷️ Banner Header */}
      <div className={`relative h-24 sm:h-32 mb-4 rounded-xl overflow-hidden shadow-lg ${bgColor}`}>
        {bannerImage && (
            <img src={bannerImage} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
        )}
        <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
            <div>
                {subtitle && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                        <Zap size={10} className="fill-yellow-400 text-yellow-400" />
                        {subtitle}
                    </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight drop-shadow-md">
                    {title}
                </h2>
            </div>
            <button 
                onClick={() => navigate(linkTo || '/shop')}
                className="bg-white/90 hover:bg-white text-gray-900 font-bold px-4 py-2 rounded-full text-xs shadow-lg transition-all flex items-center gap-1"
            >
                ดูทั้งหมด <ChevronRight size={14} />
            </button>
        </div>
        
        {/* Floating Shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-20 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl" />
      </div>

      {/* 📦 Horizontal Product List */}
      <div className="relative">
          {/* Controls */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover/section:opacity-100 transition-opacity disabled:opacity-0"
          >
              <ChevronRight size={20} className="rotate-180" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 opacity-0 group-hover/section:opacity-100 transition-opacity"
          >
              <ChevronRight size={20} />
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide snap-x snap-mandatory"
          >
             {products.map((product) => (
                 <div 
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="flex-shrink-0 w-36 sm:w-44 bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group/card snap-start cursor-pointer relative"
                 >
                    {/* Badge */}
                    {product.original_price > product.price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">
                            -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                        </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square p-3 relative overflow-hidden">
                        <img 
                            src={getImageUrl(product.thumbnail || product.image)} 
                            alt={product.title}
                            className="w-full h-full object-contain group-hover/card:scale-110 transition-transform duration-500"
                        />
                    </div>

                    {/* Info */}
                    <div className="p-3 pt-0">
                        {/* Title */}
                        <h3 className="text-xs font-bold text-gray-700 line-clamp-2 min-h-[2.5em] mb-1 group-hover/card:text-blue-600 transition-colors">
                            {product.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-end justify-between mt-1">
                            <div>
                                <div className="text-gray-300 text-[10px] line-through font-medium">
                                    {product.original_price > product.price ? formatPrice(product.original_price) : ''}
                                </div>
                                <div className="text-sm sm:text-base font-black text-red-500">
                                    {formatPrice(product.price)}
                                </div>
                            </div>
                            
                            {/* Add Button */}
                            <button className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-600 hover:scale-110 transition-all active:scale-95">
                                <ShoppingCart size={14} />
                            </button>
                        </div>
                    </div>
                 </div>
             ))}
             
             {/* "See More" Card */}
             <div className="flex-shrink-0 w-36 sm:w-44 flex items-center justify-center">
                 <button 
                    onClick={() => navigate(linkTo || '/shop')}
                    className="group flex flex-col items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors"
                 >
                     <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-50 transition-all">
                        <ChevronRight size={24} />
                     </div>
                     <span className="text-xs font-bold">ดูทั้งหมด</span>
                 </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default PromotionSection;
