import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PromotionPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup after a short delay (e.g., 1.5 seconds)
    const timer = setTimeout(() => {
      // Check if already shown in this session (optional, can remove for development)
      const hasShown = sessionStorage.getItem('promoPopupShown');
      if (!hasShown) {
        setIsVisible(true);
        sessionStorage.setItem('promoPopupShown', 'true');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setIsVisible(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Popup Content */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-gradient-to-br from-[#ff5e3a] to-[#ff2a68] rounded-[32px] shadow-2xl overflow-hidden text-center p-8"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="mt-2 relative z-10">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-lg transform -rotate-6 mb-6"
                >
                    <Gift size={48} className="text-[#ff2a68]" />
                </motion.div>
                
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 drop-shadow-md">
                    รับฟรี!
                </h2>
                <p className="text-xl font-bold text-white/90 mb-6 font-thai">
                    ออเดอร์แรก*
                </p>

                <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-xs font-bold font-thai">โค้ดส่วนลดพิเศษ</span>
                        <span className="text-white font-black bg-[#1a4d2e] px-2 py-0.5 rounded text-[10px]">NEWUSER</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                            <ShoppingBag size={20} className="text-[#ff5e3a]" />
                         </div>
                         <div className="text-left">
                             <p className="text-white font-bold text-sm line-clamp-1 font-thai">ลดสูงสุด 100 บาท</p>
                             <p className="text-white/60 text-[10px] font-thai">เมื่อช้อปครบ 500 บาท</p>
                         </div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        handleClose();
                        navigate('/coupon-center');
                    }}
                    className="w-full bg-white text-[#ff2a68] font-black py-4 rounded-xl shadow-lg border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                >
                    ช้อปเลย <ChevronRight size={18} />
                </motion.button>
            </div>

            {/* Decorative Sparkles */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute bottom-20 right-10 w-3 h-3 bg-white rounded-full animate-pulse" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromotionPopup;
