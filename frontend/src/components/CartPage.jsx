import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

function CartPage() {
  const { cartItems, addToCart, decreaseItem, removeFromCart } = useCart();

  // คำนวณราคารวม
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-600">ตะกร้าของคุณว่างเปล่า 🛒</h2>
        <Link to="/" className="text-primary hover:underline mt-4 block">กลับไปเลือกสินค้า</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">ตะกร้าสินค้าของคุณ</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ฝั่งซ้าย: รายการสินค้า */}
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
              {/* รูปภาพ */}
              <img src={item.thumbnail} alt={item.title} className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
              
              {/* รายละเอียด */}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.category}</p>
                <div className="text-primary font-bold mt-1">${item.price}</div>
              </div>

              {/* ปุ่มเพิ่ม/ลด */}
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => decreaseItem(item.id)} className="px-3 py-1 hover:bg-gray-100 text-gray-600">-</button>
                <span className="px-3 py-1 font-medium text-gray-800 border-l border-r border-gray-300 min-w-[30px] text-center">
                  {item.quantity}
                </span>
                <button onClick={() => addToCart(item, 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-600">+</button>
              </div>

              {/* ปุ่มลบ */}
              <button 
                onClick={() => removeFromCart(item.id)} 
                className="text-red-400 hover:text-red-600 p-2 transition"
                title="ลบสินค้า"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* ฝั่งขวา: สรุปยอดเงิน */}
        <div className="lg:w-80">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold mb-4 text-gray-800">สรุปคำสั่งซื้อ</h3>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>จำนวนสินค้า</span>
              <span>{cartItems.reduce((sum, i) => sum + i.quantity, 0)} ชิ้น</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>ค่าจัดส่ง</span>
              <span className="text-green-600">ฟรี</span>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
              <span className="font-bold text-lg">ยอดรวมสุทธิ</span>
              <span className="font-bold text-2xl text-primary">${totalPrice.toFixed(2)}</span>
            </div>
            <Link to="/checkout">
    <button className="w-full bg-primary hover:bg-teal-800 text-white py-3 rounded-xl font-bold shadow-md transition transform active:scale-95">
      ชำระเงิน
    </button>
</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;