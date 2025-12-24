import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (product.stock <= 0) return;
    addToCart(product);
    Swal.fire({
        icon: 'success', title: 'เพิ่มลงตะกร้าแล้ว', toast: true, position: 'top-end', showConfirmButton: false, timer: 800, background: '#305949', color: '#fff', iconColor: '#fff'
    });
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Heart size={48} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#263A33] mb-2">รายการโปรดว่างเปล่า</h2>
        <p className="text-gray-500 mb-8">คุณยังไม่มีสินค้าที่ถูกใจ</p>
        <Link to="/shop" className="px-8 py-3 bg-[#305949] text-white rounded-xl font-bold hover:bg-[#234236] transition-all shadow-lg">
          เลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#263A33] mb-8 flex items-center gap-3">
          <Heart className="text-red-500 fill-red-500" /> สินค้าที่ถูกใจ ({wishlistItems.length})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative group hover:shadow-md transition-all">
              <Link to={`/product/${item.id}`} className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </Link>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-[#263A33] line-clamp-2 mb-1">{item.title}</h3>
                    <span className="text-lg font-black text-[#305949]">฿{item.price.toLocaleString()}</span>
                </div>
                
                <div className="flex gap-2 mt-3">
                    <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stock <= 0}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${item.stock > 0 ? 'bg-[#305949] text-white hover:bg-[#234236]' : 'bg-gray-200 text-gray-500'}`}
                    >
                        <ShoppingCart size={16}/> {item.stock > 0 ? 'ใส่ตะกร้า' : 'หมด'}
                    </button>
                    <button 
                        onClick={() => toggleWishlist(item)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WishlistPage;