import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // ระหว่างรอโหลดข้อมูล User ให้แสดงข้อความรอไปก่อน
  if (loading) {
    return <div className="p-10 text-center">กำลังตรวจสอบสิทธิ์...</div>;
  }

  // ถ้าไม่มี User หรือ User ไม่ใช่ Admin/Super Admin ให้เตะกลับไปหน้าแรก
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role_code !== 'super_admin' && user.role !== 'seller')) {
    return <Navigate to="/" replace />;
  }

  // ถ้าผ่านเงื่อนไข ให้แสดงหน้าที่ต้องการ (Dashboard)
  return children;
};

export default AdminRoute;