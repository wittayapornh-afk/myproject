import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ChevronsLeft, User, Home, ShoppingBag, ClipboardList, Heart, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // ✅ Import Cart Context
import { useWishlist } from '../context/WishlistContext'; // ✅ Import Wishlist Context
import { getImageUrl, getUserAvatar } from '../utils/formatUtils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { logout, user } = useAuth();
  const { cartItems } = useCart(); // ✅ Get Cart Count
  const { wishlistItems } = useWishlist(); // ✅ Get Wishlist Count
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  // ✅ Identify Role
  const userRole = (user?.role || user?.role_code || '').toLowerCase();
  const isCustomer = ['user', 'customer', 'new_user'].includes(userRole); // ✅ Added new_user

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#305949',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      background: '#fff',
      customClass: {
        title: 'font-black text-[#1a4d2e]',
        popup: 'rounded-3xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  // ✅ Menu for Admin/Seller
  const adminItems = [
    { id: 'dashboard', label: 'ภาพรวม (Dashboard)', icon: <LayoutDashboard size={22} /> },
    { id: 'products', label: 'จัดการสินค้า', icon: <Package size={22} /> },
    { id: 'orders', label: 'รายการคำสั่งซื้อ', icon: <ShoppingCart size={22} /> },
    { id: 'map', label: 'แผนที่ยอดขาย', icon: <div className="text-xl">🗺️</div> }, // ✅ New Map Menu
    { id: 'history', label: 'ประวัติสต็อก (History)', icon: <History size={22} /> }, // ✅ New Menu Item
    { id: 'users', label: 'ผู้ใช้งานระบบ', icon: <Users size={22} />, restricted: true },
    { id: 'profile', label: 'โปรไฟล์ส่วนตัว', icon: <User size={22} /> },
  ];

  // ✅ Menu for Customer
  const customerItems = [
    { id: 'home', label: 'หน้าแรก', icon: <Home size={22} />, path: '/' },
    { id: 'shop', label: 'สินค้าทั้งหมด', icon: <ShoppingBag size={22} />, path: '/shop' },
    { id: 'cart', label: 'ตะกร้าสินค้า', icon: <ShoppingCart size={22} />, path: '/cart', badge: cartItems.length }, // ✅ Add Badge
    { id: 'wishlist', label: 'สินค้าที่ชอบ', icon: <Heart size={22} />, path: '/wishlist', badge: wishlistItems.length }, // ✅ Add Badge
    { id: 'history', label: 'ประวัติการสั่งซื้อ', icon: <ClipboardList size={22} />, path: '/order-history' },
    { id: 'profile', label: 'โปรไฟล์ส่วนตัว', icon: <User size={22} />, path: '/profile' },
  ];

  // ✅ Select Items based on Role
  let menuItems = isCustomer ? customerItems : adminItems;

  // Filter restricted for admin/seller
  if (!isCustomer) {
      menuItems = menuItems.filter(item => {
        if (item.restricted && userRole === 'seller') return false;
        return true;
      });
  }

  const handleMenuClick = (item) => {
      if (isCustomer) {
          navigate(item.path);
      } else {
          if (item.id === 'profile') {
              navigate('/profile');
          } else {
              navigate(`/admin/dashboard?tab=${item.id}`);
          }
      }
      if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
      }
  };

  const checkActive = (item) => {
      if (isCustomer) {
          return window.location.pathname === item.path;
      } else {
          if (item.id === 'profile') return window.location.pathname === '/profile';
          return currentTab === item.id;
      }
  };

  return (
    <aside className={`fixed top-0 md:top-24 left-0 h-full w-72 bg-gradient-to-b from-[#1a4d2e] to-[#143d24] text-white shadow-2xl z-40 transition-transform duration-500 ease-out cubic-bezier(0.25, 1, 0.5, 1) ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Header */}
      {/* Header Profile Card (Premium Restore) */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
        
        {/* Profile Pill (Clickable) */}
        <button 
            onClick={() => navigate('/profile')}
            className="group flex-1 bg-white/5 hover:bg-white/10 p-2 pr-4 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
        >
            <div className="w-10 h-10 rounded-full bg-emerald-800 border-2 border-emerald-600 overflow-hidden shrink-0 relative shadow-sm group-hover:scale-105 transition-transform">
                <img 
                    src={getUserAvatar(user?.avatar)} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                />
            </div>
            
            <div className="text-left flex-1 min-w-0">
                <h3 className="text-sm font-black text-white truncate group-hover:text-emerald-300 transition-colors leading-tight">
                    {user?.username || 'Guest'}
                </h3>
                <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">
                    {userRole}
                </p>
            </div>
        </button>

        {/* Close Button */}
        <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 hover:bg-white/10 rounded-full text-emerald-200 hover:text-white transition-all transform hover:scale-110 active:scale-95 shrink-0">
            <ChevronsLeft size={20} />
        </button>
      </div>

      {/* Menu List */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-3 custom-scrollbar">
        {menuItems.map((item) => {
            const isActive = checkActive(item);
            return (
                <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`group w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                        isActive
                        ? 'bg-white text-[#1a4d2e] shadow-[0_20px_40px_rgba(0,0,0,0.2)] font-black scale-100'
                        : 'text-emerald-100 hover:bg-white/10 hover:text-white hover:translate-x-2'
                    }`}
                >
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#1a4d2e] rounded-r-full" />}
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                            {item.icon}
                        </div>
                        <span className="text-sm tracking-wide">{item.label}</span>
                    </div>

                    {/* ✅ Notification Badge */}
                    {item.badge > 0 && (
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full shadow-sm ${
                            isActive 
                            ? 'bg-[#1a4d2e] text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                            {item.badge}
                        </span>
                    )}

                    {!isActive && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                </button>
            );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-white/10 bg-[#113220]">
        <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-red-300 hover:text-white hover:bg-red-500 rounded-2xl transition-all duration-300 group shadow-lg shadow-black/20"
        >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">ออกจากระบบ</span>
        </button>
        <p className="text-center text-[10px] text-emerald-600/50 mt-4 font-mono">v2.0.5 • Build 2025</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;