import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'; // Removing unused icons
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // ✅ Import Swal
export default function ProductListAdmin() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['ทั้งหมด']);
  const [loading, setLoading] = useState(true);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const activeToken = token || localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:8000/api/admin/all_products/', {
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
        const res = await axios.get('http://localhost:8000/api/categories/');
        if(res.data.categories) setCategories(res.data.categories);
    } catch (e) { console.error(e); }
  };

  // --- Handlers ---
  const handleAddClick = () => {
    navigate('/admin/product/add');
  };

  const handleEditClick = (product) => {
    navigate(`/admin/product/edit/${product.id}`);
  };

  const handleDelete = async (id) => {
    // ✅ Use SweetAlert2 for Confirmation
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
        borderRadius: '20px'
    });

    if (result.isConfirmed) {
        try {
            const activeToken = token || localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/delete_product/${id}/`, {
                headers: { Authorization: `Token ${activeToken}` }
            });
            
            await Swal.fire({
                title: 'ลบสำเร็จ!',
                text: 'สินค้าถูกลบออกจากระบบแล้ว',
                icon: 'success',
                confirmButtonColor: '#1a4d2e'
            });
            fetchAllProducts();
        } catch(e) { 
            console.error(e);
            if (e.response && e.response.status === 401) {
                logout();
            } else {
                Swal.fire('Error', 'ไม่สามารถลบสินค้าได้', 'error'); 
            }
        }
    }
  };

  // --- Filter Logic ---
  const filteredProducts = products.filter(p => {
    const pName = p.title || p.name || '';
    const matchName = pName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ทั้งหมด' || p.category === categoryFilter;
    return matchName && matchCat;
  });

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 relative">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            <input type="text" placeholder="ค้นหา..." className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e]"
                value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        </div>
        <select className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#1a4d2e]"
            value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}>
            {categories.map((c,i)=><option key={i} value={c}>{c}</option>)}
        </select>
        <button onClick={handleAddClick} className="bg-[#1a4d2e] text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-[#143d24]">
            <Plus size={20}/> เพิ่มสินค้า
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b text-sm">
                    <tr>
                        <th className="p-4 w-20">รูปภาพ</th>
                        <th className="p-4">ชื่อสินค้า</th>
                        <th className="p-4">หมวดหมู่</th>
                        <th className="p-4 text-right">ราคา</th>
                        <th className="p-4 text-center">คงเหลือ</th>
                        <th className="p-4 text-center">สถานะ</th>
                        <th className="p-4 text-center w-32">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? <tr><td colSpan="7" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr> : 
                    currentItems.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-gray-400">ไม่พบสินค้า</td></tr> :
                    currentItems.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                {p.thumbnail ? <img src={p.thumbnail.startsWith('http') ? p.thumbnail : `http://localhost:8000${p.thumbnail}`} className="w-10 h-10 object-cover rounded-md border"/> 
                                : <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center"><ImageIcon className="text-gray-400" size={20}/></div>}
                            </td>
                            <td className="p-4 font-medium text-gray-900">{p.title || p.name}</td>
                            <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{p.category}</span></td>
                            <td className="p-4 text-right font-medium text-[#1a4d2e]">฿{Number(p.price).toLocaleString()}</td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{p.stock}</span>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                <span className="text-xs text-gray-500">{p.is_active ? 'ขาย' : 'ซ่อน'}</span>
                            </td>
                            <td className="p-4 text-center">
                                <div className="flex justify-center gap-2">
                                    <button onClick={()=>handleEditClick(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                                    <button onClick={()=>handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* --- Pagination Controls --- */}
        {!loading && filteredProducts.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t bg-gray-50 text-sm">
                <div className="text-gray-500 mb-2 md:mb-0">
                    แสดง {indexOfFirstItem + 1} ถึง {Math.min(indexOfLastItem, filteredProducts.length)} จากทั้งหมด {filteredProducts.length} รายการ
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg border ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ChevronLeft size={16}/>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button 
                            key={number} 
                            onClick={() => paginate(number)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                                currentPage === number 
                                ? 'bg-[#1a4d2e] text-white border-[#1a4d2e]' 
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {number}
                        </button>
                    ))}

                    <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg border ${currentPage === totalPages ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ChevronRight size={16}/>
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}