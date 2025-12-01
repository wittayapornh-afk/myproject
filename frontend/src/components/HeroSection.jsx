import React from 'react';

function HeroSection() {
  const scrollToShop = () => {
    document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-primary flex items-center">
      
      {/* Background Shapes */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-[#254035]"></div>
      <div className="absolute top-0 right-0 w-[55%] h-full bg-[#36594A] skew-x-12 translate-x-20 opacity-40"></div>

      <div className="max-w-7xl mx-auto h-full px-6 relative z-10 flex flex-col-reverse md:flex-row items-center w-full">
        
        {/* Left Content */}
        <div className="w-full md:w-1/2 pt-8 md:pt-0 md:pr-12 text-center md:text-left z-10">
            <span className="inline-block bg-white/10 text-white/80 uppercase tracking-widest text-[10px] font-bold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                New Arrival 2025
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white mb-6 drop-shadow-md">
                MODERN <br/> 
                <span className="text-highlight">NATURE LIFE</span>
            </h1>
            
            <p className="text-gray-300 text-sm md:text-base mb-10 max-w-md mx-auto md:mx-0 font-light leading-relaxed opacity-90">
                สัมผัสความเรียบง่ายที่ลงตัว ด้วยเฟอร์นิเจอร์และของตกแต่งที่เป็นมิตรกับธรรมชาติ
            </p>
            
            <button onClick={scrollToShop} className="bg-secondary text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-lg hover:bg-[#85AD7A] transition-all duration-300 transform hover:-translate-y-1">
                DISCOVER MORE
            </button>
        </div>

        {/* Right Image (เปลี่ยนรูปตรงนี้!) */}
        <div className="w-full md:w-1/2 h-[50%] md:h-full flex items-center justify-center relative z-10">
            <img 
                // ✅ เปลี่ยนเป็นรูปเก้าอี้สีครีม/เทา ที่ดูมินิมอลและเข้ากับธีมเขียว
                src="https://www.pngarts.com/files/1/Modern-Chair-PNG-Image-Background.png" 
                alt="Hero Furniture" 
                className="w-auto h-[85%] object-contain drop-shadow-2xl hover:scale-105 transition duration-700 ease-in-out transform translate-y-4"
                // กันเหนียว: ถ้ารูปโหลดไม่ได้ ให้ใช้รูปสำรอง
                onError={(e) => { e.target.src = "https://cdn.dummyjson.com/products/images/furniture/Knoll%20Saarinen%20Executive%20Conference%20Chair/thumbnail.png"; }}
            />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;