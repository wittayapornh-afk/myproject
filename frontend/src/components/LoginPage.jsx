import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';


function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        Swal.fire({
            title: 'ยินดีต้อนรับ!', 
            text: `สวัสดีคุณ ${data.user.first_name || data.user.username}`, 
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
             navigate('/');
             window.location.reload();
        });
      } else {
        Swal.fire('เข้าสู่ระบบไม่ได้', data.error || 'ตรวจสอบชื่อผู้ใช้/รหัสผ่าน', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F0E4] px-4">
      <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl w-full max-w-md border border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#305949]"></div>
        
        <h2 className="text-3xl font-bold text-[#305949] mb-2 text-center">เข้าสู่ระบบ</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">ยินดีต้อนรับกลับมา! กรุณากรอกข้อมูลเพื่อเข้าใช้งาน</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">ชื่อผู้ใช้</label>
              <input 
                type="text" 
                name="username"
                className="w-full bg-gray-50 px-6 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#305949] focus:ring-1 focus:ring-[#305949] transition-all"
                onChange={handleChange}
                required
              />
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">รหัสผ่าน</label>
              <input 
                type="password" 
                name="password"
                className="w-full bg-gray-50 px-6 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#305949] focus:ring-1 focus:ring-[#305949] transition-all"
                onChange={handleChange}
                required
              />
          </div>
          
          <button type="submit" className="w-full bg-[#305949] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#234236] transition shadow-lg active:scale-95">
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
            ยังไม่มีบัญชีใช่ไหม? <Link to="/register" className="text-[#305949] font-bold hover:underline">สมัครสมาชิกที่นี่</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;