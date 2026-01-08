// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, Lock, Mail, Phone, UserPlus, Camera } from 'lucide-react';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (avatar) data.append('avatar', avatar);

    try {
      Swal.showLoading();
      const res = await fetch('/api/register/', { method: 'POST', body: data });
      const responseData = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ!',
          confirmButtonColor: '#305949'
        }).then(() => navigate('/login'));
      } else {
        Swal.fire('Error', responseData.error || 'ข้อมูลไม่ถูกต้อง', 'error');
      }
    } catch {
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    }
  };

  const inputs = [
    { name: 'username', label: 'Username', type: 'text', icon: User },
    { name: 'email', label: 'Email', type: 'email', icon: Mail },
    { name: 'phone', label: 'Phone', type: 'tel', icon: Phone },
    { name: 'password', label: 'Password', type: 'password', icon: Lock, auto: 'new-password' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F0E4] via-[#E7EFEA] to-[#F2F0E4] px-4">
      <div className="relative w-full max-w-md rounded-[3rem] bg-white/85 backdrop-blur-xl
                      shadow-[0_30px_80px_rgba(0,0,0,0.12)]
                      border border-white/70 p-10">

        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#305949]/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <h2 className="text-3xl font-extrabold text-[#263A33] tracking-tight">
            สร้างบัญชีใหม่
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            เริ่มต้นใช้งานภายใน 1 นาที
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 mt-8 space-y-5">

          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={preview || 'https://via.placeholder.com/150?text=Avatar'}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover
                           ring-4 ring-white shadow-xl
                           group-hover:ring-[#305949]/40 transition"
              />
              <label className="absolute bottom-2 right-2 bg-[#305949] text-white
                                p-2 rounded-full cursor-pointer
                                hover:scale-110 active:scale-95
                                transition shadow-md">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">รูปโปรไฟล์ (ไม่บังคับ)</p>
          </div>

          {/* Floating Inputs */}
          {inputs.map(({ name, label, type, icon: Icon, auto }) => (
            <div key={name} className="relative">
              <input
                type={type}
                name={name}
                autoComplete={auto}
                required
                onChange={handleChange}
                placeholder=" "
                className="peer w-full px-5 py-4 pl-12 rounded-2xl
                           bg-gray-50 border border-transparent
                           focus:bg-white focus:ring-2 focus:ring-[#305949]/30
                           hover:bg-white transition-all"
              />
              <label
                className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-400
                           peer-focus:-top-2 peer-focus:scale-90 peer-focus:text-[#305949]
                           peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:scale-90
                           transition-all origin-left bg-white px-2 rounded">
                {label}
              </label>
              <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          ))}

          {/* Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-white
                       bg-gradient-to-r from-[#305949] to-[#234236]
                       shadow-lg shadow-[#305949]/30
                       hover:shadow-xl hover:-translate-y-1
                       active:translate-y-0 active:shadow-md
                       transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={20} /> สมัครสมาชิก
          </button>

          <div className="text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="font-bold text-[#305949] hover:underline">
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
