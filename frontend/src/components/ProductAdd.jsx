// frontend/src/components/ProductAdd.jsx
<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
=======
import React, { useState, useRef } from 'react';
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // ✅ Import

function ProductAdd() {
<<<<<<< HEAD
    
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.is_superuser) {
          Swal.fire('ไม่มีสิทธิ์เข้าถึง', 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น', 'error')
              .then(() => navigate('/')); // ดีดกลับหน้าแรก
      }
  }, []);
  
=======
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]); 
  const [previewImage, setPreviewImage] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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

        if (thumbnailFile) {
            data.append('thumbnail', thumbnailFile);
        }

        galleryFiles.forEach((file) => {
             data.append('images', file);
        });

        const response = await fetch('http://localhost:8000/api/products/', {
            method: 'POST',
            body: data 
        });
        
        if (response.ok) {
            // ✅ ใช้ Swal Success
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: '#305949'
            }).then(() => {
                navigate('/');
            });
        } else {
            const errorData = await response.json();
            // ❌ ใช้ Swal Error
            Swal.fire('บันทึกไม่สำเร็จ', JSON.stringify(errorData), 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error');
    }
  };
<<<<<<< HEAD
  
=======
>>>>>>> 6b750db946e3753df985d60eabebb30c65417bd6

  const styles = {
    label: "block text-sm font-bold text-gray-600 mb-2 ml-1", 
    input: "w-full bg-white text-gray-800 font-medium px-6 py-4 rounded-2xl outline-none border border-gray-300 focus:border-[#305949] focus:ring-2 focus:ring-[#305949]/20 transition-all placeholder-gray-400 shadow-sm"
  };

  return (
    <div className="min-h-screen bg-[#F2F0E4] flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-3xl font-bold text-[#305949] mb-10 text-center drop-shadow-sm">
            เพิ่มสินค้าใหม่
        </h1>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg w-full max-w-4xl border border-white">
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- ส่วนที่ 1: รูปภาพหลัก --- */}
                <div>
                    <label className={styles.label}>รูปภาพปกสินค้า (Main Image)</label>
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        className={`relative border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden bg-gray-50 hover:bg-white hover:border-[#305949] ${previewImage ? 'border-[#305949]' : 'border-gray-300'}`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {previewImage ? (
                            <div className="relative w-full h-full p-2">
                                <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white font-bold">คลิกเพื่อเปลี่ยนรูป</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <span className="text-5xl block mb-2">📸</span>
                                <p className="text-sm font-bold">คลิกเพื่ออัปโหลดรูป</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ส่วนที่ 2: รูปภาพเพิ่มเติม --- */}
                <div>
                    <label className={styles.label}>รูปภาพเพิ่มเติม (Gallery)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div 
                            onClick={() => galleryInputRef.current.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#305949] hover:bg-gray-50 transition-all text-gray-400 hover:text-[#305949]"
                        >
                            <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} className="hidden" accept="image/*" multiple />
                            <span className="text-4xl mb-1">+</span>
                            <span className="text-xs font-bold">เพิ่มรูป</span>
                        </div>

                        {galleryPreviews.map((imgSrc, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden shadow-md border border-gray-100 group">
                                <img src={imgSrc} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-md transition-all transform hover:scale-110"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- ส่วนที่ 3: ข้อมูลสินค้า --- */}
                <div>
                    <label className={styles.label}>ชื่อสินค้า</label>
                    <input 
                        type="text" 
                        placeholder="เช่น เก้าอี้ไม้สักทรงโมเดิร์น" 
                        className={styles.input} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                        required 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>ราคา (บาท)</label>
                        <input 
                            type="number" 
                            placeholder="0.00" 
                            className={styles.input} 
                            onChange={e => setFormData({...formData, price: e.target.value})} 
                            required 
                        />
                    </div>
                    <div>
                        <label className={styles.label}>จำนวนสินค้า (Stock)</label>
                        <input 
                            type="number" 
                            placeholder="จำนวนที่มีในคลัง" 
                            className={styles.input} 
                            onChange={e => setFormData({...formData, stock: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>แบรนด์</label>
                        <input 
                            type="text" 
                            placeholder="ระบุชื่อแบรนด์" 
                            className={styles.input} 
                            onChange={e => setFormData({...formData, brand: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className={styles.label}>หมวดหมู่</label>
                        <input 
                            type="text" 
                            placeholder="เช่น เฟอร์นิเจอร์, ของแต่งบ้าน" 
                            className={styles.input} 
                            onChange={e => setFormData({...formData, category: e.target.value})} 
                        />
                    </div>
                </div>

                <div>
                    <label className={styles.label}>รายละเอียดสินค้า</label>
                    <textarea 
                        rows="5" 
                        placeholder="อธิบายคุณสมบัติ จุดเด่น หรือขนาดของสินค้า..." 
                        className={`${styles.input} resize-none`} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                <button type="submit" className="w-full bg-[#305949] text-white py-4 rounded-2xl font-bold text-lg tracking-wide hover:bg-[#234236] transition-all shadow-lg transform active:scale-95 mt-6">
                    ยืนยันการลงขายสินค้า
                </button>
            </form>
        </div>
    </div>
  );
}

export default ProductAdd;