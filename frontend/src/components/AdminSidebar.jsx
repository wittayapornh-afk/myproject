import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ChevronsLeft, User, Home, ShoppingBag, ClipboardList, Heart, History, Box, Truck, BarChart2, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl, getUserAvatar } from '../utils/formatUtils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { logout, user } = useAuth();
  const { cartItems } = useCart(); 
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const role = (user?.role || user?.role_code || '').toLowerCase();
  const isCustomer = ['user', 'customer', 'new_user'].includes(role);

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a4d2e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      background: '#fff',
      customClass: { title: 'font-black text-[#1a4d2e]', popup: 'rounded-[2rem]' }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  const adminItems = [
    { id: 'dashboard', label: 'ภาพรวม (Overview)', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'จัดการสินค้า', icon: <Package size={20} /> },
    { id: 'orders', label: 'รายการคำสั่งซื้อ', icon: <ShoppingCart size={20} /> },
    { id: 'history', label: 'ประวัติสต็อก', icon: <History size={20} /> },
    { id: 'users', label: 'ผู้ใช้งานระบบ', icon: <Users size={20} />, restricted: true },
    { id: 'logs', label: 'บันทึกกิจกรรม', icon: <ClipboardList size={20} /> }, 
    { id: 'profile', label: 'การตั้งค่า', icon: <User size={20} /> },
  ];

  const customerItems = [
    { id: 'home', label: 'หน้าแรก', icon: <Home size={20} />, path: '/' },
    { id: 'shop', label: 'สินค้าทั้งหมด', icon: <ShoppingBag size={20} />, path: '/shop' },
    { id: 'cart', label: 'ตะกร้าสินค้า', icon: <ShoppingCart size={20} />, path: '/cart', badge: cartItems.length }, 
    { id: 'wishlist', label: 'สินค้าที่ชอบ', icon: <Heart size={20} />, path: '/wishlist', badge: wishlistItems.length },
    { id: 'tracking', label: 'ติดตามสถานะ', icon: <Truck size={20} />, path: '/tracking' },
    { id: 'profile', label: 'บัญชีของฉัน', icon: <User size={20} />, path: '/profile' },
  ];

  let menuItems = isCustomer ? customerItems : adminItems;
  if (!isCustomer) {
      menuItems = menuItems.filter(item => !(item.restricted && role === 'seller'));
  }

  const handleMenuClick = (item) => {
      if (item.path) {
          navigate(item.path);
      } else {
          item.id === 'profile' ? navigate('/profile') : navigate(`/admin/dashboard?tab=${item.id}`);
      }
      if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const isActive = (item) => {
      if (item.path) return window.location.pathname === item.path;
      return currentTab === item.id;
  };

  return (
    <>
        {/* Backdrop for Mobile */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

        <aside className={`fixed top-0 md:top-4 left-0 md:left-4 h-full md:h-[calc(100vh-32px)] w-[280px] bg-[#1a4d2e] text-white shadow-2xl z-40 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] md:rounded-[2.5rem] flex flex-col overflow-hidden border border-white/10 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                        <Box size={20} />
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-tight leading-none">MY SHOP</h1>
                        <span className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase">Admin Panel</span>
                    </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronsLeft size={20} /></button>
            </div>

            {/* Profile Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center gap-3 hover:bg-white/15 transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
                <div className="w-12 h-12 rounded-xl bg-white/20 p-0.5 shadow-lg relative">
                     <img src={getUserAvatar(user?.avatar)} className="w-full h-full object-cover rounded-[10px]" alt="Avatar" onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}/>
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-[#1a4d2e] rounded-full"></div>
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold truncate text-sm">{user?.username || 'Guest'}</h3>
                    <p className="text-[10px] text-emerald-200 uppercase tracking-wider font-bold">{role || 'Visitor'}</p>
                </div>
            </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-2 py-2 custom-scrollbar relative z-10">
            {menuItems.map((item) => {
                const active = isActive(item);
                return (
                    <button key={item.id} onClick={() => handleMenuClick(item)} className={`group w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 relative ${active ? 'bg-white text-[#1a4d2e] shadow-lg shadow-black/10 font-bold scale-[1.02]' : 'text-emerald-100 hover:bg-white/10 hover:text-white'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`transition-all ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</div>
                            <span className="text-sm">{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${active ? 'bg-[#1a4d2e] text-white' : 'bg-red-500 text-white shadow-md'}`}>{item.badge}</span>
                        )}
                    </button>
                )
            })}
        </nav>

        {/* Footer */}
        <div className="p-4 relative z-10">
            <button onClick={handleLogout} className="w-full py-4 rounded-xl flex items-center justify-center gap-3 text-red-300 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/20 transition-all group">
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm">Sign Out</span>
            </button>
            <p className="text-center text-[10px] text-emerald-600/60 mt-4 font-mono">v2.1.0 • Stable</p>
        </div>
        </aside>
    </>
  );
};

export default AdminSidebar;