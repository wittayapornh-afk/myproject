import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. รอโหลดข้อมูล User ก่อน (สำคัญมาก: กันไม่ให้ดีดไปหน้า Login ตอนกด Refresh)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F0E4]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#305949] mx-auto mb-4"></div>
            <p className="text-[#305949] font-bold animate-pulse">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // 2. ถ้ายังไม่ล็อกอิน -> ดีดไปหน้า Login (พร้อมแนบ state เพื่อให้ login เสร็จแล้วเด้งกลับมาหน้านี้ได้)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. ถ้าล็อกอินแล้ว แต่ Role ไม่ตรงกับที่อนุญาต (เช่น User พยายามเข้าหน้า Admin) -> ดีดกลับหน้าแรก
  if (allowedRoles && !allowedRoles.includes(user.role_code)) {
    return <Navigate to="/" replace />;
  }

  // 4. ผ่านการตรวจสอบทุกอย่าง -> อนุญาตให้เข้าถึงหน้านั้นได้
  return children;
};

export default ProtectedRoute;