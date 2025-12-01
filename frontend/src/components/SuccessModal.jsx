import React from 'react';
import { Link } from 'react-router-dom';

function SuccessModal({ isOpen, onClose, title, message, linkTo, linkText }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
        
        {/* Icon วงกลมติ๊กถูก */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{message}</p>

        <div className="flex flex-col gap-3">
            {/* ปุ่มหลัก (ถ้ามีลิงก์ให้ไปหน้าอื่น) */}
            {linkTo ? (
                <Link to={linkTo} className="w-full inline-flex justify-center px-4 py-2.5 bg-primary hover:bg-primaryHover text-white font-medium rounded-xl transition shadow-lg shadow-primary/30">
                    {linkText || "ตกลง"}
                </Link>
            ) : (
                <button onClick={onClose} className="w-full inline-flex justify-center px-4 py-2.5 bg-primary hover:bg-primaryHover text-white font-medium rounded-xl transition shadow-lg shadow-primary/30">
                    ตกลง
                </button>
            )}
            
            {/* ปุ่มปิด (ถ้าไม่มีลิงก์บังคับไป) */}
            {linkTo && (
                 <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 font-medium">
                    อยู่ในหน้านี้ต่อ
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;