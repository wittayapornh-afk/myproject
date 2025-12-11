import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth(); // ดึง Token มาใช้ยืนยันตัวตน

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    brand: ''
  });
  const [currentImage, setCurrentImage] = useState(''); // รูปเดิมที่มาจาก Server
  const [newImage, setNewImage] = useState(null);       // รูปใหม่ที่ผู้ใช้เลือก (ถ้ามี)
  const [loading, setLoading] = useState(true);

  // 1. โหลดข้อมูลสินค้าเดิมมาแสดง
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/products/${id}/`);
        const p = res.data;
        setFormData({
          title: p.title,
          description: p.description,
          price: p.price,
          category: p.category,
          stock: p.stock,
          brand: p.brand || ''
        });
        setCurrentImage(p.thumbnail); // เก็บ URL รูปเดิมไว้โชว์
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        Swal.fire('Error', 'ไม่พบข้อมูลสินค้า', 'error');
        navigate('/shop');
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // 2. ฟังก์ชันจัดการเมื่อพิมพ์ข้อมูล
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. ฟังก์ชันจัดการเมื่อเลือกรูปใหม่
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]); // เก็บไฟล์รูปใหม่
      // สร้าง URL ชั่วคราวเพื่อพรีวิวทันที
      setCurrentImage(URL.createObjectURL(e.target.files[0])); 
    }
  };

  // 4. บันทึกข้อมูล (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // เตรียมข้อมูลส่งแบบ FormData (เพราะมีรูปภาพ)
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('price', formData.price);
    dataToSend.append('category', formData.category);
    dataToSend.append('stock', formData.stock);
    dataToSend.append('brand', formData.brand);

    // ถ้ามีการเลือกรูปใหม่ ให้ส่งไปด้วย
    if (newImage) {
      dataToSend.append('thumbnail', newImage);
    }

    try {
      // ยิง API PUT ไปที่ Backend
      await axios.put(`http://localhost:8000/api/products/${id}/edit/`, dataToSend, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // แจ้งเตือนสำเร็จ
      Swal.fire({
        icon: 'success',
        title: 'บันทึกเรียบร้อย',
        text: 'แก้ไขข้อมูลสินค้าสำเร็จแล้ว',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate(`/product/${id}`); // เด้งกลับไปหน้าดูสินค้า
      });

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
          {/* ชื่อสินค้า */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305949] outline-none"
              required 
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea 
              name="description" 
              rows="4"
              value={formData.description} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305949] outline-none"
            />
          </div>

          {/* แถว ราคา - หมวดหมู่ - สต็อก */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (บาท)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded-xl">
                <option value="smartphones">Smartphones</option>
                <option value="laptops">Laptops</option>
                <option value="fragrances">Fragrances</option>
                <option value="skincare">Skincare</option>
                <option value="groceries">Groceries</option>
                <option value="home-decoration">Home Decoration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สต็อก</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
            </div>
          </div>

          {/* จัดการรูปภาพ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพสินค้า</label>
            <div className="flex items-center gap-4">
              {currentImage && (
                <img src={currentImage} alt="Preview" className="w-24 h-24 object-cover rounded-xl border" />
              )}
              <input 
                type="file" 
                onChange={handleImageChange}
                accept="image/*"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#305949]/10 file:text-[#305949] hover:file:bg-[#305949]/20"
              />
            </div>
          </div>

          {/* ปุ่ม Action */}
          <div className="flex gap-3 pt-6">
            <button type="submit" className="flex-1 py-3 bg-[#305949] text-white rounded-xl font-bold hover:bg-[#234236] transition shadow-lg">
              บันทึกการแก้ไข
            </button>
            <Link to={`/product/${id}`} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-center hover:bg-gray-200 transition">
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEdit;