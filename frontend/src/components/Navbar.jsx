import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Menu, X, ChevronDown, Sparkles, LayoutDashboard, Store, ClipboardList, ChevronsLeft, Search, Bell, BellOff, Truck, Tag, Ticket, Zap } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl, getUserAvatar } from '../utils/formatUtils';

// ✅ Reusable Tooltip Component
const NavTooltip = ({ text, children }) => (
    <div className="group/tooltip relative flex items-center">
        {children}
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-[1100] transform translate-y-2 group-hover/tooltip:translate-y-0">
            <div className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/50 whitespace-nowrap flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a4d2e] animate-pulse"></span>
                {text}
            </div>
             {/* Arrow */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 rotate-45 border-l border-t border-white/50"></div>
        </div>
    </div>
);



export default function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
  const { user, token, logout, loading } = useAuth();
  const { cartItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const API_BASE_URL = "http://localhost:8000"; // ✅ Defined at top

  // ✅ Smart Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const searchTimeoutRef = useRef(null);

  // ✅ Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // ✅ State for Real-time Flash Sale Check (Navbar)
  const [flashSaleItems, setFlashSaleItems] = useState({});

  useEffect(() => {


    // Fetch Active Flash Sales for Mini Cart Badge
    axios.get(`${API_BASE_URL}/api/flash-sales/active/`)
        .then(res => {
            const map = {};
            res.data.forEach(fs => {
                 fs.products.forEach(p => {
                     map[p.product] = { price: p.sale_price, end_time: fs.end_time };
                 });
            });
            setFlashSaleItems(map);
        })
        .catch(err => console.error("Error fetching active flash sales", err));
  }, []);

  const getEffectivePrice = (item) => {
      if (flashSaleItems[item.id || item.product_id]) {
          return flashSaleItems[item.id || item.product_id].price;
      }
      return item.price;
  };

  // ✅ Dynamic Notification Click Handler
  const handleNotificationClick = (noti) => {
      setShowNotifications(false); // Close dropdown

      // 1. Flash Sale -> Flash Sale Page
      if (noti.type === 'flash_sale') {
          navigate('/flash-sale');
      }
      // 2. Coupon -> Coupon Center
      else if (noti.type === 'promotion') {
          navigate('/coupons');
      }
      // 3. Order -> Order History (User) or Admin Orders (Admin)
      else if (noti.type === 'order' || noti.type === 'success' || noti.type === 'info') {
          if (isAdmin) {
              navigate('/admin/dashboard?tab=orders');
          } else {
              navigate('/order-history');
          }
      }
      // 4. Default -> Show Popup
      else {
           Swal.fire({
              title: `<h3 class="text-xl font-bold text-[#1a4d2e]">${noti.title}</h3>`,
              html: `<p class="text-gray-600">${noti.message}</p>`,
              icon: 'info',
              confirmButtonColor: '#1a4d2e',
              confirmButtonText: 'ตกลง'
          });
      }
  };

  // ✅ Close Menus when clicking outside
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (notificationRef.current && !notificationRef.current.contains(event.target)) {
              setShowNotifications(false);
          }

      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
           document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  // ✅ Real Notification Polling
  useEffect(() => {
      if (!user) {
          setNotifications([]);
          return;
      }

      const fetchNotifications = async () => {
          try {
              // 🕒 Check Last Cleared Timestamp
              const lastCleared = localStorage.getItem('notifications_cleared_at');
              const clearedTime = lastCleared ? new Date(lastCleared).getTime() : 0;

              // 1. Fetch Real Notifications with 'Since' Filter
              const res = await axios.get(`${API_BASE_URL}/api/notifications/`, {
                   headers: { Authorization: `Token ${token || localStorage.getItem('token')}` },
                   params: { since: lastCleared } // ✅ Send since param
              });
              let notifs = res.data || [];

              // ✅ Filter out old notifications based on timestamp
              // This is crucial because the backend generates notifications dynamically.
              if (clearedTime > 0) {
                  notifs = notifs.filter(n => {
                      let t = 0;
                      const timeRaw = n.timestamp || n.created_at;
                      
                      if (timeRaw) {
                           t = new Date(timeRaw).getTime();
                      } else if (n.time) {
                           // Fallback for old backend response "DD/MM HH:MM" (e.g. "27/01 13:00")
                           // This handles cases where backend hasn't updated yet to send 'timestamp'
                           try {
                               const [dPart, tPart] = n.time.split(' ');
                               const [day, month] = dPart.split('/');
                               const [hour, minute] = tPart.split(':');
                               const now = new Date();
                               t = new Date(now.getFullYear(), parseInt(month)-1, parseInt(day), parseInt(hour), parseInt(minute)).getTime();
                           } catch (e) { t = 0; }
                      }
                      
                      return t > clearedTime;
                  });
              }

              // 2. Check for Active Public Coupons
              try {
                  const couponsRes = await axios.get(`${API_BASE_URL}/api/coupons-public/`);
                  
                  const couponData = Array.isArray(couponsRes.data) ? couponsRes.data : [];
                  if (couponData.length > 0) {
                      const activeCoupons = couponData.filter(c => c.active);
                      
                      if (activeCoupons.length > 0) {
                          // ✅ Stable Notification Logic: Use stored timestamp to persist suppression
                          let alertTime = localStorage.getItem('coupon_alert_time');
                          const lastCount = parseInt(localStorage.getItem('coupon_last_count') || '0');
                          
                          // Detect Change in Coupons -> Update Time (Bring back notification)
                          if (activeCoupons.length !== lastCount) {
                              alertTime = new Date().toISOString();
                              localStorage.setItem('coupon_alert_time', alertTime);
                              localStorage.setItem('coupon_last_count', activeCoupons.length);
                          }
                          
                          // First Run Init
                          if (!alertTime) {
                              alertTime = new Date().toISOString();
                              localStorage.setItem('coupon_alert_time', alertTime);
                              localStorage.setItem('coupon_last_count', activeCoupons.length);
                          }

                          // Only show if Alert Time is NEWER than Clear Time
                          const alertTimestamp = new Date(alertTime).getTime();
                          if (alertTimestamp > clearedTime) {
                               const hasCouponNoti = notifs.some(n => n.id === 'coupon-alert');
                               if (!hasCouponNoti) {
                                   notifs.unshift({
                                       id: 'coupon-alert',
                                       title: '🎉 คูปองใหม่มาแล้ว!',
                                       message: `มีคูปองส่วนลด ${activeCoupons.length} ใบรอคุณอยู่ เก็บเลย!`,
                                       type: 'promotion', 
                                       is_read: false, 
                                       created_at: alertTime
                                   });
                               }
                          }
                      }
                  }
              } catch (e) { console.warn("Coupon fetch failed", e); }

              // 3. Check for Active Flash Sale
              try {
                  const flashRes = await axios.get(`${API_BASE_URL}/api/flash-sales/active/`);

                  if (Array.isArray(flashRes.data) && flashRes.data.length > 0) {
                       const activeFS = flashRes.data[0]; 
                       if (activeFS.is_active) {
                            const fsTime = new Date(activeFS.start_time).getTime();
                            // Only show if FS started AFTER last clear
                            if (fsTime > clearedTime) {
                                const hasFlashNoti = notifs.some(n => n.id === `flash-alert-${activeFS.id}`);
                                if (!hasFlashNoti) {
                                    notifs.unshift({
                                        id: `flash-alert-${activeFS.id}`,
                                        title: '⚡ Flash Sale เริ่มแล้ว!',
                                        message: `ลดกระหน่ำกับแคมเปญ "${activeFS.name}" ห้ามพลาด!`,
                                        type: 'flash_sale', 
                                        is_read: false,
                                        created_at: activeFS.start_time
                                    });
                                }
                            }
                       }
                  }
              } catch (e) {}

              setNotifications(notifs);
          } catch (error) {
              console.error("Failed to fetch notifications", error);
          }
      };

      fetchNotifications(); 
      const interval = setInterval(fetchNotifications, 60000); 

      return () => clearInterval(interval);
  }, [user, token]); 

  // ✅ Search Handler (Debounced)
  const handleSearch = (value) => {
      setSearchQuery(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      if (!value.trim()) {
          setSearchResults([]);
          return;
      }

      searchTimeoutRef.current = setTimeout(async () => {
          try {
              const res = await axios.get(`${API_BASE_URL}/api/products/?search=${value}`);
              if (res.data && res.data.results) {
                  setSearchResults(res.data.results.slice(0, 5)); 
              }
          } catch (error) {
              console.error("Search failed", error);
          }
      }, 300); 
  };

  // ✅ Rule 12: Admin/Seller Check
  const userRole = (user?.role || user?.role_code || '').toLowerCase();
  const isAdmin = ['admin', 'super_admin'].includes(userRole);
  const isRestricted = ['admin', 'super_admin', 'seller'].includes(userRole);
  const hasAdminPanelAccess = isAdmin || userRole === 'seller';

  // ✅ Rule 4: Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md fixed w-full z-[999] top-0 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 py-3 flex justify-between items-center relative gap-4">

        {/* ✅ Left Section: Logo & Category Toggle */}
        <div className={`flex items-center gap-6 relative z-[1002] transition-all duration-300 ${user ? 'md:ml-[80px]' : ''}`}>
            <Link 
                to="/" 
                className="flex items-center gap-2 group mr-2"
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
            >
                <div className="w-10 h-10 bg-[#1a4d2e] rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    <Sparkles size={20} className="group-hover:animate-pulse" />
                </div>
                <span className="text-2xl font-black text-[#1a4d2e] tracking-tighter uppercase hidden sm:block">Shop.</span>
            </Link>
        </div>

        {/* ✅ Middle Section: Smart Search */}
        <div className="hidden md:flex flex-1 max-w-2xl relative z-[1001] transition-all" ref={dropdownRef}> 
            <div className="relative w-full group">
                <input 
                    type="text" 
                    placeholder="ค้นหาสินค้า แบรนด์ หรือโปรโมชั่น..." 
                    className="w-full pl-12 pr-4 py-3 bg-[#F4F4F5] border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl text-sm font-medium transition-all duration-300 outline-none shadow-sm focus:bg-white focus:shadow-lg placeholder-gray-400 text-gray-700"
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                            setShowNotifications(false); // Close other dropdowns
                            setSearchResults([]); // Close suggestions
                        }
                    }}
                    onFocus={() => {
                        if (!searchQuery) {
                             axios.get(`${API_BASE_URL}/api/products/`).then(res => {
                                 if (res.data && res.data.results) setSearchResults(res.data.results.sort(() => 0.5 - Math.random()).slice(0, 4));
                             }).catch(console.error);
                        }
                    }}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                
                {(searchResults.length > 0) && (
                    <div onMouseDown={(e) => e.preventDefault()} className="absolute top-full left-0 w-full mt-3 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-300 flex flex-col md:flex-row min-h-[300px]">
                        <div className="w-full p-4">
                            <div className="flex justify-between items-center mb-3 px-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {searchQuery ? "ผลการค้นหา" : "แนะนำสำหรับคุณ"}
                                </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {searchResults.slice(0, 4).map((product) => (
                                    <Link to={`/product/${product.id}`} key={product.id} className="group/card flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1a4d2e]/20 transition-all cursor-pointer">
                                        <div className="h-24 w-full bg-white relative overflow-hidden flex items-center justify-center p-2">
                                            {product.thumbnail ? (
                                                <img src={API_BASE_URL + product.thumbnail} alt={product.title} className="w-full h-full object-contain group-hover/card:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs font-bold text-gray-300">No Image</div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover/card:text-[#1a4d2e] transition-colors">{product.title}</h4>
                                            <span className="text-xs font-bold text-[#1a4d2e]">฿{product.price.toLocaleString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* ✅ Right Section: Notifications, Cart, Profile */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          
          {/* ✅ Notification Center */}
          <div className="relative group/noti">
              <button className="relative p-2 rounded-full transition-all duration-300 text-gray-400 hover:text-[#1a4d2e] hover:bg-green-50 group-hover/noti:text-[#1a4d2e] group-hover/noti:bg-green-50">
                  <Bell size={22} className={notifications.length > 0 ? 'animate-swing' : ''} />
                  {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm">
                        {notifications.length > 99 ? '99+' : notifications.length}
                      </span>
                  )}
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden opacity-0 invisible group-hover/noti:opacity-100 group-hover/noti:visible transition-all duration-300 z-[1200] translate-y-2 group-hover/noti:translate-y-0">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
                      <h3 className="font-bold text-gray-800 text-sm">การแจ้งเตือน</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1a4d2e]/10 text-[#1a4d2e] rounded-full">{notifications.length} ใหม่</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                       {notifications.length > 0 ? (
                           notifications.map((noti) => (
                               <div 
                                   key={noti.id} 
                                   onClick={() => handleNotificationClick(noti)}
                                   className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer relative group/item"
                               >
                                   <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                                       {
                                           order: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
                                           alert: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
                                           success: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
                                           promo: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
                                           info: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                                       }[noti.type] || 'bg-gray-300'
                                   }`} />
                                   <div>
                                       <p className="text-xs font-bold text-gray-800 leading-tight mb-1 group-hover/item:text-[#1a4d2e] transition-colors">{noti.title}</p>
                                       <p className="text-[10px] text-gray-500 leading-relaxed max-w-[200px] truncate">{noti.message}</p>
                                       <p className="text-[9px] text-gray-400 mt-2 font-medium">{noti.time}</p>
                                   </div>
                               </div>
                           ))
                       ) : (
                           <div className="py-8 text-center text-gray-400">
                               <BellOff size={32} className="mx-auto text-gray-200 mb-2 opacity-50" />
                               <p className="text-xs font-medium">ไม่มีการแจ้งเตือนใหม่</p>
                            </div>
                       )}
                  </div>
                  <div className="p-2 border-t border-gray-50 bg-gray-50">
                      <button 
                        onClick={async () => {
                            setNotifications([]);
                            // ✅ Persist Clear Action
                            localStorage.setItem('notifications_cleared_at', new Date().toISOString());
                            localStorage.setItem('active_coupon_dismissed', 'true');
                            localStorage.setItem('seen_coupon_count', '9999'); 

                            try {
                                await axios.post(`${API_BASE_URL}/api/notifications/mark_all_read/`, {}, {
                                    headers: { Authorization: `Token ${token}` }
                                });
                            } catch(e) {}
                        }}
                        className="w-full py-2 text-[10px] font-bold text-gray-500 hover:text-[#1a4d2e] uppercase tracking-wider transition-colors"
                      >
                          ล้างการแจ้งเตือนทั้งหมด
                      </button>
                  </div>
              </div>
          </div>






          {/* ✅ Cart & Wishlist */}
          {!isRestricted && (
            <div className="relative group/cart border-r border-gray-100 pr-6 mr-2">
                <Link 
                    to={location.pathname === '/cart' ? '/' : '/cart'} 
                    className="relative block p-2.5 text-gray-400 hover:text-[#1a4d2e] hover:bg-green-50 rounded-2xl transition-all duration-300"
                >
                    <ShoppingCart size={22} className={cartItems.some(item => flashSaleItems[item.id]) ? "animate-pulse text-orange-500" : ""} />
                    {cartItems.length > 0 && (
                        <span className={`absolute top-1 right-1 w-5 h-5 ${cartItems.some(item => flashSaleItems[item.id]) ? 'bg-orange-500' : 'bg-[#1a4d2e]'} text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce`}>
                            {cartItems.length}
                        </span>
                    )}
                </Link>

                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden opacity-0 invisible group-hover/cart:opacity-100 group-hover/cart:visible transition-all duration-300 z-[1100] translate-y-2 group-hover/cart:translate-y-0">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ตะกร้าสินค้า ({cartItems.length})</span>
                        <span className="text-xs font-bold text-[#1a4d2e]">฿{cartItems.reduce((acc, item) => acc + (getEffectivePrice(item) * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {cartItems.length > 0 ? cartItems.slice(0, 5).map((item, idx) => {
                            const prodId = String(item.id || item.product_id);
                            const isFlashSale = !!flashSaleItems[prodId];
                            const price = getEffectivePrice(item);
                            
                            return (
                            <div key={idx} className={`flex gap-3 p-2.5 rounded-2xl transition-all duration-300 ${isFlashSale ? 'bg-orange-50 hover:bg-orange-100 hover:scale-[1.02] border border-orange-200/50 shadow-sm shadow-orange-100' : 'hover:bg-gray-50'}`}>
                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100 relative shadow-inner">
                                    {(item.thumbnail || item.image) ? (
                                        <img src={API_BASE_URL + (item.thumbnail || item.image)} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400 font-bold bg-gray-50">NO IMG</div>
                                    )}
                                    {isFlashSale && (
                                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-md animate-pulse">
                                            FLASH
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                    <h5 className="text-[11px] font-black text-gray-800 truncate flex items-center gap-1">
                                        {item.title}
                                        {isFlashSale && <Zap size={10} className="text-orange-500 fill-orange-500 animate-bounce" />}
                                    </h5>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-[10px] font-black ${isFlashSale ? 'text-orange-600' : 'text-gray-500'}`}>
                                            x{item.quantity} · ฿{price.toLocaleString()}
                                        </p>
                                        {isFlashSale && <span className="text-[8px] text-gray-400 line-through font-bold opacity-50">฿{item.price.toLocaleString()}</span>}
                                    </div>
                                </div>
                            </div>
                        )}) : (
                            <div className="py-8 text-center">
                                <ShoppingCart size={32} className="mx-auto text-gray-200 mb-2 opacity-50" />
                                <p className="text-xs text-gray-400">ยังไม่มีสินค้าในตะกร้า</p>
                            </div>
                        )}
                        {cartItems.length > 5 && <p className="text-[10px] text-center text-gray-400 pt-2">และอีก {cartItems.length - 5} รายการ...</p>}
                    </div>
                    
                    <div className="p-3 border-t border-gray-50 bg-gray-50">
                        <Link to="/cart" className="block w-full py-2.5 text-center text-xs font-bold text-white bg-[#1a4d2e] hover:bg-[#143d24] rounded-xl shadow-lg shadow-green-900/10 transition-all">
                            ดูตะกร้าสินค้า
                        </Link>
                    </div>
                </div>
            </div>
          )}


          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-3">
               
               {/* 1. Order History */}
               {!hasAdminPanelAccess && (
                 <NavTooltip text="ติดตามสถานะ">
                    <Link 
                        to={location.pathname === '/tracking' ? '/' : '/tracking'}
                        className="hidden md:flex p-2.5 text-gray-400 hover:text-[#1a4d2e] hover:bg-green-50 rounded-2xl transition-all duration-300"
                    >
                        <ClipboardList size={22} />
                    </Link>
                 </NavTooltip>
               )}

               {/* 2. Profile Link */}
               <div className="relative group/profile">
                    <Link 
                        to={location.pathname === '/profile' ? '/' : '/profile'}
                        className="flex items-center gap-3 pl-1.5 pr-2 py-1.5 rounded-full border border-gray-100 hover:border-[#1a4d2e]/30 hover:bg-white transition-all duration-300"
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 border border-gray-100 relative shadow-sm group-hover/profile:shadow-md transition-all">
                            <img
                            src={getUserAvatar(user.avatar)}
                            alt={user.username}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/profile:scale-110"
                            onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                            />
                        </div>
                        <div className="hidden lg:block text-left pr-2">
                            <p className="text-xs font-bold text-gray-800 leading-tight uppercase tracking-tighter">{user.username}</p>
                            <p className="text-[9px] text-[#1a4d2e] font-bold uppercase tracking-widest opacity-70">{user.role}</p>
                        </div>
                        <ChevronDown size={14} className="text-gray-300 group-hover/profile:text-[#1a4d2e] transition-colors" />
                    </Link>
                    
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 z-[1100] translate-y-2 group-hover/profile:translate-y-0">
                         <Link 
                             to={location.pathname === '/profile' ? '/' : '/profile'}
                             className="block p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50 to-white border-b border-gray-50 text-center hover:bg-gray-50 transition-colors group/header"
                         >
                             <div className="w-16 h-16 rounded-full bg-white p-1 mx-auto mb-2 shadow-sm border border-gray-100 group-hover/header:scale-105 transition-transform">
                                 <img src={getUserAvatar(user.avatar)} className="w-full h-full rounded-full object-cover" />
                             </div>
                             <h4 className="text-sm font-bold text-gray-800">{user.username}</h4>
                             <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1a4d2e] text-white rounded-full uppercase tracking-widest">{user.role}</span>
                         </Link>
                         
                         <div className="p-2 space-y-1">
                             {!isAdmin && (
                                 <>

                                    <Link to="/my-coupons" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:text-[#1a4d2e] hover:bg-green-50 rounded-xl transition-colors">
                                        <Tag size={16} /> คูปองของฉัน
                                    </Link>
                                    <Link to="/order-history" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:text-[#1a4d2e] hover:bg-green-50 rounded-xl transition-colors">
                                        <ClipboardList size={16} /> ประวัติการสั่งซื้อ
                                    </Link>
                                    <Link to="/tracking" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:text-[#1a4d2e] hover:bg-green-50 rounded-xl transition-colors">
                                        <Truck size={16} /> ติดตามสถานะ
                                    </Link>
                                 </>
                             )}
                             {hasAdminPanelAccess && (
                                 <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:text-[#1a4d2e] hover:bg-green-50 rounded-xl transition-colors">
                                     <LayoutDashboard size={16} /> แดชบอร์ดผู้ดูแล
                                 </Link>
                             )}
                         </div>

                         <div className="p-2 border-t border-gray-50">
                             <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-red-200 shadow-sm">
                                 <LogOut size={16} /> ออกจากระบบ
                             </button>
                         </div>
                    </div>
               </div>

            </div>
          ) : loading ? (
            // 🆕 Loading Skeleton - แสดงขณะกำลังโหลด
            <div className="flex gap-3 animate-pulse">
              <div className="w-20 h-10 bg-gray-200 rounded-2xl"></div>
              <div className="w-28 h-10 bg-gray-200 rounded-2xl"></div>
            </div>
          ) : (
            // แสดงปุ่ม Login/Register เมื่อไม่มี user และโหลดเสร็จแล้ว
            <div className="flex gap-4">
              <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-[#1a4d2e] transition-all">เข้าสู่ระบบ</Link>
              <Link to="/register" className="px-8 py-2.5 text-sm font-bold text-white bg-[#1a4d2e] hover:bg-[#143d24] rounded-2xl shadow-xl shadow-green-100 transition-all transform hover:-translate-y-1 active:scale-95">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>



      {/* Mobile Menu (Keep existing) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-6 px-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <Link to="/shop" className="block text-lg font-bold text-gray-800 px-4 py-2 hover:bg-gray-50 rounded-xl">สินค้าทั้งหมด</Link>
          {user && (
            <>
              <div className="h-px bg-gray-100 mx-4" />
              <Link to="/profile" className="block text-lg font-bold text-[#1a4d2e] px-4 py-2">โปรไฟล์ของฉัน</Link>
              {!isAdmin && <Link to="/cart" className="block text-lg font-bold text-gray-800 px-4 py-2">ตะกร้าสินค้า ({cartItems.length})</Link>}
              <button onClick={handleLogout} className="w-full text-left text-lg font-bold text-red-500 px-4 py-2">ออกจากระบบ</button>
            </>
          )}
          {!user && (
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link to="/login" className="text-center py-3 font-bold text-gray-600 bg-gray-100 rounded-2xl">LOGIN</Link>
              <Link to="/register" className="text-center py-3 font-bold text-white bg-[#1a4d2e] rounded-2xl shadow-lg">SIGN UP</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}