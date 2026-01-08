import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  // Sidebar logic is now handled globally in App.jsx (MainLayout)
  return (
    <div className="min-h-screen bg-[#F2F0E4] animate-fade-in">
        <Outlet />
    </div>
  );
};

export default AdminLayout;
