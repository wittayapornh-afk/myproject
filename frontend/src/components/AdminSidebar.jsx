import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#305949',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม (Dashboard)', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'จัดการสินค้าในคลัง', icon: <Package size={20} /> },
    { id: 'orders', label: 'จัดการออเดอร์ลูกค้า', icon: <ShoppingCart size={20} /> },
    // Show 'users' only if NOT seller
    // Using filtered array below instead of hardcoding here
    { id: 'users', label: 'จัดการผู้ใช้งาน', icon: <Users size={20} />, restricted: true },
  ];

  // ✅ Filter menu items based on role
  // Seller should not see 'users'
  const { user } = useAuth();
  const visibleMenuItems = menuItems.filter(item => {
    if (item.restricted && user?.role === 'seller') return false;
    return true;
  });

  return (
    <div className="w-64 bg-[#263A33] text-white min-h-screen p-4 flex flex-col shadow-xl fixed left-0 top-0 z-40 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2 mt-4">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
          <LayoutDashboard className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">SHOP ADMIN</h1>
          <p className="text-xs text-gray-400">Super Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {visibleMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
              ? 'bg-[#305949] text-white shadow-lg translate-x-1'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
      >
        <LogOut size={20} />
        <span>ออกจากระบบ</span>
      </button>
    </div>
  );
};

export default AdminSidebar;