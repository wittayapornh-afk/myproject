import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
// นำเข้าไอคอน
import { User, Lock, LogIn } from 'lucide-react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.showLoading();

      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.token);
        
        Swal.fire({
            icon: 'success',
            title: 'ยินดีต้อนรับกลับมา! 👋',
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#305949'
        }).then(() => {
            navigate(from, { replace: true });
        });
      } else {
        Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
            confirmButtonColor: '#305949'
        });
      }
    } catch (err) {
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F0E4] py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
        
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#305949]/5 rounded-full blur-3xl"></div>

        <div className="text-center relative z-10">
            <h2 className="text-3xl font-black text-[#263A33] mb-2">ยินดีต้อนรับ 👋</h2>
            <p className="text-gray-500 text-sm">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
          <div className="space-y-4">
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">ชื่อผู้ใช้</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Username" 
                      autoComplete="username" 
                      className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" 
                      onChange={e => setUsername(e.target.value)} 
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
              </div>
              <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">รหัสผ่าน</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      autoComplete="current-password" 
                      className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" 
                      onChange={e => setPassword(e.target.value)} 
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
              </div>
          </div>

          <button type="submit" className="w-full py-4 bg-[#305949] text-white font-bold rounded-2xl shadow-lg shadow-[#305949]/30 hover:bg-[#234236] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2">
              <LogIn size={20} /> เข้าสู่ระบบ
          </button>

          <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                  ยังไม่มีบัญชีใช่ไหม?{' '}
                  <Link to="/register" className="font-bold text-[#305949] hover:underline transition">
                      สมัครสมาชิกใหม่ฟรี
                  </Link>
              </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;