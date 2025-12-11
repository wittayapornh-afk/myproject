import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function UserProfile() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/profile/', {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        setProfile(data);
        setFormData(data);
    });
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('address', formData.address);
    if (selectedFile) data.append('avatar', selectedFile);

    try {
        const res = await fetch('http://localhost:8000/api/profile/', {
            method: 'PUT',
            headers: { 'Authorization': `Token ${token}` }, // ไม่ต้องใส่ Content-Type (Browser จัดการเองเมื่อใช้ FormData)
            body: data
        });
        if (res.ok) {
            Swal.fire('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อย', 'success');
            setIsEditing(false);
            window.location.reload(); // รีโหลดเพื่อโชว์รูปใหม่
        }
    } catch (err) {
        Swal.fire('Error', 'อัปเดตข้อมูลไม่สำเร็จ', 'error');
    }
  };

  if (!profile) return <div className="py-20 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Avatar & Role */}
        <div className="w-full md:w-1/3 bg-[#305949] p-10 text-white flex flex-col items-center justify-center text-center relative">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 mb-4 overflow-hidden relative group">
                <img src={previewImage || profile.avatar || "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
                {isEditing && (
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs">เปลี่ยนรูป</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                )}
            </div>
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs mt-2 uppercase tracking-wider font-bold">
                {profile.role}
            </span>
            <button onClick={logout} className="mt-8 text-sm text-white/70 hover:text-white underline">ออกจากระบบ</button>
        </div>

        {/* Right: Info Form */}
        <div className="flex-1 p-10">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#263A33]">ข้อมูลส่วนตัว</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-[#305949] font-bold hover:underline">แก้ไขข้อมูล</button>
                ) : (
                    <div className="flex gap-3">
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 font-bold hover:text-gray-600">ยกเลิก</button>
                        <button onClick={handleSave} className="bg-[#305949] text-white px-4 py-1.5 rounded-lg font-bold shadow-sm">บันทึก</button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">อีเมล</label>
                    <input type="text" disabled={!isEditing} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-0 disabled:opacity-60" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">เบอร์โทรศัพท์</label>
                    <input type="text" disabled={!isEditing} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-0 disabled:opacity-60" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">ที่อยู่จัดส่ง</label>
                    <textarea rows="3" disabled={!isEditing} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border-0 disabled:opacity-60"></textarea>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

export default UserProfile;