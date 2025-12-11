import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function UserProfile() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // State สำหรับฟอร์มแก้ไข
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ดึงข้อมูล User
  useEffect(() => {
    fetch('http://localhost:8000/api/profile/', {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        setProfile(data);
        setFormData(data);
    })
    .catch(() => Swal.fire('Error', 'โหลดข้อมูลไม่สำเร็จ', 'error'));
  }, [token]);

  // เมื่อเลือกไฟล์รูปใหม่ในหน้า Profile
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file)); // แสดงรูปตัวอย่างทันที
    }
  };

  // บันทึกการแก้ไข
  const handleSave = async () => {
    const data = new FormData();
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    if (selectedFile) {
        data.append('avatar', selectedFile);
    }

    try {
        Swal.showLoading();
        const res = await fetch('http://localhost:8000/api/profile/', {
            method: 'PUT',
            headers: { 'Authorization': `Token ${token}` },
            body: data
        });
        if (res.ok) {
            Swal.fire('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อย', 'success').then(() => {
                window.location.reload(); // รีโหลดหน้าเพื่ออัปเดตข้อมูลใหม่ทั้งหมด
            });
        }
    } catch (err) {
        Swal.fire('Error', 'อัปเดตข้อมูลไม่สำเร็จ', 'error');
    }
  };

  if (!profile) return <div className="py-20 text-center text-gray-400">กำลังโหลดข้อมูล...</div>;

  // รูปโปรไฟล์: ถ้ามีรูปให้ใช้รูป user ถ้าไม่มีให้ใช้ Placeholder
  const displayAvatar = previewImage || profile.avatar || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* 🎨 Left Side: Avatar & Status */}
        <div className="w-full md:w-1/3 bg-[#305949] p-10 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="relative group mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 shadow-lg">
                    <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                {/* ปุ่มแก้ไขรูป (แสดงเฉพาะตอนกดแก้ไข) */}
                {isEditing && (
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">📷 เปลี่ยนรูป</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                )}
            </div>

            <h2 className="text-2xl font-black tracking-wide">{profile.username}</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] mt-2 uppercase tracking-wider font-bold shadow-sm backdrop-blur-md border border-white/10">
                {profile.role}
            </span>
            
            <button onClick={logout} className="mt-8 px-6 py-2 rounded-full border border-white/30 text-xs font-bold hover:bg-white hover:text-[#305949] transition">
                ออกจากระบบ
            </button>
        </div>

        {/* 📝 Right Side: User Info Form */}
        <div className="flex-1 p-10">
            <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                <h3 className="text-xl font-bold text-[#263A33]">ข้อมูลส่วนตัว</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[#305949] font-bold text-sm hover:bg-[#305949]/5 px-3 py-1.5 rounded-lg transition">
                        <span>✏️</span> แก้ไขข้อมูล
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => {setIsEditing(false); setPreviewImage(null);}} className="text-gray-400 font-bold text-sm hover:text-gray-600 px-3 py-1.5">ยกเลิก</button>
                        <button onClick={handleSave} className="bg-[#305949] text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-md hover:bg-[#234236] transition">บันทึก</button>
                    </div>
                )}
            </div>

            <div className="space-y-5">
                <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">อีเมล</label>
                    <input 
                        type="email" 
                        disabled={!isEditing} 
                        value={formData.email || ''} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="w-full p-3 bg-gray-50 rounded-xl border border-transparent disabled:opacity-60 focus:bg-white focus:ring-2 focus:ring-[#305949]/20 transition font-medium text-[#263A33]" 
                    />
                </div>
                <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">เบอร์โทรศัพท์</label>
                    <input 
                        type="tel" 
                        disabled={!isEditing} 
                        value={formData.phone || ''} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        placeholder={!isEditing && !formData.phone ? "-" : "0xx-xxx-xxxx"}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-transparent disabled:opacity-60 focus:bg-white focus:ring-2 focus:ring-[#305949]/20 transition font-medium text-[#263A33]" 
                    />
                </div>
                <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">ที่อยู่จัดส่ง</label>
                    <textarea 
                        rows="3" 
                        disabled={!isEditing} 
                        value={formData.address || ''} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder={!isEditing && !formData.address ? "-" : "บ้านเลขที่, ถนน, แขวง/เขต..."}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-transparent disabled:opacity-60 focus:bg-white focus:ring-2 focus:ring-[#305949]/20 transition font-medium text-[#263A33]"
                    ></textarea>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default UserProfile;