import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft, ShieldCheck, Info, CheckSquare, Square, ShoppingCart, Zap } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios'; // ✅ Standard Import
import { formatPrice, getImageUrl } from '../utils/formatUtils';

import { useAuth } from '../context/AuthContext'; // ✅ Import useAuth

function CartPage() {
  const { user } = useAuth(); // ✅ Get user from AuthContext
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    selectedItems, 
    toggleSelection, 
    selectAll, 
    getSelectedTotal 
  } = useCart();
  
  const navigate = useNavigate();
  
  // ✅ Ref to hold latest cartItems for interval access
  const cartItemsRef = React.useRef(cartItems);
  React.useEffect(() => {
      cartItemsRef.current = cartItems;
  }, [cartItems]);

  // ✅ State for Real-time Flash Sale Check
  const [flashSaleItems, setFlashSaleItems] = React.useState({});

  React.useEffect(() => {
    // ✅ Use standard axios directly
    axios.get('http://localhost:8000/api/flash-sales/active/')
        .then(res => {
            const map = {};
            res.data.forEach(fs => {
                 // Map Flash Sale to Product ID
                 fs.products.forEach(p => {
                     map[p.product] = { price: p.sale_price, end_time: fs.end_time };
                 });
            });
            setFlashSaleItems(map);
        })
        .catch(err => console.error("Error fetching active flash sales", err));
  }, []);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire('ตะกร้าว่างเปล่า', 'กรุณาเพิ่มสินค้าลงตะกร้าก่อน', 'warning');
      return;
    }
    
    if (!selectedItems || selectedItems.length === 0) {
      Swal.fire('ยังไม่ได้เลือกสินค้า', 'กรุณาเลือกสินค้าที่ต้องการชำระเงินอย่างน้อย 1 รายการ', 'warning');
      return;
    }

    // 🔒 Login Gate: ต้องล็อกอินก่อนสั่งซื้อ
    if (!user) {
        Swal.fire({
            title: 'กรุณาเข้าสู่ระบบ',
            text: 'คุณต้องเข้าสู่ระบบสมาชิกก่อนดำเนินการสั่งซื้อ',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'เข้าสู่ระบบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#1a4d2e',
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/login');
            }
        });
        return;
    }

    navigate('/checkout');
  };

  const isAllSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;

  // ✅ Rule 10, 44, 64: ปรับปรุงหน้า Empty State ให้ดูเป็นมืออาชีพ
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center p-6 pt-24 font-sans">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-gray-200/50 border border-gray-50 animate-in fade-in zoom-in duration-500">
          <ShoppingBag size={56} className="text-gray-200" />
        </div>
        <h2 className="text-3xl font-black text-[#1a4d2e] mb-3 tracking-tight">ตะกร้าของคุณว่างเปล่า</h2>
        <p className="text-gray-400 mb-10 font-bold text-lg">มาเติมของลงตะกร้ากันเถอะ!</p>
        <Link to="/" className="group bg-[#1a4d2e] text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-green-900/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 text-lg">
          เลือกซื้อสินค้า <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black text-[#1a4d2e] mb-8 flex items-center gap-3">
          <ShoppingCart size={32} /> ตะกร้าสินค้า <span className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">{cartItems.length} รายการ</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Header / Select All */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <button onClick={selectAll} className="flex items-center gap-3 text-[#1a4d2e] font-bold hover:bg-green-50 px-3 py-2 rounded-xl transition-colors">
                    {isAllSelected ? <CheckSquare className="text-green-600" /> : <Square className="text-gray-300" />}
                    เลือกทั้งหมด
                </button>
                <span className="text-gray-400 text-sm font-bold">เลือกแล้ว {selectedItems.length} รายการ</span>
            </div>

            {cartItems.map((item, index) => {
               // ✅ Convert ID to string for robust matching with map keys
               const prodId = String(item.id || item.product_id);
               const isFlashSale = !!flashSaleItems[prodId];
               const currentPrice = getEffectivePrice(item, flashSaleItems);
               
               return (
              <div key={item.id ? item.id : `cart-item-${index}`} className={`p-5 rounded-[2.5rem] shadow-sm flex gap-5 transition-all hover:shadow-xl group relative overflow-hidden ${
                  isFlashSale 
                  ? "bg-gradient-to-br from-orange-50 via-white to-red-50/30 border-2 border-orange-400 shadow-orange-200/50 ring-8 ring-orange-500/5" 
                  : "bg-white border border-gray-100"
              }`}>
                
                {/* ⚡ High-Impact Flash Sale Badge */}
                {isFlashSale && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-red-600 via-orange-500 to-orange-400 text-white text-[11px] font-black px-6 py-2 rounded-bl-[2rem] shadow-lg z-[20] flex items-center gap-2 animate-pulse">
                        <Zap size={14} fill="white" className="drop-shadow-sm" /> 
                        <span className="tracking-tighter">FLASH SALE เที่ยงคืนนี้!</span>
                    </div>
                )}

                {/* Checkbox */}
                <div className="flex items-center pl-2">
                    <button onClick={() => toggleSelection(item.id)} className="text-[#1a4d2e] hover:scale-110 transition-transform">
                        {selectedItems.includes(item.id) ? <CheckSquare className="text-green-600" size={24} /> : <Square className="text-gray-300" size={24} />}
                    </button>
                </div>

                {/* Image */}
                <div className="w-24 h-24 bg-white rounded-2xl flex-shrink-0 p-2 relative shadow-inner">
                  <img 
                    src={getImageUrl(item.thumbnail)} 
                    alt={item.title} 
                    className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105 duration-500" 
                  />
                  {isFlashSale && (
                      <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm border-2 border-white transform rotate-3">
                          -{Math.round(((item.price - currentPrice) / item.price) * 100)}%
                      </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col gap-1">
                          {(item.id || item.product_id) ? (
                              <Link to={`/product/${item.id || item.product_id}`} className="font-bold text-[#263A33] line-clamp-1 text-lg group-hover:text-[#1a4d2e] transition-colors">
                                  {item.title}
                              </Link>
                          ) : (
                              <span className="font-bold text-[#263A33] line-clamp-1 text-lg">{item.title}</span>
                          )}
                          
                          {/* Flash Sale Timer / Label */}
                          {isFlashSale && (
                              <span className="text-[11px] text-orange-600 font-bold flex items-center gap-1 bg-orange-100/50 px-2 py-0.5 rounded-md w-fit border border-orange-100">
                                  <Zap size={12} className="fill-orange-500" /> 🔥 Limited Time Offer!
                              </span>
                          )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 font-bold">{item.brand}</p>
                  </div>
                  
                    <div className="flex items-end justify-between mt-2">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 main-shadow">
                      <button 
                         type="button"
                         onMouseDown={() => {
                            // Initial action
                            updateQuantity(item.id, Math.max(1, item.quantity - 1));
                            
                            const interval = setInterval(() => {
                                const currentList = cartItemsRef.current || [];
                                const currentItem = currentList.find(i => (i.id || i.product_id) === (item.id || item.product_id));
                                if (currentItem && currentItem.quantity > 1) {
                                    updateQuantity(currentItem.id, currentItem.quantity - 1);
                                }
                            }, 100);
                            
                            const cleanup = () => {
                                clearInterval(interval);
                                document.removeEventListener('mouseup', cleanup);
                                document.removeEventListener('mouseleave', cleanup);
                            };
                            document.addEventListener('mouseup', cleanup);
                            document.addEventListener('mouseleave', cleanup);
                        }}
                        className="p-2 hover:bg-white rounded-lg shadow-sm text-gray-600 hover:text-[#1a4d2e] transition-all disabled:opacity-30 touch-manipulation active:scale-90"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>
                      <span className="w-8 text-center font-black text-[#263A33] text-sm">{item.quantity}</span>
                      <button 
                        type="button"
                        onMouseDown={() => {
                            // Initial action
                            updateQuantity(item.id, item.quantity + 1);
                            
                            const interval = setInterval(() => {
                                const currentList = cartItemsRef.current || [];
                                const currentItem = currentList.find(i => (i.id || i.product_id) === (item.id || item.product_id));
                                if (currentItem) {
                                    updateQuantity(currentItem.id, currentItem.quantity + 1);
                                }
                            }, 100);
                            
                            const cleanup = () => {
                                clearInterval(interval);
                                document.removeEventListener('mouseup', cleanup);
                                document.removeEventListener('mouseleave', cleanup);
                            };
                            document.addEventListener('mouseup', cleanup);
                            document.addEventListener('mouseleave', cleanup);
                        }}
                        className="p-2 hover:bg-white rounded-lg shadow-sm text-gray-600 hover:text-[#1a4d2e] transition-all touch-manipulation active:scale-90"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        {isFlashSale && (
                             <p className="text-xs text-gray-400 line-through font-bold mb-0.5">
                                  {formatPrice(item.price * item.quantity)}
                             </p>
                        )}
                        <p className={`font-black text-xl ${isFlashSale ? 'text-red-600 drop-shadow-sm' : 'text-[#1a4d2e]'}`}>
                            {formatPrice(currentPrice * item.quantity)}
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 sticky top-28">
              <h2 className="text-2xl font-black text-[#263A33] mb-8">สรุปคำสั่งซื้อ</h2>
              
              <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
                <div className="flex justify-between font-bold text-gray-400 uppercase text-xs tracking-widest">
                  <span>ยอดรวม ({selectedItems.length} รายการ)</span>
                  <span className="text-gray-600">{formatPrice(getSelectedTotal())}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-400 uppercase text-xs tracking-widest">
                  <span>ค่าจัดส่ง</span>
                  <span className="text-green-600">ฟรี</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="font-black text-[#263A33] text-lg">ยอดสุทธิ</span>
                <span className="font-black text-4xl text-[#1a4d2e] tracking-tight">{formatPrice(getSelectedTotal())}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full bg-[#1a4d2e] text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
              >
                ดำเนินการสั่งซื้อ <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </button>

              <div className="mt-6 flex items-start gap-3 bg-green-50 p-4 rounded-2xl">
                <ShieldCheck className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-xs text-green-800 font-bold leading-relaxed">
                  มั่นใจได้! สินค้าทุกชิ้นรับประกันของแท้ 100% พร้อมบริการคืนสินค้าภายใน 14 วัน
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Helper for effective price (Now truly effective with Flash Sale check)
const getEffectivePrice = (item, flashSaleMap) => {
    if (flashSaleMap && flashSaleMap[item.id || item.product_id]) {
        return flashSaleMap[item.id || item.product_id].price;
    }
    return item.price;
};

export default CartPage;