import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Trash2, Filter, X, Image as ImageIcon, Save, UploadCloud, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductListAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Array of objects {id, name}
  const [loading, setLoading] = useState(true);

  // --- Pagination State (เพิ่มใหม่) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // กำหนดจำนวนสินค้าต่อหน้า

  // Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: '', price: '', stock: '', category: '', description: ''
  });
  
  // Image States
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]); 
  const [galleryFiles, setGalleryFiles] = useState([]);     
  const [galleryPreviews, setGalleryPreviews] = useState([]); 

  useEffect(() => {
    fetchAllProducts();
    fetchCategories();
  }, []);

  // ✅ เมื่อมีการค้นหา หรือเปลี่ยนหมวดหมู่ ให้กลับไปหน้า 1 เสมอ
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // ใช้ API ตัวใหม่ที่ดึงข้อมูลทั้งหมดมาทีเดียว
      const response = await axios.get('http://localhost:8000/api/admin/all_products/', {
          headers: { Authorization: `Token ${token}` }
      });
      if (Array.isArray(response.data)) {
          setProducts(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
        const res = await axios.get('http://localhost:8000/api/categories-list/');
        setCategories(res.data);
    } catch (e) { console.error(e); }
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles([...galleryFiles, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    }
  };

  const removeNewImage = (index) => {
    const newFiles = [...galleryFiles];
    newFiles.splice(index, 1);
    setGalleryFiles(newFiles);
    const newPreviews = [...galleryPreviews];
    newPreviews.splice(index, 1);
    setGalleryPreviews(newPreviews);
  }

  const removeExistingImage = async (imageId) => {
    if(!window.confirm("ต้องการลบรูปนี้ถาวรไหม?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/delete_product_image/${imageId}/`, {
             headers: { Authorization: `Token ${token}` }
        });
        setExistingGallery(existingGallery.filter(img => img.id !== imageId));
    } catch (e) {
        alert("ลบรูปไม่สำเร็จ");
    }
  }

  const handleAddClick = () => {
    setIsEditMode(false);
    setCurrentProductId(null);
    setFormData({ name: '', price: '', stock: '', category: '', description: '' });
    setMainImage(null); setMainImagePreview(null);
    setExistingGallery([]);
    setGalleryFiles([]); setGalleryPreviews([]);
    setIsModalOpen(true);
  };

  const handleEditClick = async (product) => {
    setIsEditMode(true);
    setCurrentProductId(product.id);
    
    setFormData({
      name: product.title || product.name,
      price: product.price,
      stock: product.stock,
      category: product.cat_id || '', // Use ID
      description: product.description || ''
    });
    
    const imgUrl = product.thumbnail ? (product.thumbnail.startsWith('http') ? product.thumbnail : `http://localhost:8000${product.thumbnail}`) : null;
    setMainImagePreview(imgUrl);
    setMainImage(null);
    
    setGalleryFiles([]); 
    setGalleryPreviews([]);

    try {
        const res = await axios.get(`http://localhost:8000/api/product/${product.id}/`);
        if(res.data.images) setExistingGallery(res.data.images);
    } catch(e) {
        setExistingGallery([]);
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("ยืนยันการลบสินค้า?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/delete_product/${id}/`, {
            headers: { Authorization: `Token ${token}` }
        });
        alert("ลบสำเร็จ");
        fetchAllProducts();
    } catch(e) { alert("ลบไม่สำเร็จ"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    data.append('description', formData.description);
    
    if (mainImage) data.append('image', mainImage);
    galleryFiles.forEach(f => data.append('images', f));

    try {
        const url = isEditMode 
            ? `http://localhost:8000/api/edit_product/${currentProductId}/`
            : `http://localhost:8000/api/add_product/`;
        
        await axios.post(url, data, {
            headers: { Authorization: `Token ${token}` }
        });
        alert(isEditMode ? "บันทึกเรียบร้อย" : "เพิ่มสินค้าสำเร็จ");
        setIsModalOpen(false);
        fetchAllProducts();
    } catch (e) {
        alert("เกิดข้อผิดพลาด: " + (e.response?.data?.error || e.message));
    }
  };

  // --- Filter Logic ---
  const filteredProducts = products.filter(p => {
    const pName = p.title || p.name || '';
    const matchName = pName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ทั้งหมด' || p.category === categoryFilter || (p.cat_id && p.cat_id.name === categoryFilter); // Check both for safety
    return matchName && matchCat;
  });

  // --- Pagination Logic (คำนวณการตัดแบ่งหน้า) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // ปุ่มเปลี่ยนหน้า
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
            <option value="ทั้งหมด">ทั้งหมด</option>
            {categories.map((c)=><option key={c.id} value={c.name}>{c.name}</option>)}
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
                    
                    {/* Generate Page Numbers */}
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

      {/* Modal (คงเดิม) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-[#1a4d2e] p-4 flex justify-between items-center text-white shrink-0">
                    <h3 className="font-bold text-lg flex items-center gap-2">{isEditMode ? <Edit/> : <Plus/>} {isEditMode ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
                    <button onClick={()=>setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><X/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image Upload UI */}
                        <div className="w-full md:w-1/3 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">รูปหลัก (Thumbnail)</label>
                                <div className="relative border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center bg-gray-50 hover:border-[#1a4d2e] transition-colors cursor-pointer group overflow-hidden">
                                    {mainImagePreview ? (
                                        <img src={mainImagePreview} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="text-center text-gray-400 p-4">
                                            <ImageIcon size={32} className="mx-auto mb-1"/>
                                            <span className="text-xs">คลิกเพื่อเพิ่มรูปหลัก</span>
                                        </div>
                                    )}
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleMainImageChange} accept="image/*"/>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">อัลบั้มรูป (Gallery)</label>
                                {isEditMode && existingGallery.length > 0 && (
                                    <div className="mb-2 grid grid-cols-3 gap-2">
                                        {existingGallery.map((img) => (
                                            <div key={img.id} className="aspect-square relative group">
                                                <img src={img.image.startsWith('http') ? img.image : `http://localhost:8000${img.image}`} className="w-full h-full object-cover rounded border"/>
                                                <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow hover:scale-110"><XCircle size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {galleryPreviews.length > 0 && (
                                    <div className="mb-2 grid grid-cols-3 gap-2">
                                        {galleryPreviews.map((src, i) => (
                                            <div key={i} className="aspect-square relative">
                                                <img src={src} className="w-full h-full object-cover rounded border border-green-400"/>
                                                <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-1 -right-1 bg-gray-500 text-white rounded-full p-0.5"><X size={12}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="aspect-[3/1] border-2 border-dashed rounded-lg flex flex-col items-center justify-center relative bg-gray-50 hover:border-[#1a4d2e] cursor-pointer text-gray-400 hover:text-[#1a4d2e]">
                                    <UploadCloud size={20}/>
                                    <span className="text-xs mt-1">เพิ่มรูปอัลบั้ม</span>
                                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleGalleryChange} accept="image/*"/>
                                </div>
                            </div>
                        </div>

                        {/* Text Inputs UI */}
                        <div className="flex-1 space-y-4">
                            <div><label className="block text-sm font-medium mb-1">ชื่อสินค้า</label><input required name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4d2e] outline-none"/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">ราคา</label><input required type="number" min="0" name="price" value={formData.price} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4d2e] outline-none"/></div>
                                <div><label className="block text-sm font-medium mb-1">สต็อก</label><input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4d2e] outline-none"/></div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                                <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4d2e] outline-none">
                                    <option value="" disabled>เลือกหมวดหมู่...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium mb-1">รายละเอียด</label><textarea rows="5" name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a4d2e] outline-none resize-none"></textarea></div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2 bg-[#1a4d2e] text-white rounded-lg shadow-md hover:bg-[#143d24] flex items-center gap-2 font-medium"><Save size={18}/> บันทึก</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}