import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ✅ Rule: คงหน้า Loading เดิมไว้ (ห้ามลบ)
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

  // ถ้ายังไม่ล็อกอิน -> ดีดไป Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Rule: เช็ค Role แบบยืดหยุ่น (User == user)
  if (allowedRoles && allowedRoles.length > 0) {
     const userRole = (user.role || '').toLowerCase();
     const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());

     if (!allowedRolesLower.includes(userRole)) {
        // ถ้าเป็น Admin แล้วเผลอเข้าหน้า User -> ดีดไป Dashboard
        if (userRole === 'admin' || userRole === 'super_admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/" replace />;
     }
  }

  return children;
};

export default ProtectedRoute;