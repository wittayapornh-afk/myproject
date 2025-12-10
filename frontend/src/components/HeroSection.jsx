import React from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full bg-[#F2F0E4] overflow-hidden pt-10 pb-20 md:pt-20 md:pb-24">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#E8E6D9] to-transparent opacity-60 rounded-l-[10rem] -mr-20"></div>
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#305949]/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-6">
            <div className="inline-block px-4 py-1.5 bg-white border border-[#305949]/20 rounded-full text-[#305949] text-xs font-bold uppercase tracking-widest shadow-sm mb-2 animate-fade-in-up">
                New Collection 2025
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[#263A33] leading-tight tracking-tight">
                ค้นพบสไตล์<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#305949] to-[#5C8D75]">ที่เป็นคุณ</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-lg mx-auto md:mx-0 leading-relaxed">
                แหล่งรวมสินค้าคุณภาพดีไซน์มินิมอล ที่คัดสรรมาเพื่อยกระดับไลฟ์สไตล์ของคุณ ช้อปง่าย ส่งไว มั่นใจได้ 100%
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <button onClick={() => navigate('/shop')} className="px-8 py-4 bg-[#305949] text-white rounded-full font-bold shadow-lg shadow-[#305949]/30 hover:bg-[#234236] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    ช้อปสินค้าเลย 🛍️
                </button>
                <button className="px-8 py-4 bg-white text-[#263A33] border border-gray-200 rounded-full font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                    ดูโปรโมชั่น 🔥
                </button>
            </div>
        </div>

        {/* Right Image (Hero) */}
        <div className="flex-1 w-full flex justify-center relative">
            <div className="relative w-[300px] md:w-[450px] aspect-[4/5] bg-white rounded-[3rem] shadow-2xl p-4 rotate-3 hover:rotate-0 transition-transform duration-700 ease-out border-8 border-white/50">
                <img 
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop" 
                    alt="Hero Product" 
                    className="w-full h-full object-cover rounded-[2.5rem]"
                />
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                    <span className="text-3xl">⚡</span>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Special Offer</p>
                        <p className="text-lg font-bold text-[#263A33]">ลดสูงสุด 50%</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default HeroSection;