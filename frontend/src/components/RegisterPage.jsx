import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function RegisterPage() {
  const navigate = useNavigate();
  
  // State ข้อมูล
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // State สำหรับรูปภาพ
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันจัดการเมื่อเลือกไฟล์รูป
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // สร้าง URL จำลองเพื่อแสดง Preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
        return Swal.fire('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกรหัสผ่านให้เหมือนกัน', 'warning');
    }
    if (formData.password.length < 6) {
        return Swal.fire('รหัสผ่านสั้นเกินไป', 'ต้องมีอย่างน้อย 6 ตัวอักษร', 'warning');
    }

    try {
        Swal.fire({ title: 'กำลังสร้างบัญชี...', didOpen: () => Swal.showLoading() });

        // ✅ ใช้ FormData เพื่อส่งไฟล์รูปภาพ
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        
        if (selectedFile) {
            data.append('avatar', selectedFile); // แนบไฟล์รูป
        }

        const res = await fetch('http://localhost:8000/api/register/', {
            method: 'POST',
            // ❌ ไม่ต้องใส่ Content-Type: application/json
            // Browser จะจัดการ Boundary ให้เองเมื่อใช้ FormData
            body: data 
        });

        const result = await res.json();

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'สมัครสำเร็จ!',
                text: 'ยินดีต้อนรับสู่ครอบครัวของเรา',
                confirmButtonColor: '#305949'
            }).then(() => navigate('/login'));
        } else {
            Swal.fire('เกิดข้อผิดพลาด', result.error || 'สมัครไม่สำเร็จ', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F0E4] py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
        
        <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-[#263A33]">สร้างบัญชีใหม่</h2>
            <p className="text-gray-500 text-sm mt-1">สมัครสมาชิกเพื่อเริ่มต้นใช้งาน</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* 📸 ส่วนเลือกรูปโปรไฟล์ */}
            <div className="flex flex-col items-center justify-center mb-4">
                <div className="relative group cursor-pointer w-28 h-28">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#F2F0E4] shadow-sm bg-gray-100 flex items-center justify-center">
                        {previewImage ? (
                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl text-gray-300">👤</span>
                        )}
                    </div>
                    {/* ปุ่มเปลี่ยนรูป */}
                    <label className="absolute bottom-0 right-0 bg-[#305949] text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-[#234236] transition">
                        <span className="text-xs">📷</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">เลือกรูปโปรไฟล์ (ถ้าไม่เลือกจะใช้รูปเริ่มต้น)</p>
            </div>

            <div className="space-y-3">
                <input name="username" type="text" required placeholder="ชื่อผู้ใช้" className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-[#305949]/30 transition" onChange={handleChange} />
                <input name="email" type="email" required placeholder="อีเมล" className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-[#305949]/30 transition" onChange={handleChange} />
                <div className="grid grid-cols-2 gap-3">
                    <input name="password" type="password" required placeholder="รหัสผ่าน" className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-[#305949]/30 transition" onChange={handleChange} />
                    <input name="confirmPassword" type="password" required placeholder="ยืนยันรหัส" className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:ring-2 focus:ring-[#305949]/30 transition" onChange={handleChange} />
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-[#305949] text-white font-bold rounded-xl shadow-lg hover:bg-[#234236] hover:-translate-y-1 transition-all">
                สมัครสมาชิก
            </button>

            <div className="text-center pt-4 border-t border-gray-100">
                <Link to="/login" className="text-sm font-bold text-[#305949] hover:underline">
                    มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                </Link>
            </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;