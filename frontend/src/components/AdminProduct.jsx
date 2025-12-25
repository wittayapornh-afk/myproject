import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios'; // สมมติว่าใช้ axios

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  // Mock Data (ใช้จริงให้ fetch จาก API)
  useEffect(() => {
    // axios.get('/api/products').then(...)
    setProducts([
      { id: 1, name: 'เสื้อยืด Vintage', category: 'เสื้อผ้า', price: 450, stock: 120, status: 'Active' },
      { id: 2, name: 'กางเกงยีนส์ Slim', category: 'กางเกง', price: 1200, stock: 95, status: 'Active' },
      { id: 3, name: 'เข็มขัดหนัง', category: 'Accessories', price: 500, stock: 2, status: 'Low Stock' },
    ]);
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || product.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6 bg-[#f4f4f0] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการสินค้าในคลัง</h1>
        <button className="bg-[#1a4d2e] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#143d24]">
          <Plus size={20} /> เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสินค้า..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e] bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">ทุกหมวดหมู่</option>
            <option value="เสื้อผ้า">เสื้อผ้า</option>
            <option value="กางเกง">กางเกง</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">รูปภาพ</th>
              <th className="px-6 py-3">ชื่อสินค้า</th>
              <th className="px-6 py-3">หมวดหมู่</th>
              <th className="px-6 py-3 text-right">ราคา</th>
              <th className="px-6 py-3 text-center">คงเหลือ</th>
              <th className="px-6 py-3 text-center">สถานะ</th>
              <th className="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-md"></div> {/* Placeholder Image */}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                <td className="px-6 py-4 text-right">฿{product.price.toLocaleString()}</td>
                <td className={`px-6 py-4 text-center font-bold ${product.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                  {product.stock}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">ไม่พบสินค้าที่ค้นหา</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}