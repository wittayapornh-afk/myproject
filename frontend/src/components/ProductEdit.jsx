import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', stock: '', brand: ''
  });
  const [currentThumbnail, setCurrentThumbnail] = useState('');
  const [newThumbnail, setNewThumbnail] = useState(null);
  
  // ✅ State สำหรับ Gallery
  const [galleryImages, setGalleryImages] = useState([]); // รูปที่มีอยู่แล้วจาก Server
  const [deleteImageIds, setDeleteImageIds] = useState([]); // ID ของรูปที่จะลบ
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // ไฟล์รูปใหม่ที่จะอัพโหลด

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/products/${id}/`);
        const p = res.data;
        setFormData({
          title: p.title, description: p.description, price: p.price,
          category: p.category, stock: p.stock, brand: p.brand || ''
        });
        setCurrentThumbnail(p.thumbnail);
        setGalleryImages(p.images || []); // set รูป gallery
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        Swal.fire('Error', 'ไม่พบข้อมูลสินค้า', 'error');
        navigate('/shop');
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleThumbnailChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewThumbnail(e.target.files[0]);
      setCurrentThumbnail(URL.createObjectURL(e.target.files[0]));
    }
  };

  // ✅ เพิ่มรูปเข้า Gallery (Preview Only)
  const handleNewGalleryChange = (e) => {
      if (e.target.files) {
          setNewGalleryFiles([...e.target.files]);
      }
  };

  // ✅ ลบรูป Gallery เดิม (แค่ซ่อนและเก็บ ID ไว้ส่งไปลบที่ Server)
  const handleDeleteGalleryImage = (imgId) => {
      setDeleteImageIds([...deleteImageIds, imgId]);
      setGalleryImages(galleryImages.filter(img => img.id !== imgId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('price', formData.price);
    dataToSend.append('category', formData.category);
    dataToSend.append('stock', formData.stock);
    dataToSend.append('brand', formData.brand);

    if (newThumbnail) {
      dataToSend.append('thumbnail', newThumbnail);
    }

    // ✅ ส่ง ID รูปที่ต้องการลบ
    deleteImageIds.forEach(did => dataToSend.append('delete_image_ids', did));
    
    // ✅ ส่งไฟล์รูป Gallery ใหม่
    for (let i = 0; i < newGalleryFiles.length; i++) {
        dataToSend.append('new_gallery_images', newGalleryFiles[i]);
    }

    try {
      await axios.put(`http://localhost:8000/api/products/${id}/edit/`, dataToSend, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      Swal.fire({ icon: 'success', title: 'บันทึกเรียบร้อย', showConfirmButton: false, timer: 1500 })
        .then(() => navigate(`/product/${id}`));
    } catch (error) {
      console.error("Error updating:", error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-[#263A33] mb-6">✏️ แก้ไขสินค้า</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ข้อมูลพื้นฐาน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full p-3 border rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">ราคา</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 border rounded-xl" required /></div>
            <div>
                <label className="block text-sm font-medium mb-1">หมวดหมู่</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded-xl">
                    <option value="smartphones">Smartphones</option>
                    <option value="laptops">Laptops</option>
                    <option value="fragrances">Fragrances</option>
                    <option value="skincare">Skincare</option>
                    <option value="groceries">Groceries</option>
                    <option value="home-decoration">Home Decoration</option>
                </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">สต็อก</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-3 border rounded-xl" required /></div>
          </div>

          {/* รูปปก (Thumbnail) */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">รูปปก (Thumbnail)</label>
            <div className="flex items-center gap-4">
              {currentThumbnail && <img src={currentThumbnail} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />}
              <input type="file" onChange={handleThumbnailChange} accept="image/*" className="text-sm text-gray-500" />
            </div>
          </div>

          {/* ✅ ส่วนจัดการ Gallery */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพเพิ่มเติม (Gallery)</label>
            
            {/* แสดงรูปเดิม */}
            <div className="flex gap-2 flex-wrap mb-4">
                {galleryImages.map(img => (
                    <div key={img.id} className="relative group">
                        <img src={img.image} className="w-20 h-20 object-cover rounded-lg border" />
                        <button 
                            type="button"
                            onClick={() => handleDeleteGalleryImage(img.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600"
                        >X</button>
                    </div>
                ))}
            </div>

            {/* อัพโหลดรูปใหม่ */}
            <input 
                type="file" 
                multiple 
                onChange={handleNewGalleryChange}
                accept="image/*"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#305949]/10 file:text-[#305949]"
            />
            <p className="text-xs text-gray-400 mt-1">*เลือกได้หลายไฟล์</p>
          </div>

          <div className="flex gap-3 pt-6">
            <button type="submit" className="flex-1 py-3 bg-[#305949] text-white rounded-xl font-bold hover:bg-[#234236] transition shadow-lg">บันทึก</button>
            <Link to={`/product/${id}`} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-center hover:bg-gray-200">ยกเลิก</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEdit;