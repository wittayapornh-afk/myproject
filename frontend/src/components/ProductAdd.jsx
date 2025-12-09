import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ProductAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]); 
  const [previewImage, setPreviewImage] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.is_superuser) {
          Swal.fire('Access Denied', 'Admins only!', 'error').then(() => navigate('/'));
      }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setThumbnailFile(file); 
        setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const data = new FormData();
        data.append('title', formData.title || "");
        data.append('price', formData.price || 0);
        data.append('stock', formData.stock || 0);
        data.append('brand', formData.brand || "");
        data.append('category', formData.category || "");
        data.append('description', formData.description || "");
        if (thumbnailFile) data.append('thumbnail', thumbnailFile);
        galleryFiles.forEach((file) => data.append('images', file));

        const response = await fetch('http://localhost:8000/api/products/', { method: 'POST', body: data });
        if (response.ok) {
            Swal.fire('Success', 'Product added!', 'success').then(() => navigate('/'));
        } else {
            Swal.fire('Error', 'Failed to add product', 'error');
        }
    } catch (error) { Swal.fire('Error', 'Server Error', 'error'); }
  };

  const styles = { label: "block text-sm font-bold text-gray-600 mb-2 ml-1", input: "w-full bg-white text-gray-800 font-medium px-6 py-4 rounded-2xl outline-none border border-gray-300 focus:border-[#305949] shadow-sm" };

  return (
    <div className="min-h-screen bg-[#F2F0E4] flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-3xl font-bold text-[#305949] mb-10 text-center">เพิ่มสินค้าใหม่</h1>
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg w-full max-w-4xl border border-white">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <label className={styles.label}>รูปภาพปก</label>
                    <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-white">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {previewImage ? <img src={previewImage} className="w-full h-full object-contain" /> : <span className="text-gray-400">📸 คลิกเพื่ออัปโหลด</span>}
                    </div>
                </div>
                <div>
                    <label className={styles.label}>รูปเพิ่มเติม</label>
                    <div className="grid grid-cols-4 gap-4">
                        <div onClick={() => galleryInputRef.current.click()} className="aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50">
                            <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} className="hidden" accept="image/*" multiple />+
                        </div>
                        {galleryPreviews.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden"><img src={src} className="w-full h-full object-cover" /><button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs">x</button></div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div><label className={styles.label}>ชื่อสินค้า</label><input type="text" className={styles.input} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                    <div><label className={styles.label}>ราคา</label><input type="number" className={styles.input} onChange={e => setFormData({...formData, price: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div><label className={styles.label}>จำนวน</label><input type="number" className={styles.input} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                    <div><label className={styles.label}>หมวดหมู่</label><input type="text" className={styles.input} onChange={e => setFormData({...formData, category: e.target.value})} /></div>
                </div>
                <div><label className={styles.label}>รายละเอียด</label><textarea rows="4" className={styles.input} onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
                <button type="submit" className="w-full bg-[#305949] text-white py-4 rounded-2xl font-bold hover:bg-[#234236]">บันทึก</button>
            </form>
        </div>
    </div>
  );
}
export default ProductAdd;