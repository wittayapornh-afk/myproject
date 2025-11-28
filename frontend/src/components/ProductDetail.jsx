import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ (Status: ${res.status})`);
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setSelectedImage(data.thumbnail);
      })
      .catch(err => setError(err.message));
  }, [id]);

  const increaseQty = () => setQuantity(prev => prev + 1);
  const decreaseQty = () => { if (quantity > 1) setQuantity(prev => prev - 1); };
  
  const handleAddToCart = () => {
    if (product) addToCart(product, quantity);
  };

  // 💰 คำนวณราคารวมแบบ Real-time
  const totalPrice = product ? (product.price * quantity).toFixed(2) : 0;

  if (error) return <div className="text-center text-red-500 mt-10">เกิดข้อผิดพลาด: {error}</div>;
  if (!product) return <div className="text-center mt-10 text-gray-500 animate-pulse">⏳ กำลังโหลด...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary mb-6 transition font-medium">
        ← กลับหน้าหลัก
      </Link>

      <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="md:flex">
            
            {/* --- ส่วนแสดงรูปภาพ --- */}
            <div className="md:w-1/2 bg-[#FAFAF5] p-8 flex flex-col items-center justify-center">
                <img 
                    src={selectedImage || product.thumbnail} 
                    alt={product.title} 
                    className="max-h-[400px] w-auto object-contain drop-shadow-md transition-all duration-300" 
                />
                {product.images && product.images.length > 0 && (
                    <div className="mt-8 flex gap-3 overflow-x-auto pb-2 w-full justify-center">
                         <img 
                            src={product.thumbnail}
                            onClick={() => setSelectedImage(product.thumbnail)}
                            className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition ${selectedImage === product.thumbnail ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-gray-300'}`}
                        />
                        {product.images.map((img, idx) => (
                            <img 
                                key={idx} 
                                src={img} 
                                onClick={() => setSelectedImage(img)} 
                                className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition ${selectedImage === img ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-gray-300'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- ส่วนข้อมูลสินค้า (ด้านขวา) --- */}
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-card">
                <div className="uppercase tracking-wide text-sm text-primary font-bold mb-2">{product.category}</div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{product.title}</h1>
                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                
                {/* 👇 ส่วนแสดงราคาและยอดรวม (อัพเดตใหม่) */}
                <div className="mb-8 p-4 bg-[#F8FAFC] rounded-xl border border-gray-100">
                    {/* ราคาต่อชิ้น */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 font-medium">ราคาต่อชิ้น:</span>
                        <div className="flex items-center gap-3">
                             <span className="text-2xl font-bold text-gray-800">${product.price}</span>
                             {product.stock > 0 ? (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">มีของ</span>
                            ) : (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">หมด</span>
                            )}
                        </div>
                    </div>

                    {/* เส้นคั่น */}
                    <div className="border-b border-gray-200 my-2"></div>

                    {/* ยอดรวมสุทธิ (คำนวณตามจำนวน) */}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">ยอดรวม ({quantity} ชิ้น):</span>
                        <span className="text-3xl font-bold text-secondary">${totalPrice}</span>
                    </div>
                </div>

                {/* ปุ่มเพิ่ม/ลด และใส่ตะกร้า */}
                <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white shadow-sm">
                        <button onClick={decreaseQty} className="px-5 py-3 hover:bg-gray-100 text-gray-600 transition font-bold text-lg">-</button>
                        <span className="px-4 py-3 font-bold text-primary min-w-[50px] text-center text-lg">{quantity}</span>
                        <button onClick={increaseQty} className="px-5 py-3 hover:bg-gray-100 text-gray-600 transition font-bold text-lg">+</button>
                    </div>
                    
                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-secondary hover:bg-green-600 text-white py-3 px-6 rounded-full shadow-md hover:shadow-lg transition transform active:scale-95 font-bold flex justify-center items-center gap-2 text-lg"
                    >
                        🛒 ใส่ตะกร้า
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;