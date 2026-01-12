import React from 'react';
import { ArrowRightCircle } from 'lucide-react';

/**
 * InfoBox Component
 * ส่วนแสดงผลกล่องข้อมูลสถิติด้านบนแบบ AdminLTE
 * 
 * @param {string} title - หัวข้อ (เช่น New Orders)
 * @param {string|number} value - ค่าข้อมูล (เช่น 150)
 * @param {string} bgColor - คลาสสีพื้นหลัง (เช่น bg-blue-500)
 * @param {ReactNode} icon - ไอคอนที่แสดงด้านขวา
 * @param {string} link - ลิงก์ไปหน้ารายละเอียด
 */
const InfoBox = ({ title, value, bgColor, icon, link = "#" }) => {
  return (
    <div className={`${bgColor} relative rounded-lg shadow-md overflow-hidden text-white h-32 flex flex-col`}>
      {/* ส่วนเนื้อหาหลัก */}
      <div className="p-4 flex-1 relative z-10">
        <h3 className="text-4xl font-bold mb-1">{value}</h3>
        <p className="text-sm font-medium uppercase tracking-wide opacity-90">{title}</p>
      </div>

      {/* ไอคอนพื้นหลังจางๆ */}
      <div className="absolute top-3 right-3 opacity-20 transform scale-150 transition-transform hover:scale-125">
        {icon}
      </div>

      {/* ส่วนลิงก์ด้านล่าง More info */}
      <a 
        href={link} 
        className="bg-black/10 flex items-center justify-center gap-2 py-1 text-xs font-medium hover:bg-black/20 transition-colors w-full cursor-pointer mt-auto"
      >
        More info <ArrowRightCircle size={14} />
      </a>
    </div>
  );
};

export default InfoBox;
