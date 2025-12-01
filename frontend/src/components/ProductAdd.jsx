import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  
  // ✅ State สำหรับรูป Gallery หลายรูป
  const [galleryImages, setGalleryImages] = useState([]); 
  
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // จัดการรูปหลัก (Thumbnail)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setFormData({ ...formData, thumbnail: reader.result });
        };
        reader.readAsDataURL(file);
    }
  };

  // ✅ จัดการรูป Gallery (เลือกได้หลายรูป)
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryImages(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        }
    });
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // รวมข้อมูลรูปหลัก และ รูป Gallery ส่งไป Backend
        const payload = { ...formData, images: galleryImages };
        
        const response = await fetch('http://localhost:8000/api/products/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            alert('✨ เพิ่มสินค้าและรูปภาพเรียบร้อย!');
            navigate('/');
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึก');
        }
    } catch (error) {
        alert('เชื่อมต่อ Server ไม่ได้');
    }
  };

  const styles = {
    label: "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1",
    input: "w-full bg-[#FAFAF8] text-primary font-medium px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder-gray-300 border border-transparent focus:bg-white focus:shadow-sm"
  };

  return (
    <div className="min-h-screen bg-[#F2F0E4] flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-3xl font-bold text-[#305949] uppercase tracking-widest mb-10 text-center drop-shadow-sm">
            ADD PRODUCT & GALLERY
        </h1>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-soft w-full max-w-4xl border border-white">
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- Main Image --- */}
                <div>
                    <label className={styles.label}>MAIN IMAGE (THUMBNAIL)</label>
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        className={`relative border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden bg-gray-50 hover:bg-white hover:border-[#305949] ${previewImage ? 'border-[#305949]' : 'border-gray-300'}`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="h-full object-contain p-2" />
                        ) : (
                            <div className="text-center">
                                <span className="text-4xl">📸</span>
                                <p className="text-gray-400 text-sm mt-2 font-bold">คลิกเพื่อเลือกรูปหลัก</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ✅ Gallery Images (NEW) --- */}
                <div>
                    <label className={styles.label}>GALLERY IMAGES (เลือกได้หลายรูป)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* ปุ่มเพิ่มรูป */}
                        <div 
                            onClick={() => galleryInputRef.current.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#305949] hover:bg-gray-50 transition-all"
                        >
                            <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} className="hidden" accept="image/*" multiple />
                            <span className="text-3xl text-gray-300">+</span>
                            <span className="text-xs text-gray-400 font-bold mt-1">ADD MORE</span>
                        </div>

                        {/* แสดงรูป Gallery ที่เลือก */}
                        {galleryImages.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                                <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inputs */}
                <div>
                    <label className={styles.label}>PRODUCT TITLE</label>
                    <input type="text" className={styles.input} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>PRICE ($)</label>
                        <input type="number" className={styles.input} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>
                    <div>
                        <label className={styles.label}>STOCK</label>
                        <input type="number" className={styles.input} onChange={e => setFormData({...formData, stock: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>BRAND</label>
                        <input type="text" className={styles.input} onChange={e => setFormData({...formData, brand: e.target.value})} />
                    </div>
                    <div>
                        <label className={styles.label}>CATEGORY</label>
                        <input type="text" className={styles.input} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className={styles.label}>DESCRIPTION</label>
                    <textarea rows="4" className={`${styles.input} resize-none`} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <button type="submit" className="w-full bg-[#305949] text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#234236] transition-all shadow-lg mt-4">
                    PUBLISH PRODUCT
                </button>
            </form>
        </div>
    </div>
  );
}

export default ProductAdd;