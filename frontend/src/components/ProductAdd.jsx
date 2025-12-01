import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

function ProductAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", price: "", brand: "", stock: "", category: "", description: ""
  });
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleImageChange = (e) => {
      setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // สร้าง FormData เพื่อส่งไฟล์
    const data = new FormData();
    data.append('title', formData.title);
    data.append('price', formData.price);
    data.append('brand', formData.brand);
    data.append('stock', formData.stock);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (imageFile) {
    data.append('image', imageFile); // ✅ ถูก: ชื่อตรงกับ Backend แล้ว
  }

    try {
      const response = await fetch('http://localhost:8000/api/products/', {
        method: 'POST',
        body: data // ส่ง FormData แทน JSON
      });

      if (response.ok) {
        // ใช้ SweetAlert2 แจ้งเตือนสวยๆ
        Swal.fire({
            title: 'สำเร็จ!',
            text: 'เพิ่มสินค้าเรียบร้อยแล้ว ✨',
            icon: 'success',
            confirmButtonColor: '#305949',
            confirmButtonText: 'ตกลง'
        }).then(() => {
            navigate('/');
        });
      }
    } catch (error) { 
        console.error("Error:", error);
        Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเพิ่มสินค้าได้',
            icon: 'error'
        });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">📦 ลงขายสินค้าใหม่</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
            <input type="text" name="title" required onChange={handleChange} 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" placeholder="เช่น iPhone 15 Pro" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ราคา ($)</label>
                <input type="number" name="price" required onChange={handleChange} 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สต็อก (ชิ้น)</label>
                <input type="number" name="stock" onChange={handleChange} 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แบรนด์</label>
                <input type="text" name="brand" onChange={handleChange} 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                <input type="text" name="category" onChange={handleChange} 
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" />
            </div>
          </div>

          {/* เปลี่ยนช่องกรอก URL เป็นช่องอัปโหลดไฟล์ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพสินค้า</label>
            <input type="file" accept="image/*" onChange={handleImageChange} 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
            <textarea name="description" rows="4" onChange={handleChange} 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition" placeholder="อธิบายสินค้าของคุณ..."></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <Link to="/" className="flex-1 py-3 text-center border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium">ยกเลิก</Link>
            <button type="submit" className="flex-1 bg-primary hover:bg-indigo-700 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition font-bold">
                ยืนยันการขาย
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} // <--- ปีกกาปิดที่หายไปคือตัวนี้ครับ

export default ProductAdd;