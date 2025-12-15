import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
// นำเข้าไอคอน
import { User, Lock, Mail, Phone, UserPlus } from 'lucide-react';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // ✅ เพิ่ม state เบอร์โทร
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.showLoading();
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username, 
            password, 
            email, 
            phone // ✅ ส่งเบอร์โทรไปด้วย
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        Swal.fire({
            icon: 'success',
            title: 'สมัครสมาชิกสำเร็จ!',
            text: 'กรุณาเข้าสู่ระบบเพื่อใช้งาน',
            confirmButtonColor: '#305949'
        }).then(() => {
            navigate('/login');
        });
      } else {
        Swal.fire({
            icon: 'error',
            title: 'สมัครสมาชิกไม่สำเร็จ',
            text: data.error || 'ชื่อผู้ใช้นี้อาจมีคนใช้แล้ว',
            confirmButtonColor: '#d33'
        });
      }
    } catch (err) {
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F0E4] py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#305949]/5 rounded-full blur-3xl"></div>

        <div className="text-center relative z-10">
            <h2 className="text-3xl font-black text-[#263A33] mb-2">สร้างบัญชีใหม่ 🚀</h2>
            <p className="text-gray-500 text-sm">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 relative z-10">
            
            {/* Username */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">ชื่อผู้ใช้</label>
                <div className="relative">
                    <input type="text" placeholder="Username" className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" onChange={e => setUsername(e.target.value)} required />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">อีเมล</label>
                <div className="relative">
                    <input type="email" placeholder="hello@example.com" className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" onChange={e => setEmail(e.target.value)} required />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Phone Number (เพิ่มใหม่) */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">เบอร์โทรศัพท์</label>
                <div className="relative">
                    <input type="tel" placeholder="081-234-5678" className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" onChange={e => setPhone(e.target.value)} required />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Password */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">รหัสผ่าน</label>
                <div className="relative">
                    <input type="password" placeholder="••••••••" className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" onChange={e => setPassword(e.target.value)} required />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            <button type="submit" className="w-full py-4 bg-[#305949] text-white font-bold rounded-2xl shadow-lg shadow-[#305949]/30 hover:bg-[#234236] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2 mt-6">
                <UserPlus size={20} /> สมัครสมาชิก
            </button>

            <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                    มีบัญชีอยู่แล้ว?{' '}
                    <Link to="/login" className="font-bold text-[#305949] hover:underline transition">
                        เข้าสู่ระบบเลย
                    </Link>
                </p>
            </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;