import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext'; // 1. นำเข้า AuthContext

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // 2. ดึง user มาเช็คสิทธิ์
  
  const [formData, setFormData] = useState({
    title: "", price: "", brand: "", stock: "", category: "", description: "", thumbnail: ""
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null); // เพิ่ม state สำหรับไฟล์รูปใหม่
  
  const fileInputRef = useRef(null);

  // 3. เช็คสิทธิ์ (Admin/Super Admin เท่านั้น)
  useEffect(() => {
    if (user && user.role_code !== 'admin' && user.role_code !== 'super_admin') {
         Swal.fire('Access Denied', 'สำหรับ Admin เท่านั้น!', 'error').then(() => navigate('/'));
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${id}/`)
      .then(res => res.json())
      .then(data => {
        setFormData(data);
        setPreviewImage(data.thumbnail);
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setThumbnailFile(file);
        setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // 4. ดึง Token

      // 5. ใช้ FormData เพื่อความชัวร์ (รองรับทั้งข้อความและรูปภาพ)
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('brand', formData.brand || '');
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      
      // ถ้ามีการเปลี่ยนรูป ให้ส่งรูปไปด้วย
      if (thumbnailFile) {
          submitData.append('thumbnail', thumbnailFile);
      }

      // 6. ยิงไปที่ URL ที่ถูกต้อง (/edit/)
      const response = await fetch(`http://localhost:8000/api/products/${id}/edit/`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Token ${token}` // 🔑 สำคัญมาก! ต้องมี Token
            // ❌ ห้ามใส่ Content-Type: application/json เมื่อใช้ FormData
        },
        body: submitData
      });

      if (response.ok) {
        Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#305949'
        }).then(() => {
            navigate(`/product/${id}`);
        });
      } else {
        const errData = await response.json();
        console.error("Server Error:", errData);
        Swal.fire('บันทึกไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง หรือเช็ค Console', 'error');
      }
    } catch (error) {
      console.error("Network Error:", error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
    }
  };

  const styles = {
    label: "block text-sm font-bold text-gray-600 mb-2 ml-1",
    input: "w-full bg-white text-gray-800 font-medium px-6 py-4 rounded-2xl outline-none border border-gray-300 focus:border-[#305949] focus:ring-2 focus:ring-[#305949]/20 transition-all placeholder-gray-400 shadow-sm"
  };

  return (
    <div className="min-h-screen bg-[#F2F0E4] flex flex-col items-center justify-center py-16 px-4">
        <h1 className="text-3xl font-bold text-[#305949] mb-8 text-center">
            แก้ไขข้อมูลสินค้า
        </h1>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg w-full max-w-4xl border border-white">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                    <label className={styles.label}>รูปภาพปก (Main Image)</label>
                    <div onClick={() => fileInputRef.current.click()} className="relative border-2 border-dashed border-gray-300 rounded-3xl h-64 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="h-full object-contain p-2" />
                        ) : (
                            <p className="font-bold text-gray-400">คลิกเพื่อเปลี่ยนรูปภาพ</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className={styles.label}>ชื่อสินค้า</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className={styles.input} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>ราคา (บาท)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} required />
                    </div>
                    <div>
                        <label className={styles.label}>จำนวนสินค้า (Stock)</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={styles.input} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={styles.label}>แบรนด์</label>
                        <input type="text" name="brand" value={formData.brand} onChange={handleChange} className={styles.input} />
                    </div>
                    <div>
                        <label className={styles.label}>หมวดหมู่</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} className={styles.input} />
                    </div>
                </div>

                <div>
                    <label className={styles.label}>รายละเอียดสินค้า</label>
                    <textarea name="description" rows="5" value={formData.description} onChange={handleChange} className={`${styles.input} resize-none`}></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 border-2 border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 hover:text-gray-700 transition">
                        ยกเลิก
                    </button>
                    <button type="submit" className="flex-[2] bg-[#305949] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#234236] transition-all shadow-lg active:scale-95">
                        บันทึกการเปลี่ยนแปลง
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default ProductEdit;