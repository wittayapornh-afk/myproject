import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ChevronsLeft, User, Home, ShoppingBag, ClipboardList, Heart, History, Box, Truck, BarChart2, Bell, Tag, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
import { getImageUrl, getUserAvatar } from '../utils/formatUtils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { logout, user } = useAuth();
  const { cartItems } = useCart(); 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const role = (user?.role || user?.role_code || '').toLowerCase();
  const isCustomer = ['user', 'customer', 'new_user'].includes(role);
  const sidebarRef = React.useRef(null);

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

  // ✅ Menu Groups Structure
  const adminGroups = [
    {
      title: "เมนูหลัก",
      items: [
        { id: 'dashboard', label: 'ภาพรวม', icon: <LayoutDashboard size={20} /> },
        { id: 'orders', label: 'คำสั่งซื้อ', icon: <ShoppingCart size={20} /> },
        { id: 'products', label: 'จัดการสินค้า', icon: <Package size={20} /> },
      ]
    },
    {
      title: "ทั่วไป",
      items: [
        { id: 'flash-sales', label: 'Flash Sale', icon: <Zap size={20} />, path: '/admin/flash-sales' }, 
        { id: 'coupons', label: 'คูปองส่วนลด', icon: <Tag size={20} />, path: '/admin/coupons' },
        { id: 'tags', label: 'จัดการ Tags', icon: <Tag size={20} />, path: '/admin/tags' }, // 🏷️ เพิ่มเมนู Tags
        { id: 'history', label: 'ประวัติสต็อก', icon: <History size={20} /> },
      ]
    },
    {
      title: "บัญชีผู้ใช้",
      items: [
        { id: 'users', label: 'ผู้ใช้งานระบบ', icon: <Users size={20} />, restricted: true },
        { id: 'logs', label: 'บันทึกกิจกรรม', icon: <ClipboardList size={20} /> }, 
        { id: 'profile', label: 'การตั้งค่า', icon: <User size={20} /> },
      ]
    }
  ];

  const customerItems = [
    { id: 'home', label: 'หน้าแรก', icon: <Home size={20} />, path: '/' },
    { id: 'shop', label: 'สินค้าทั้งหมด', icon: <ShoppingBag size={20} />, path: '/shop' },
    { id: 'cart', label: 'ตะกร้าสินค้า', icon: <ShoppingCart size={20} />, path: '/cart', badge: cartItems.length }, 
    { id: 'profile', label: 'บัญชีของฉัน', icon: <User size={20} />, path: '/profile' },
  ];

  const handleMenuClick = (item) => {
      if (item.path) {
          // ✅ Toggle Logic: If already on the page, go Home. Else go to page.
          window.location.pathname === item.path ? navigate('/') : navigate(item.path);
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
      {/* 🌑 Overlay for Mobile */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[80] md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

       {/* ✅ Sidebar Container */}
       {/* Width Logic: md:w-[300px] to match reference spaciousness */}
      <aside 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white/80 backdrop-blur-md text-[#263A33] shadow-[0_0_40px_rgba(0,0,0,0.05)] z-[1001] transition-all duration-300 ease-in-out flex flex-col overflow-hidden border-r border-gray-100/50
        ${isSidebarOpen ? 'w-[300px] translate-x-0' : '-translate-x-full md:translate-x-0 md:w-[84px]'}
        `}
      >
        
        {/* HEADER AREA: "Menu" */}
        <div className="pt-8 px-8 pb-6 flex items-center justify-between">
             {/* Title on Left */}
             {/* Brand Logo - Click to Home */}
             <Link to="/" className={`flex items-center gap-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden pointer-events-none'}`}>
                 <div className="w-8 h-8 bg-[#1a4d2e] rounded-lg flex items-center justify-center text-white shadow-sm">
                     <Sparkles size={16} />
                 </div>
                 <span className="text-xl font-black text-[#1a4d2e] tracking-tighter uppercase">Shop.</span>
             </Link>
             
             {/* Action Icons (Right) */}
             <div className="flex items-center gap-4">
                 {/* 🔽 Removed User/Cart icons from here as requested */}
                 
                 {/* Toggle Button (X or Menu) */}
                 <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className="w-8 h-8 rounded-full hover:bg-gray-100 text-[#263A33] flex items-center justify-center transition-colors"
                 >
                    {isSidebarOpen ? <ChevronsLeft size={24} /> : <ChevronsLeft size={24} className="rotate-180" />}
                 </button>
             </div>
        </div>

        {/* Restore Toggle Button for Mini Mode (If closed on desktop) */}
        {!isSidebarOpen && (
             <div className="flex justify-center mb-6">
                 {/* Mini Logo or Placeholder */}
                 <div className="w-10 h-10 bg-[#1a4d2e] rounded-xl flex items-center justify-center text-white font-bold">A</div>
             </div>
        )}

        {/* MENU SCROLL AREA */}
        <div className="flex-1 overflow-y-auto px-6 space-y-8 custom-scrollbar pb-10">
            {isCustomer ? (
                <div className="space-y-1">
                    <h3 className={`text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>EXPLORE</h3>
                    {customerItems.map((item) => (
                        <MenuItem key={item.id} item={item} isActive={isActive(item)} onClick={() => handleMenuClick(item)} isSidebarOpen={isSidebarOpen} />
                    ))}
                </div>
            ) : (
                adminGroups.map((group, idx) => (
                    <div key={idx} className="flex flex-col">
                        {/* Title: Hide in Mini */}
                        <h3 className={`text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{group.title}</h3>
                        
                        <div className="space-y-1">
                            {group.items.filter(item => !(item.restricted && role === 'seller')).map((item) => (
                                <MenuItem key={item.id} item={item} isActive={isActive(item)} onClick={() => handleMenuClick(item)} isSidebarOpen={isSidebarOpen} />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* BOTTOM PROFILE (Optional, or removed since we have User icon up top? Keeping for completeness but minimal) */}
        {isSidebarOpen && (
             <div className="p-6 border-t border-gray-100">
                <button 
                    onClick={() => {
                        // Toggle: If on Profile, go Home. Else go Profile.
                        window.location.pathname === '/profile' ? navigate('/') : navigate('/profile');
                    }}
                    className="flex items-center gap-3 w-full text-left group hover:bg-gray-50 p-2 rounded-xl transition-all"
                >
                    <img 
                        src={getUserAvatar(user)} 
                        onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=User&background=random'} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full object-cover border border-gray-100 group-hover:border-[#1a4d2e] transition-colors" 
                    />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-[#263A33] truncate group-hover:text-[#1a4d2e] transition-colors">{user?.first_name || user?.username || 'Guest'}</h4>
                        <p className="text-xs text-gray-400 capitalize">{role}</p>
                    </div>
                </button>
            </div>
        )}

      </aside>
    </>
  );
};

// Helper Component for Menu Item (Updated for Minimal Theme)
// Style: Text Left, Chevron Right
const MenuItem = ({ item, isActive, onClick, isSidebarOpen }) => {
    // Icons: Lucide icons can be passed directly, usually strokeWidth 2 is good for this theme
    return (
    <button 
        onClick={onClick}
        className={`flex items-center justify-between w-full py-3 px-2 rounded-xl transition-all duration-200 group
        ${isActive 
            ? 'text-[#1a4d2e] font-bold bg-green-50/50' 
            : 'text-[#263A33] font-medium hover:bg-gray-50'
        }`}
    >
        <div className="flex items-center gap-4 overflow-hidden">
             {/* Icon */}
             <div className={`shrink-0 transition-colors ${isActive ? 'text-[#1a4d2e]' : 'text-gray-800'}`}>
                 {item.icon}
             </div>
             
             {/* Label */}
             <span className={`text-base tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                 {item.label}
             </span>
        </div>
        
        {/* Right Arrow (Only when open and active/hover) */}
        {isSidebarOpen && (
            <div className="flex items-center">
                 {item.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-2">{item.badge}</span>}
                 {/* Chevron always visible for the aesthetic in reference? Or just on hover? Reference shows arrows. */}
                 <ChevronsLeft size={16} className={`rotate-180 text-gray-300 group-hover:text-[#1a4d2e] transition-colors ${isActive ? 'text-[#1a4d2e]' : ''}`} />
            </div>
        )}
    </button>
)};

export default AdminSidebar;