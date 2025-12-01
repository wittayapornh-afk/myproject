import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SuccessModal from './SuccessModal'; // นำเข้า Modal

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "", price: "", brand: "", stock: "", category: "", description: "", thumbnail: ""
  });
  
  // State สำหรับควบคุม Modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/products/${id}/`)
      .then(res => res.json())
      .then(data => {
        setFormData({
            title: data.title,
            price: data.price,
            brand: data.brand || "",
            stock: data.stock || 0,
            category: data.category || "",
            description: data.description || "",
            thumbnail: data.thumbnail || ""
        });
      })
      .catch(err => console.error("Error loading product:", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // แทนที่จะ alert ให้แสดง Modal แทน
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error updating:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50/50">
      
      {/* เรียกใช้ Modal */}
      <SuccessModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="บันทึกสำเร็จ!"
        message="ข้อมูลสินค้าถูกแก้ไขเรียบร้อยแล้ว"
        linkTo={`/product/${id}`} // พอกดตกลง ให้กลับไปหน้า Detail
        linkText="ดูสินค้าที่แก้ไข"
      />

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 px-8 py-6 border-b border-primary/10 flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-secondary">✏️ แก้ไขสินค้า</h2>
                <p className="text-sm text-textMuted mt-1">แก้ไขรายละเอียดสินค้า ID: {id}</p>
            </div>
            {/* ปุ่มปิดมุมขวา */}
            <Link to={`/product/${id}`} className="p-2 hover:bg-white rounded-full transition text-gray-400 hover:text-red-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* ชื่อสินค้า */}
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">ชื่อสินค้า</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-semibold text-secondary mb-2">ราคา ($)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-secondary mb-2">สต็อก (ชิ้น)</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-semibold text-secondary mb-2">แบรนด์</label>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-secondary mb-2">หมวดหมู่</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">ลิงก์รูปภาพ (URL)</label>
            <div className="flex gap-4 items-center">
                <input type="text" name="thumbnail" value={formData.thumbnail} onChange={handleChange} 
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white" />
                {formData.thumbnail && (
                    <img src={formData.thumbnail} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm" />
                )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">รายละเอียดสินค้า</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50 focus:bg-white"></textarea>
          </div>

          <div className="pt-4 flex gap-4">
            <Link to={`/product/${id}`} className="flex-1 py-3.5 text-center bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition font-bold">
                ยกเลิก
            </Link>
            <button type="submit" className="flex-[2] bg-primary hover:bg-primaryHover text-white py-3.5 rounded-xl shadow-lg shadow-primary/25 transition font-bold flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                บันทึกการเปลี่ยนแปลง
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProductEdit;