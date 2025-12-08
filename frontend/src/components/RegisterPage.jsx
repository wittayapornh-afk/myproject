import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function RegisterPage() {
  const [formData, setFormData] = useState({ 
      username: '', password: '', email: '', first_name: '' 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.username || !formData.password) {
        Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', 'warning');
        return;
    }

    try {
      console.log("Sending data:", formData); // 🔍 ดูใน Console F12

      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      console.log("Response:", data); // 🔍 ดูใน Console F12
      
      if (res.ok) {
        Swal.fire({
            title: 'สำเร็จ!',
            text: 'สมัครสมาชิกเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonColor: '#305949'
        }).then(() => {
             navigate('/login');
        });
      } else {
        Swal.fire('เกิดข้อผิดพลาด', data.error || 'สมัครไม่สำเร็จ', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('เชื่อมต่อไม่ได้', 'กรุณาตรวจสอบว่า Backend รันอยู่หรือไม่', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F0E4] px-4 py-16">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl w-full max-w-lg border border-white">
        <h2 className="text-3xl font-bold text-[#305949] mb-8 text-center">สร้างบัญชีใหม่</h2>
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">ชื่อผู้ใช้ (Login)</label>
                  <input type="text" name="username" onChange={handleChange} className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#305949]" required />
              </div>
              <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">ชื่อเล่น / ชื่อจริง</label>
                  <input type="text" name="first_name" onChange={handleChange} className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#305949]" />
              </div>
          </div>

          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">อีเมล</label>
              <input type="email" name="email" onChange={handleChange} className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#305949]" />
          </div>

          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">รหัสผ่าน</label>
              <input type="password" name="password" onChange={handleChange} className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#305949]" required />
          </div>
          
          <button type="submit" className="w-full bg-[#305949] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#234236] transition shadow-lg active:scale-95 mt-4">
            ยืนยันการสมัคร
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
            มีบัญชีอยู่แล้ว? <Link to="/login" className="text-[#305949] font-bold hover:underline">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;