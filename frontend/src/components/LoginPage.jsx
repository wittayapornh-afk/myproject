import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { LogIn, User, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ Rule 17: ระบบซ่อน/แสดงรหัส
  const [rememberMe, setRememberMe] = useState(true); // ✅ Rule 19: Remember Me
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Rule 21: บังคับใช้พอร์ต 8000
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, remember: rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Rule 12: Normalize ข้อมูลก่อนเข้า Context
        login(data.token, data.user); 

        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: `ยินดีต้อนรับกลับมา,คุณ ${data.user.username}`,
          timer: 1500,
          showConfirmButton: false,
          background: '#1a4d2e',
          color: '#fff',
          iconColor: '#fff'
        });

        // ✅ Rule 20: Redirect ตามสิทธิ์ (Admin ไป Dashboard)
        const userRole = (data.user.role || data.user.role_code || '').toLowerCase();
        if (userRole === 'admin' || userRole === 'super_admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          confirmButtonColor: '#1a4d2e'
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ (8000) ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 w-full max-w-md border border-gray-100 relative overflow-hidden">
        
        {/* ตกแต่งพื้นหลังเล็กน้อย */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        
        <div className="text-center mb-10 relative z-10">
           <div className="w-20 h-20 bg-[#1a4d2e] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <LogIn className="text-white" size={36} />
           </div>
           <h2 className="text-4xl font-black text-[#263A33] tracking-tighter">Welcome Back</h2>
           <p className="text-gray-400 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
              <input 
                type="text"
                autoComplete="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:bg-white transition-all text-[#263A33] font-black shadow-inner"
                placeholder="ชื่อผู้ใช้งานของคุณ"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
             <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} // ✅ Rule 17
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:bg-white transition-all text-[#263A33] font-black shadow-inner"
                placeholder="••••••••"
                required
              />
              {/* ✅ Rule 17: ปุ่มเปิด/ปิดตา */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a4d2e]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* ✅ Rule 19: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#1a4d2e] focus:ring-[#1a4d2e]" 
              />
              <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700 transition-colors">จดจำฉันไว้</span>
            </label>
            <Link to="/forgot-password" size="xs" className="text-xs font-bold text-gray-400 hover:text-[#1a4d2e] transition-colors">ลืมรหัสผ่าน?</Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1a4d2e] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#143d24] transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 group active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>LOGIN NOW <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform"/></>
            )}
          </button>
        </form>

        <div className="mt-10 text-center relative z-10">
            <p className="text-gray-400 text-xs font-bold">ยังไม่มีบัญชีสมาชิก?</p>
            <Link to="/register" className="inline-block mt-2 px-6 py-2 rounded-full border-2 border-gray-100 text-[#1a4d2e] font-black text-sm hover:bg-gray-50 transition-all">สมัครสมาชิกที่นี่</Link>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest relative z-10">
            <ShieldCheck size={14} className="text-[#1a4d2e] opacity-40" /> 256-bit SSL Encrypted Connection
        </div>
      </div>
    </div>
  );
}

export default LoginPage;