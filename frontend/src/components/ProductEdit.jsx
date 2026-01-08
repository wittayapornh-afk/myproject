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

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', stock: '', brand: ''
  });
  const [currentThumbnail, setCurrentThumbnail] = useState('');
  const [newThumbnail, setNewThumbnail] = useState(null);
  
  const [galleryImages, setGalleryImages] = useState([]); // รูปเดิมจาก Server
  const [deleteImageIds, setDeleteImageIds] = useState([]); // ID รูปที่จะลบ
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // ไฟล์ใหม่
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]); // Preview รูปใหม่
  const [categories, setCategories] = useState([]); // ✅ State

  useEffect(() => {
    // Fetch Categories
    axios.get(`${API_BASE_URL}/api/categories-list/`)
        .then(res => setCategories(res.data))
        .catch(err => console.error(err));
  }, []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}/`);
        const p = res.data;
        setFormData({
          title: p.title, description: p.description, price: p.price,
          category: p.cat_id || '', // Use cat_id (ID) not category (name)
          stock: p.stock, brand: p.brand || ''
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
  }, [id, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Rule 40: Preview รูปปก
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // ✅ Rule 38
        return Swal.fire('ไฟล์ใหญ่เกินไป', 'รูปภาพต้องมีขนาดไม่เกิน 2MB', 'warning');
      }
      setNewThumbnail(file);
      setCurrentThumbnail(URL.createObjectURL(file));
    }
  };

  // ✅ Rule 37: เพิ่มรูปเข้า Gallery (Preview Only)
  const handleNewGalleryChange = (e) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
          
          if (validFiles.length < files.length) {
              Swal.fire('แจ้งเตือน', 'บางไฟล์มีขนาดเกิน 2MB และถูกคัดออก', 'info');
          }

          setNewGalleryFiles(validFiles);
          const previews = validFiles.map(file => URL.createObjectURL(file));
          setNewGalleryPreviews(previews);
      }
  };

  const handleDeleteGalleryImage = (imgId) => {
      setDeleteImageIds([...deleteImageIds, imgId]);
      setGalleryImages(galleryImages.filter(img => img.id !== imgId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));

    if (newThumbnail) dataToSend.append('thumbnail', newThumbnail);
    deleteImageIds.forEach(did => dataToSend.append('delete_image_ids', did));
    newGalleryFiles.forEach(file => dataToSend.append('new_gallery_images', file));

    try {
      await axios.put(`${API_BASE_URL}/api/admin/product/${id}/edit/`, dataToSend, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      Swal.fire({ 
        icon: 'success', 
        title: 'อัปเดตข้อมูลสำเร็จ', 
        showConfirmButton: false, 
        timer: 1500,
        background: '#1a4d2e',
        color: '#fff'
      }).then(() => navigate(`/product/${id}`));
    } catch (error) {
      console.error("Error updating:", error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#1a4d2e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#1a4d2e] font-black animate-pulse">กำลังโหลดข้อมูลสินค้า...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 pt-28">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-black text-[#263A33] tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-green-50 text-[#1a4d2e] rounded-xl"><ImageIcon size={28}/></div>
                แก้ไขรายละเอียดสินค้า
            </h1>
            <Link to="/admin/dashboard" className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <XCircle size={28} />
            </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ข้อมูลพื้นฐาน */}
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
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-black text-[#1a4d2e]" required />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-bold text-gray-600 outline-none">
                        <option value="" disabled>เลือกหมวดหมู่...</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Stock Units</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#1a4d2e]/20 font-bold text-gray-700" required />
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
                {/* ✅ Rule 37: Preview รูปใหม่ก่อนอัปโหลด */}
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
            <Link to={`/product/${id}`} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-center hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={18}/> ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEdit;