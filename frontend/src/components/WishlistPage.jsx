import React, { useEffect, useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, TrendingDown, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import Swal from 'sweetalert2';

const WishlistPage = () => {
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [filter, setFilter] = useState('all'); // all, price_drop, out_of_stock
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const handleRemove = async (productId, productName) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `ต้องการลบ "${productName}" ออกจากรายการโปรดหรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            const success = await removeFromWishlist(productId);
            if (success) {
                Swal.fire({
                    title: 'ลบเรียบร้อย!',
                    text: 'สินค้าถูกลบออกจากรายการโปรดแล้ว',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        }
    };

    const handleAddToCart = async (item) => {
        // 1. Add to Cart
        addToCart({
            id: item.product_id,
            title: item.product_title,
            price: item.current_price,
            thumbnail: item.product_image,
            stock: item.stock
        }, 1);
        
        // 2. Remove from Wishlist (Move behavior)
        await removeFromWishlist(item.product_id);

        // 3. Notify & Redirect
        Swal.fire({
            title: 'ย้ายลงตะกร้าแล้ว!',
            text: `ย้าย "${item.product_title}" ไปยังรถเข็นเรียบร้อย`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            // 4. Redirect to Cart Page ("เด้งไปหน้าช่องสินค้า")
            navigate('/cart'); 
        });
    };

    const filteredWishlist = wishlist.filter(item => {
        if (filter === 'price_drop') return item.price_dropped;
        if (filter === 'out_of_stock') return !item.in_stock;
        return true;
    });

    const priceDropCount = wishlist.filter(item => item.price_dropped).length;
    const outOfStockCount = wishlist.filter(item => !item.in_stock).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="text-red-500" size={32} fill="currentColor" />
                        <h1 className="text-3xl font-bold text-gray-800">รายการโปรด</h1>
                    </div>
                    <p className="text-gray-600">สินค้าที่คุณสนใจ ({wishlist.length} รายการ)</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            filter === 'all'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        ทั้งหมด ({wishlist.length})
                    </button>
                    <button
                        onClick={() => setFilter('price_drop')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            filter === 'price_drop'
                                ? 'bg-red-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <TrendingDown size={18} />
                        ลดราคา ({priceDropCount})
                    </button>
                    <button
                        onClick={() => setFilter('out_of_stock')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                            filter === 'out_of_stock'
                                ? 'bg-gray-500 text-white shadow-md'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                        <Package size={18} />
                        ของหมด ({outOfStockCount})
                    </button>
                </div>

                {/* Empty State */}
                {filteredWishlist.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            {filter === 'all' ? 'ยังไม่มีสินค้าในรายการโปรด' : 'ไม่พบสินค้าในหมวดนี้'}
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all' ? 'เริ่มต้นเพิ่มสินค้าที่คุณชอบกันเลย!' : 'ลองเปลี่ยนตัวกรองดูนะ'}
                        </p>
                        {filter === 'all' && (
                            <Link
                                to="/shop"
                                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                เลือกช็อปสินค้า
                            </Link>
                        )}
                    </div>
                )}

                {/* Wishlist Grid */}
                {filteredWishlist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWishlist.map(item => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                            >
                                {/* Price Drop Badge */}
                                {item.price_dropped && (
                                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                                        <TrendingDown size={16} />
                                        ลด {item.price_drop_percentage.toFixed(0)}%
                                    </div>
                                )}

                                {/* Out of Stock Badge */}
                                {!item.in_stock && (
                                    <div className="absolute top-3 right-3 z-10 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                        ของหมด
                                    </div>
                                )}

                                {/* Product Image */}
                                <Link to={`/product/${item.product_id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={item.product_image || '/placeholder.png'}
                                        alt={item.product_title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </Link>

                                {/* Product Info */}
                                <div className="p-4">
                                    <Link to={`/product/${item.product_id}`}>
                                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-orange-500 transition-colors">
                                            {item.product_title}
                                        </h3>
                                    </Link>

                                    {/* Price */}
                                    <div className="mb-3">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-orange-600">
                                                ฿{item.current_price}
                                            </span>
                                            {item.price_dropped && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ฿{item.initial_price}
                                                </span>
                                            )}
                                        </div>
                                        {item.in_stock && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                คงเหลือ {item.stock} ชิ้น
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!item.in_stock}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                                item.in_stock
                                                    ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            <ShoppingCart size={18} />
                                            {item.in_stock ? 'ใส่ตะกร้า' : 'สินค้าหมด'}
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.product_id, item.product_title)}
                                            className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
