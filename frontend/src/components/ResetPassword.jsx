import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Lock, Eye, EyeOff, Save, KeyRound, ArrowLeft } from 'lucide-react';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Receive Email from ForgotPassword Page
  const location = useLocation();
  const emailFromState = location.state?.email;

  useEffect(() => {
    if (!emailFromState) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: 'กรุณากรอกอีเมลในหน้าลืมรหัสผ่านก่อน',
            confirmButtonColor: '#1a4d2e'
        }).then(() => navigate('/forgot-password'));
    }
  }, [emailFromState, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'รหัสผ่านไม่ตรงกัน',
            text: 'กรุณากรอกรหัสผ่านยืนยันให้ถูกต้อง',
            confirmButtonColor: '#d33',
            background: '#fff',
            customClass: { popup: 'rounded-[2rem]' }
        });
        return;
    }

    setLoading(true);

    try {
        const res = await fetch('http://localhost:8000/api/auth/reset-password/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: emailFromState, 
                new_password: newPassword 
            })
        });

        const data = await res.json();

        if (res.ok) {
             Swal.fire({
                icon: 'success',
                title: 'เปลี่ยนรหัสผ่านสำเร็จ!',
                text: 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
                confirmButtonColor: '#1a4d2e',
                background: '#fff',
                customClass: { popup: 'rounded-[2rem]' }
            }).then(() => {
                navigate('/login');
            });
        } else {
             throw new Error(data.error || 'เกิดข้อผิดพลาด');
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'พังยับเยิน!',
            text: error.message,
            confirmButtonColor: '#d33',
             background: '#fff',
            customClass: { popup: 'rounded-[2rem]' }
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-4 font-sans relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1a4d2e]/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3"></div>

        <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-white/60 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            
            <Link to="/login" className="absolute top-8 left-8 text-gray-400 hover:text-[#1a4d2e] transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <ArrowLeft size={16} /> ยกเลิก
            </Link>

            <div className="text-center mb-8 mt-6">
                <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100 transform rotate-12 hover:rotate-0 transition-all duration-500">
                    <Lock size={36} className="text-[#1a4d2e]" />
                </div>
                <h2 className="text-3xl font-black text-[#263A33] tracking-tight mb-2">ตั้งรหัสผ่านใหม่</h2>
                <p className="text-gray-500 font-medium text-sm">กรุณาระบุรหัสผ่านใหม่ที่คุณต้องการใช้งาน</p>
                <p className="text-xs text-[#1a4d2e] font-bold mt-2 bg-green-50 inline-block px-3 py-1 rounded-full">{emailFromState}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* New Password */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative group">
                        <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-14 pr-12 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300"
                            placeholder="รหัสผ่านใหม่"
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a4d2e]"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-14 pr-12 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300"
                            placeholder="ยืนยันรหัสผ่านใหม่"
                            required
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1a4d2e] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#143d24] transition-all shadow-xl shadow-green-900/10 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'กำลังบันทึก...' : <><Save size={22} /> บันทึกรหัสผ่านใหม่</>}
                    </button>
                </div>

            </form>
        </div>
    </div>
  );
}

export default ResetPassword;
