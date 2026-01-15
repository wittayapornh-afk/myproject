import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    Search, Plus, Edit, Trash2, Image as ImageIcon, 
    ChevronLeft, ChevronRight, Filter, ArrowUpDown, 
    MoreVertical, Package, DollarSign, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';

export default function ProductListAdmin() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['ทั้งหมด']);
    const [loading, setLoading] = useState(true);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Reduce slightly for card-like feel

    // --- Advanced Filter State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');
    const [stockFilter, setStockFilter] = useState('all'); // all, in_stock, low_stock, out_of_stock
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortOrder, setSortOrder] = useState('newest'); // newest, price_asc, price_desc, name_asc

    useEffect(() => {
        fetchAllProducts();
        fetchCategories();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, stockFilter, priceRange, sortOrder]);

    const fetchAllProducts = async () => {
        setLoading(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/admin/all_products/`, {
                headers: { Authorization: `Token ${activeToken}` }
            });
            if (Array.isArray(response.data)) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error("Error:", error);
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/categories/`);
            if (res.data.categories) setCategories(res.data.categories);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบสินค้า?',
            text: "คุณจะไม่สามารถกู้คืนสินค้านี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบสินค้าเลย!',
            cancelButtonText: 'ยกเลิก',
            background: '#fff',
            borderRadius: '20px',
            customClass: {
                popup: 'rounded-[2rem]',
                confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
                cancelButton: 'rounded-xl px-6 py-2.5 font-bold'
            }
        });

        if (result.isConfirmed) {
            try {
                const activeToken = token || localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/delete_product/${id}/`, {
                    headers: { Authorization: `Token ${activeToken}` }
                });

                await Swal.fire({
                    title: 'ลบสำเร็จ!',
                    text: 'สินค้าถูกลบออกจากระบบแล้ว',
                    icon: 'success',
                    confirmButtonColor: '#1a4d2e',
                    customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl' }
                });
                fetchAllProducts();
            } catch (e) {
                console.error(e);
                Swal.fire({
                     icon: 'error',
                     title: 'เกิดข้อผิดพลาด',
                     text: 'รบกวนลองใหม่อีกครั้ง',
                     customClass: { popup: 'rounded-[2rem]' }
                });
            }
        }
    };

    // --- Filter & Sort Logic ---
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // 1. Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => 
                (p.title || p.name || '').toLowerCase().includes(lowerTerm)
            );
        }

        // 2. Category
        if (categoryFilter !== 'ทั้งหมด') {
            result = result.filter(p => p.category === categoryFilter);
        }

        // 3. Stock Status
        if (stockFilter !== 'all') {
            if (stockFilter === 'out_of_stock') {
                result = result.filter(p => p.stock === 0);
            } else if (stockFilter === 'low_stock') {
                result = result.filter(p => p.stock > 0 && p.stock < 10);
            } else if (stockFilter === 'in_stock') {
                result = result.filter(p => p.stock >= 10);
            }
        }

        // 4. Price Range
        if (priceRange.min !== '') {
            result = result.filter(p => Number(p.price) >= Number(priceRange.min));
        }
        if (priceRange.max !== '') {
            result = result.filter(p => Number(p.price) <= Number(priceRange.max));
        }

        // 5. Sorting
        result.sort((a, b) => {
            if (sortOrder === 'price_asc') return Number(a.price) - Number(b.price);
            if (sortOrder === 'price_desc') return Number(b.price) - Number(a.price);
            if (sortOrder === 'name_asc') return (a.title || a.name).localeCompare(b.title || b.name);
            // Default newest (id desc assumption)
            return b.id - a.id; 
        });

        return result;
    }, [products, searchTerm, categoryFilter, stockFilter, priceRange, sortOrder]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'สินค้าหมด', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' };
        if (stock < 10) return { label: 'ใกล้หมด', color: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' };
        return { label: 'พร้อมขาย', color: 'bg-green-100 text-green-600', dot: 'bg-green-500' };
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            
            {/* Header / Stats (Optional simple stats strip) */}
            <div className="flex flex-wrap gap-4">
                 <div className="bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[200px]">
                     <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-[#1a4d2e]">
                         <Package size={24} />
                     </div>
                     <div>
                         <p className="text-xs text-gray-500 font-bold uppercase">สินค้าทั้งหมด</p>
                         <h3 className="text-2xl font-black text-gray-800">{products.length}</h3>
                     </div>
                 </div>
                 <div className="bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[200px]">
                     <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                         <AlertTriangle size={24} />
                     </div>
                     <div>
                         <p className="text-xs text-gray-500 font-bold uppercase">สินค้าหมด</p>
                         <h3 className="text-2xl font-black text-gray-800">{products.filter(p => p.stock === 0).length}</h3>
                     </div>
                 </div>
            </div>

            {/* Advanced Filters Toolbar */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col xl:flex-row gap-4 justify-between">
                    
                    {/* Search & Category */}
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#1a4d2e] transition-colors" size={20}/>
                            <input 
                                type="text" 
                                placeholder="ค้นหาชื่อสินค้า..." 
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-sm"
                                value={searchTerm} 
                                onChange={e=>setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="relative min-w-[180px]">
                             <select 
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 appearance-none cursor-pointer font-bold text-sm text-gray-700"
                                value={categoryFilter} 
                                onChange={e=>setCategoryFilter(e.target.value)}
                             >
                                <option value="ทั้งหมด">หมวดหมู่ทั้งหมด</option>
                                {categories.map((c,i)=><option key={i} value={c}>{c}</option>)}
                             </select>
                             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={() => navigate('/admin/product/add')} 
                        className="bg-[#1a4d2e] text-white px-8 py-3 rounded-2xl flex gap-2 items-center justify-center hover:bg-[#143d24] shadow-lg shadow-green-900/20 active:scale-95 transition-all font-bold text-sm whitespace-nowrap"
                    >
                        <Plus size={20}/> เพิ่มสินค้าใหม่
                    </button>
                </div>

                {/* Secondary Filters (Stock, Price, Sort) */}
                <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-gray-100">
                     <div className="flex flex-wrap items-center gap-2 flex-1">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-2 flex items-center gap-1"><Filter size={14}/> ตัวกรอง:</span>
                        
                        <select 
                            value={stockFilter} 
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="bg-gray-50 text-xs font-bold text-gray-700 py-2 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#1a4d2e] cursor-pointer"
                        >
                            <option value="all">สต็อกทั้งหมด</option>
                            <option value="in_stock">✅ พร้อมขาย</option>
                            <option value="low_stock">⚠️ ใกล้หมด (&lt;10)</option>
                            <option value="out_of_stock">❌ สินค้าหมด</option>
                        </select>

                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                             <span className="text-gray-400"><DollarSign size={14}/></span>
                             <input 
                                type="number" 
                                placeholder="Min" 
                                className="w-16 bg-transparent text-xs font-bold outline-none"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                             />
                             <span className="text-gray-300">-</span>
                             <input 
                                type="number" 
                                placeholder="Max" 
                                className="w-16 bg-transparent text-xs font-bold outline-none"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                             />
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase mr-2 flex items-center gap-1"><ArrowUpDown size={14}/> เรียงตาม:</span>
                        <select 
                            value={sortOrder} 
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-white text-xs font-bold text-gray-700 py-2 px-4 rounded-xl border border-gray-200 outline-none focus:border-[#1a4d2e] cursor-pointer"
                        >
                            <option value="newest">📅 มาใหม่ล่าสุด</option>
                            <option value="price_asc">💰 ราคา: ต่ำ ➜ สูง</option>
                            <option value="price_desc">💰 ราคา: สูง ➜ ต่ำ</option>
                            <option value="name_asc">abc ชื่อสินค้า (A-Z)</option>
                        </select>
                     </div>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 relative min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8fafc] text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
                                <th className="p-6 pl-8 w-24 rounded-tl-[2.5rem]">รูปภาพ</th>
                                <th className="p-6">รายละเอียดสินค้า</th>
                                <th className="p-6">หมวดหมู่</th>
                                <th className="p-6 text-right">ราคา</th>
                                <th className="p-6 text-center">สถานะสต็อก</th>
                                <th className="p-6 text-center rounded-tr-[2.5rem] w-32">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-6"><div className="w-12 h-12 bg-gray-100 rounded-xl"></div></td>
                                        <td className="p-6"><div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-100 rounded w-1/2"></div></td>
                                        <td colSpan="4"></td>
                                    </tr>
                                ))
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-50">
                                            <Package size={64} className="text-gray-300 mb-4"/>
                                            <p className="font-bold text-gray-500">ไม่พบสินค้าที่คุณค้นหา</p>
                                            <button onClick={() => { setSearchTerm(''); setCategoryFilter('ทั้งหมด'); setStockFilter('all'); }} className="mt-4 text-[#1a4d2e] text-xs font-bold underline">
                                                ล้างตัวกรองทั้งหมด
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(p => {
                                    const stockStatus = getStockStatus(p.stock);
                                    return (
                                        <tr key={p.id} className="group hover:bg-[#f0fdf4] transition-colors duration-200">
                                            <td className="p-4 pl-8">
                                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-all bg-white">
                                                    {p.thumbnail ? (
                                                        <img src={p.thumbnail.startsWith('http') ? p.thumbnail : `${API_BASE_URL}${p.thumbnail}`} className="w-full h-full object-cover" alt={p.title}/> 
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><ImageIcon size={24}/></div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-[#1a4d2e] transition-colors">{p.title || p.name}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold">Code: {p.id}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-block px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-bold border border-gray-100 group-hover:bg-white group-hover:border-green-100 group-hover:text-green-700 transition-colors">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="font-black text-gray-800 text-sm">฿{Number(p.price).toLocaleString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center">
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${stockStatus.color.replace('text-', 'border-').replace('100', '100')} ${stockStatus.color} shadow-sm w-fit`}>
                                                        <div className={`w-2 h-2 rounded-full ${stockStatus.dot} animate-pulse`}></div>
                                                        <span className="text-[10px] font-bold">{stockStatus.label} ({p.stock})</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={()=>navigate(`/admin/product/edit/${p.id}`)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-[#1a4d2e] hover:text-white transition-all shadow-sm" title="แก้ไข">
                                                        <Edit size={16}/>
                                                    </button>
                                                    <button onClick={()=>handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="ลบ">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Footer / Pagination */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-50 bg-[#fcfcfc]">
                        <div className="text-xs font-bold text-gray-400 mb-4 md:mb-0">
                            แสดง {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} จาก {filteredProducts.length} รายการ
                        </div>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                            <button 
                                onClick={() => setCurrentPage(c => Math.max(1, c - 1))} 
                                disabled={currentPage === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft size={18}/>
                            </button>
                            
                            {/* Simple Page Numbers */}
                            <div className="flex gap-1 px-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show pages around current page could be complex, keeping simple for now
                                    let p = i + 1;
                                    if (totalPages > 5 && currentPage > 3) {
                                        p = currentPage - 2 + i;
                                        if (p > totalPages) p = totalPages - (4 - i);
                                    }
                                    return (
                                        <button 
                                            key={p} 
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                                currentPage === p 
                                                ? 'bg-[#1a4d2e] text-white shadow-md shadow-green-900/20' 
                                                : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} 
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight size={18}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}