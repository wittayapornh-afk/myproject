import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { LogIn, User, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, remember: rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        const userData = { ...data };
        login(data.token, userData);

        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: `ยินดีต้อนรับกลับมา,คุณ ${userData.username}`,
          timer: 1500,
          showConfirmButton: false,
          background: '#fff',
          customClass: {
            title: 'font-black text-[#1a4d2e]',
            popup: 'rounded-[2rem]'
          },
          color: '#263A33',
          iconColor: '#1a4d2e'
        });

        const userRole = (userData.role || '').toLowerCase();
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
          confirmButtonColor: '#d33',
          background: '#fff',
          customClass: {
            title: 'font-black text-red-600',
            popup: 'rounded-[2rem]'
          }
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ (8000) ได้',
        confirmButtonColor: '#d33',
        background: '#fff',
        customClass: {
          title: 'font-black text-red-600',
          popup: 'rounded-[2rem]'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] py-12 px-4 font-sans relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1a4d2e]/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-white/60 relative z-10 animate-in fade-in zoom-in-95 duration-500">

        <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-[#1a4d2e] transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>

        <div className="text-center mb-10 mt-6 relative z-10">
          <div className="w-20 h-20 bg-[#1a4d2e] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-900/10 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <LogIn className="text-white" size={36} />
          </div>
          <h2 className="text-4xl font-black text-[#263A33] tracking-tighter">ยินดีต้อนรับ</h2>
          <p className="text-gray-400 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ชื่อผู้ใช้งาน</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-black shadow-sm placeholder-gray-300"
                placeholder="ชื่อผู้ใช้งานของคุณ"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-12 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-black shadow-sm placeholder-gray-300"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a4d2e] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

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
            className="w-full bg-[#1a4d2e] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#143d24] transition-all shadow-xl shadow-green-900/10 flex items-center justify-center gap-3 group hover:scale-[1.02] active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>เข้าสู่ระบบ <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
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
