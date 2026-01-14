import React from 'react';
import { ArrowRight, ArrowRightCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * InfoBox Component
 * ส่วนแสดงผลกล่องข้อมูลสถิติด้านบน Premium Style
 */
const InfoBox = ({ title, value, bgColor, icon, link = "#" }) => {
  // Extract base color if possible or just use the class
  // Assuming bgColor is like 'bg-blue-500' or 'bg-gradient...'
  
  return (
    <Link 
      to={link}
      className={`group relative rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-white h-40 flex flex-col ${bgColor}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
         {/* Render icon large in background */}
         {React.cloneElement(icon, { size: 96 })}
      </div>

      <div className="p-6 relative z-10 flex flex-col h-full justify-between">
        <div>
            <h3 className="text-4xl font-black tracking-tight drop-shadow-sm">{value}</h3>
            <p className="text-sm font-bold opacity-90 uppercase tracking-widest mt-1">{title}</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1.5 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
};

export default InfoBox;
