import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Mail, ArrowLeft, Send, KeyRound } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Hook for navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        Swal.fire({
            icon: 'success',
            title: 'ส่งลิงก์กู้คืนเรียบร้อย!',
            text: 'ระบบได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่อีเมลของคุณแล้ว (Simulation Mode: กำลังพาไปหน้าตั้งรหัสผ่าน)',
            confirmButtonColor: '#1a4d2e',
            background: '#fff',
            timer: 2000,
            timerProgressBar: true,
            customClass: {
                title: 'font-black text-[#1a4d2e]',
                popup: 'rounded-[2rem]'
            }
        }).then(() => {
            // ✅ Simulation: Navigate to Reset Password page directly
            console.log("Navigating to reset with email:", email);
            navigate('/reset-password', { state: { email: email } });
        });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#1a4d2e] to-transparent -z-0 opacity-10"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#1a4d2e]/5 rounded-full blur-3xl"></div>
      <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/50 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Back Button */}
        <Link to="/login" className="absolute top-8 left-8 text-gray-400 hover:text-[#1a4d2e] transition-colors flex items-center gap-2 font-bold text-sm">
            <ArrowLeft size={18} /> กลับไปหน้าเข้าสู่ระบบ
        </Link>

        <div className="text-center mb-8 mt-8">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100 group">
                <KeyRound size={36} className="text-[#1a4d2e] group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h2 className="text-3xl font-black text-[#263A33] tracking-tight mb-2">ลืมรหัสผ่าน?</h2>
            <p className="text-gray-500 font-medium text-sm max-w-xs mx-auto">ไม่ต้องกังวล! กรอกอีเมลของคุณด้านล่าง เราจะส่งขั้นตอนการกู้คืนรหัสผ่านไปให้</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-gray-200 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300"
                        placeholder="name@example.com"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a4d2e] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#143d24] transition-all shadow-xl shadow-green-900/10 flex items-center justify-center gap-3 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed group"
            >
                {loading ? (
                    'กำลังส่ง...'
                ) : (
                    <>ส่งลิงก์กู้คืน <Send size={20} className="group-hover:translate-x-1 transition-transform" /></>
                )}
            </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400">
                หากยังไม่ได้รับอีเมล? <button className="text-[#1a4d2e] hover:underline">ส่งอีกครั้ง</button>
            </p>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
