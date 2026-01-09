import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, Lock, Mail, Phone, UserPlus, Camera, ArrowLeft } from 'lucide-react';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('username', formData.username);
    data.append('password', formData.password);
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    if (avatar) data.append('avatar', avatar);

    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        body: data
      });

      const responseData = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ!',
          text: 'ยินดีด้วย! บัญชีของคุณถูกสร้างเรียบร้อยแล้ว',
          confirmButtonColor: '#1a4d2e',
          background: '#fff',
          customClass: {
             title: 'font-black text-[#1a4d2e]',
             popup: 'rounded-[2rem]'
          }
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: responseData.error || 'กรุณาตรวจสอบข้อมูลอีกครั้ง',
          confirmButtonColor: '#d33',
          background: '#fff',
           customClass: {
             title: 'font-black text-red-600',
             popup: 'rounded-[2rem]'
          }
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] py-12 px-4 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1a4d2e]/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-white/60 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-[#1a4d2e] transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>
        
        <div className="text-center mb-10 mt-6">
          <h2 className="text-4xl font-black text-[#263A33] mb-3 tracking-tighter">Create Account</h2>
          <p className="text-gray-500 font-medium">เข้าร่วมกับเราเพื่อประสบการณ์การช้อปปิ้งที่ดีที่สุด</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group cursor-pointer w-28 h-28">
               <div className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 relative">
                  <img
                    src={preview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                  {!preview && <div className="absolute inset-0 flex items-center justify-center bg-black/5"><Camera size={32} className="text-gray-400 opacity-50"/></div>}
               </div>
               <label className="absolute bottom-1 right-1 bg-[#1a4d2e] text-white p-2.5 rounded-full cursor-pointer hover:bg-[#143d24] border-4 border-white shadow-lg transition-all transform hover:scale-110 active:scale-95">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-wider">อัปโหลดรูปโปรไฟล์</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Username */}
               <div className="group md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Username</label>
                    <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                        <input
                            type="text"
                            name="username"
                            onChange={handleChange}
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300"
                            placeholder="ชื่อผู้ใช้งาน"
                            required
                        />
                    </div>
               </div>

              {/* Names */}
              <div className="group">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">First Name</label>
                 <input type="text" name="first_name" onChange={handleChange} placeholder="ชื่อจริง" className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300" />
              </div>
              <div className="group">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Last Name</label>
                 <input type="text" name="last_name" onChange={handleChange} placeholder="นามสกุล" className="w-full px-6 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300" />
              </div>
          </div>

          {/* Email & Phone */}
          <div className="space-y-6">
              <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                        <input type="email" name="email" onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300" placeholder="อีเมลของคุณ" required />
                    </div>
               </div>

               <div className="group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                        <input type="tel" name="phone" onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-bold shadow-sm placeholder-gray-300" placeholder="เบอร์โทรศัพท์" required />
                    </div>
               </div>
          </div>

          {/* Password */}
          <div className="group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Password</label>
                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1a4d2e] transition-colors" size={20} />
                    <input type="password" name="password" onChange={handleChange} className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent hover:border-gray-100 focus:border-[#1a4d2e] rounded-2xl focus:outline-none focus:bg-white transition-all text-[#263A33] font-black shadow-sm placeholder-gray-300" placeholder="••••••••" required autoComplete="new-password"/>
                </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a4d2e] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#143d24] transition-all shadow-xl shadow-green-900/10 flex items-center justify-center gap-3 mt-8 hover:scale-[1.02] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed group"
          >
             {loading ? 'กำลังดำเนินการ...' : <><UserPlus size={22} /> สมัครสมาชิก</>}
          </button>

          <div className="text-center pt-4">
            <p className="text-sm font-bold text-gray-400">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-[#1a4d2e] hover:underline font-black">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;