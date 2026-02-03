import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { Camera, Image as ImageIcon, Trash2, Save, ArrowLeft, XCircle } from 'lucide-react';
import { getImageUrl } from '../utils/formatUtils';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', stock: '', brand: ''
  });
  
  const [currentThumbnail, setCurrentThumbnail] = useState('');
  const [newThumbnail, setNewThumbnail] = useState(null);
  
  const [galleryImages, setGalleryImages] = useState([]); // Existing gallery (from DB)
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // New files to upload
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]); // Previews for new files


  const API_BASE_URL = 'http://localhost:8000'; // Or use env variable

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}/`);
        const p = res.data;
        setFormData({
          title: p.title, description: p.description, price: p.price,
          category: p.category, stock: p.stock, brand: p.brand || ''
        });
        setCurrentThumbnail(p.thumbnail || p.image);
        setGalleryImages(p.images || []);
        setLoading(false);




      } catch (error) {
        console.error("Error:", error);
        Swal.fire('Error', 'ไม่พบข้อมูลสินค้าในระบบ', 'error');
        navigate('/shop');
      }
    };
    fetchProduct();
  }, [id, navigate, token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setNewThumbnail(file);
        setCurrentThumbnail(URL.createObjectURL(file)); // Show preview of new file
    }
  };

  const handleNewGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        setNewGalleryFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setNewGalleryPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
      // ✅ Custom Styled Confirm for Gallery Delete
      const result = await Swal.fire({
          title: 'ลบรูปภาพนี้?',
          text: "รูปภาพจะถูกลบถาวรและไม่สามารถกู้คืนได้",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#E5E7EB',
          cancelButtonText: '<span style="color:#374151">ยกเลิก</span>',
          confirmButtonText: 'ลบทันที',
          reverseButtons: true, // เอาปุ่มลบไว้ขวา
          focusCancel: true
      });

      if (!result.isConfirmed) return;

      try {
          await axios.delete(`${API_BASE_URL}/api/delete_product_image/${imageId}/`, {
              headers: { Authorization: `Token ${token}` }
          });
          setGalleryImages(galleryImages.filter(img => img.id !== imageId));
          
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
          
          Toast.fire({
            icon: 'success',
            title: 'ลบรูปภาพเรียบร้อยแล้ว'
          });

      } catch (e) {
          console.error(e);
          Swal.fire('Error', 'ลบรูปไม่สำเร็จ', 'error');
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      data.append('brand', formData.brand);
      
      if (newThumbnail) {
          data.append('thumbnail', newThumbnail);
      }
      
      newGalleryFiles.forEach((file) => {
          data.append('new_gallery_images', file);
      });

      try {
          await axios.put(`${API_BASE_URL}/api/products/${id}/edit/`, data, {
  headers: {
    'Authorization': `Token ${token}`
  }
});
          
          await Swal.fire({
              icon: 'success',
              title: 'บันทึกสำเร็จ!',
              text: 'ข้อมูลสินค้าถูกแก้ไขเรียบร้อยแล้ว',
              confirmButtonColor: '#1a4d2e'
          });
          
          // Refresh data
          navigate('/admin/dashboard?tab=products'); 
          
      } catch (error) {
          console.error('Update error:', error);
          Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 pt-28">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100 mb-8">
        {/* ... Form Header ... */}
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-black text-[#263A33] tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-green-50 text-[#1a4d2e] rounded-xl"><ImageIcon size={28}/></div>
                แก้ไขรายละเอียดสินค้า
            </h1>
            <Link to="/admin/dashboard?tab=products" className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <XCircle size={28} />
            </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Product Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-bold text-gray-700" placeholder="ชื่อสินค้า..." required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label>
                <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-medium text-gray-600 resize-none" placeholder="รายละเอียดสินค้า..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Price (THB)</label>
                    <input 
                        type="number" 
                        name="price" 
                        min="0"
                        value={formData.price} 
                        onChange={e => {
                            const val = Math.max(0, e.target.value);
                            setFormData({ ...formData, price: val });
                        }} 
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-black text-[#1a4d2e]" 
                        required 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-bold text-gray-600 outline-none">
                        <option value="smartphones">Smartphones</option>
                        <option value="laptops">Laptops</option>
                        <option value="fragrances">Fragrances</option>
                        <option value="skincare">Skincare</option>
                        <option value="groceries">Groceries</option>
                        <option value="home-decoration">Home Decoration</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Stock Units</label>
                    <input 
                        type="number" 
                        name="stock" 
                        min="0"
                        value={formData.stock} 
                        onChange={e => {
                            const val = Math.max(0, e.target.value);
                            setFormData({ ...formData, stock: val });
                        }} 
                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-bold text-gray-700" 
                        required 
                    />
                </div>
            </div>
          </div>

          {/* Media Section: Thumbnail */}
          <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <h3 className="text-sm font-black text-[#263A33] mb-4 uppercase tracking-widest flex items-center gap-2">
                <Camera size={18} className="text-[#1a4d2e]"/> รูปภาพหน้าปก (Thumbnail)
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <img src={getImageUrl(currentThumbnail)} alt="Preview" className="w-32 h-32 object-cover rounded-3xl border-4 border-white shadow-lg bg-white" />
                <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <Camera className="text-white" size={24} />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <input type="file" onChange={handleThumbnailChange} accept="image/*" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#1a4d2e] file:text-white hover:file:bg-[#143d24] cursor-pointer" />
                <p className="text-[10px] text-gray-400 font-bold">* รองรับไฟล์ JPG, PNG, WebP (สูงสุด 2MB)</p>
              </div>
            </div>
          </div>

          {/* ✅ ส่วนจัดการ Gallery */}
          <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <h3 className="text-sm font-black text-[#263A33] mb-4 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={18} className="text-[#1a4d2e]"/> รูปภาพแกลเลอรี (Gallery)
            </h3>
            
            {/* แสดงรูปเดิม */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-6">
                {galleryImages.map(img => (
                    <div key={img.id} className="relative aspect-square">
                        <img src={getImageUrl(img.image)} className="w-full h-full object-cover rounded-xl border-2 border-white shadow-sm" />
                        <button type="button" onClick={() => handleDeleteGalleryImage(img.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-lg p-1 shadow-md hover:bg-red-600 transition-colors">
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
                {newGalleryPreviews.map((url, i) => (
                    <div key={i} className="relative aspect-square opacity-70 border-2 border-dashed border-[#1a4d2e] rounded-xl overflow-hidden">
                        <img src={url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1a4d2e]/10">
                            <span className="text-[8px] font-black text-[#1a4d2e] uppercase bg-white px-1 rounded">New</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative group">
                <input type="file" multiple onChange={handleNewGalleryChange} accept="image/*" className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-white file:text-[#1a4d2e] file:border file:border-[#1a4d2e]/20 hover:file:bg-green-50 cursor-pointer" />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
                type="submit" 
                disabled={submitting}
                className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a4d2e] hover:bg-[#143d24] hover:shadow-green-900/20'}`}
            >
              {submitting ? 'กำลังบันทึกข้อมูล...' : <><Save size={20}/> บันทึกการเปลี่ยนแปลง</>}
            </button>
            <Link to="/admin/dashboard?tab=products" className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={18}/> ยกเลิก
            </Link>
          </div>
        </form>
      </div>
      

    </div>
  );
}

export default ProductEdit;