import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "", price: "", brand: "", stock: "", category: "", description: "", thumbnail: ""
  });
  const [previewImage, setPreviewImage] = useState(null);
  
  // ✅ State Gallery
  const [galleryImages, setGalleryImages] = useState([]);
  
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // ดึงข้อมูลเก่า (รวมถึงรูป Gallery)
  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${id}/`)
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        setPreviewImage(data.thumbnail);
        setGalleryImages(data.images || []); // ดึงรูป Gallery มาใส่
      })
      .catch(err => console.error(err));
  }, [id]);

  // Main Image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
            setFormData(prev => ({ ...prev, thumbnail: reader.result }));
        };
        reader.readAsDataURL(file);
    }
  };

  // ✅ Gallery Image
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ส่งข้อมูล + รูป Gallery ใหม่ไป
      const payload = { ...formData, images: galleryImages };
      
      const response = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("✅ แก้ไขเรียบร้อย!");
        navigate(`/product/${id}`);
      } else {
        alert("บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const styles = {
    label: "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1",
    input: "w-full bg-[#FAFAF8] text-primary font-medium px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/30 transition-all placeholder-gray-300 border border-transparent focus:bg-white focus:shadow-sm"
  };

  return (
    <div className="min-h-screen bg-[#F2F0E4] flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-3xl font-bold text-[#305949] uppercase tracking-widest mb-8 text-center">
            EDIT PRODUCT
        </h1>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg w-full max-w-4xl border border-white">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Main Image */}
                <div>
                    <label className={styles.label}>MAIN IMAGE</label>
                    <div 
                        onClick={() => fileInputRef.current.click()}
                        className={`relative border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden bg-gray-50 hover:bg-white hover:border-[#305949] ${previewImage ? 'border-[#305949]' : 'border-gray-300'}`}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        
                        {previewImage ? (
                            <div className="relative w-full h-full p-4 flex items-center justify-center">
                                <img src={previewImage} alt="Preview" className="max-h-full object-contain" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white font-bold">คลิกเพื่อเปลี่ยนรูป</p>
                                </div>
                            </div>
                        ) : (
                            <p className="font-bold text-gray-400">คลิกเพื่ออัปโหลดรูปภาพ</p>
                        )}
                    </div>
                </div>

                {/* ✅ Gallery Images Section */}
                <div>
                    <label className={styles.label}>GALLERY IMAGES</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div 
                            onClick={() => galleryInputRef.current.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#305949] hover:bg-gray-50 transition-all"
                        >
                            <input type="file" ref={galleryInputRef} onChange={handleGalleryChange} className="hidden" accept="image/*" multiple />
                            <span className="text-3xl text-gray-300">+</span>
                            <span className="text-xs text-gray-400 font-bold mt-1">ADD MORE</span>
                        </div>

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
                    <label className={styles.label}>Product Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className={styles.input} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>Price ($)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} required />
                    </div>
                    <div>
                        <label className={styles.label}>Stock</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={styles.input} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>Brand</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} className={styles.input} />
                    </div>
                    <div>
                        <label className={styles.label}>Category</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} className={styles.input} />
                    </div>
                </div>

                <div>
                    <label className={styles.label}>Description</label>
                    <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className={`${styles.input} resize-none`}></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 border-2 border-gray-200 text-gray-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" className="flex-[2] bg-[#305949] text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-[#234236] transition-all shadow-lg">
                        SAVE CHANGES
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default ProductEdit;