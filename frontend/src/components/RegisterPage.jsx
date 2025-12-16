import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
// นำเข้าไอคอนเพิ่ม Camera
import { User, Lock, Mail, Phone, UserPlus, Camera } from 'lucide-react';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [avatar, setAvatar] = useState(null); // ✅ State สำหรับเก็บไฟล์รูป
  const [preview, setPreview] = useState(null); // ✅ State สำหรับแสดงตัวอย่างรูป

  const navigate = useNavigate();

  // ฟังก์ชันจัดการ Text Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันจัดการ File Input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file)); // สร้าง URL จำลองเพื่อแสดงรูป preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ 1. เตรียมข้อมูลแบบ FormData (จำเป็นสำหรับการส่งไฟล์)
    const data = new FormData();
    data.append('username', formData.username);
    data.append('password', formData.password);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    if (avatar) {
      data.append('avatar', avatar); // ส่งไฟล์รูป
    }

    try {
      Swal.showLoading();
      
      // ✅ 2. ส่งข้อมูลด้วย fetch (ไม่ต้องกำหนด Content-Type, Browser จะจัดการเอง)
      const res = await fetch('/api/register/', {
        method: 'POST',
        body: data 
      });
      
      const responseData = await res.json();
      
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
            text: responseData.error || 'ตรวจสอบข้อมูลอีกครั้ง',
            confirmButtonColor: '#d33'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้ (ตรวจสอบ Backend ว่า Run อยู่หรือไม่)', 'error');
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
            
            {/* ✅ ส่วนอัปโหลดรูปภาพ */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-2">
                    <img 
                        src={preview || "https://via.placeholder.com/150?text=Avatar"} 
                        alt="Profile Preview" 
                        className="w-full h-full rounded-full object-cover border-4 border-[#F2F0E4] shadow-md"
                    />
                    <label className="absolute bottom-0 right-0 bg-[#305949] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#234236] transition shadow-sm">
                        <Camera size={14} />
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
                <p className="text-xs text-gray-400">อัปโหลดรูปโปรไฟล์ (ถ้ามี)</p>
            </div>

            {/* Username */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">ชื่อผู้ใช้</label>
                <div className="relative">
                    <input 
                        type="text" 
                        name="username"
                        placeholder="Username" 
                        autoComplete="username" 
                        className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" 
                        onChange={handleChange} 
                        required 
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">อีเมล</label>
                <div className="relative">
                    <input 
                        type="email" 
                        name="email"
                        placeholder="hello@example.com" 
                        autoComplete="email" 
                        className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" 
                        onChange={handleChange} 
                        required 
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Phone Number */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">เบอร์โทรศัพท์</label>
                <div className="relative">
                    <input 
                        type="tel" 
                        name="phone"
                        placeholder="081-234-5678" 
                        autoComplete="tel"
                        className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" 
                        onChange={handleChange} 
                        required 
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Password (✅ เพิ่ม autocomplete="new-password" แก้ Warning) */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">รหัสผ่าน</label>
                <div className="relative">
                    <input 
                        type="password" 
                        name="password"
                        placeholder="••••••••" 
                        autoComplete="new-password" 
                        className="w-full px-5 py-3 pl-12 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#305949]/30 border border-transparent focus:bg-white transition-all" 
                        onChange={handleChange} 
                        required 
                    />
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