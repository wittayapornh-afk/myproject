import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Camera, Save, User, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl, getUserAvatar } from '../utils/formatUtils';

function UserProfile() {
  const { user, token, fetchUser, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Rule: เริ่ม Loading
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      if (selectedFile) data.append('avatar', selectedFile);

      const res = await fetch(`${API_BASE_URL}/api/user/profile/`, {
        method: 'PUT',
        headers: { 'Authorization': `Token ${token}` },
        body: data
      });

      if (res.ok) {
        const responseData = await res.json();

        if (login) {
          // Use authoritative data from backend to update state
          login(token, responseData);

          // 2. Call fetchUser to sync with backend (with cache busting)
          await fetchUser();
        }
        setIsEditing(false);
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'ข้อมูลได้รับการอัปเดตแล้ว',
          confirmButtonColor: '#1a4d2e',
          timer: 1500
        }).then(() => {
          // Optional: Reload page to ensure everything is fresh if state sync fails
          // window.location.reload(); 
        });
      } else {
        throw new Error('บันทึกไม่สำเร็จ');
      }
    } catch (error) {
      Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setLoading(false); // ✅ Rule: จบ Loading
    }
  };

  if (!user) return <div className="p-20 text-center font-bold text-gray-500">Loading profile...</div>;
 
  return (
    <div className="min-h-screen bg-[#F9F9F7] py-10 px-4 flex justify-center pt-28 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#1a4d2e] to-transparent -z-0"></div>
      
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Image */}
        <div className="h-40 bg-gradient-to-r from-[#1a4d2e] to-[#143d24] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            
            {/* Back Button */}
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-2 transition-all hover:-translate-x-1 z-50"
            >
              <ArrowLeft size={18} /> ย้อนกลับ
            </button>
        </div>

        <div className="px-8 md:px-12 pb-12">
          {/* Profile Picture Section */}
          <div className="relative -mt-20 mb-8 flex flex-col items-center">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full p-1.5 bg-white shadow-xl">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-100">
                    <img
                        src={previewImage || getUserAvatar(user.avatar)}
                        className="w-full h-full object-cover"
                        alt="Profile"
                        onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    />
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <Camera size={32} className="text-white drop-shadow-md" />
                        </div>
                    )}
                  </div>
              </div>
              
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-[#1a4d2e] text-white p-3 rounded-full cursor-pointer hover:bg-[#256640] border-4 border-white shadow-lg transition-transform hover:scale-110 active:scale-95">
                  <Camera size={20} />
                  <input type="file" className="hidden" onChange={(e) => {
                    if (e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setPreviewImage(URL.createObjectURL(e.target.files[0]));
                    }
                  }} />
                </label>
              )}
            </div>
            
            <div className="text-center mt-4">
                <h2 className="text-3xl font-black text-[#263A33] tracking-tight">{user.username}</h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-[#1a4d2e] uppercase tracking-wider">{user.role}</span>
                </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Username */}
                 <div className="group">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">Username</label>
                    <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                        <User size={20} className="text-gray-400 group-focus-within:text-[#1a4d2e]" />
                        <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300 disabled:text-gray-500" />
                    </div>
                </div>

                {/* Email (Read Only) */}
                <div className="group opacity-75">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">Email Address</label>
                    <div className="flex items-center gap-3 bg-gray-100 border border-transparent rounded-2xl px-4 py-3.5 cursor-not-allowed">
                        <Mail size={20} className="text-gray-400" />
                        <input type="email" value={formData.email} disabled className="bg-transparent w-full outline-none text-sm font-bold text-gray-500 cursor-not-allowed" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">First Name</label>
                <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300" placeholder="ชื่อจริง" />
                </div>
              </div>
              <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">Last Name</label>
                <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300" placeholder="นามสกุล" />
                </div>
              </div>
            </div>

            <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">Phone Number</label>
                <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                    <Phone size={20} className="text-gray-400 group-focus-within:text-[#1a4d2e]" />
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300" placeholder="เบอร์โทรศัพท์" />
                </div>
            </div>

            <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">Address</label>
                <div className="flex gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                    <MapPin size={20} className="text-gray-400 mt-1 group-focus-within:text-[#1a4d2e]" />
                    <textarea rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 resize-none placeholder-gray-300" placeholder="ที่อยู่จัดส่งสินค้า..."></textarea>
                </div>
            </div>

            <div className="pt-8 flex justify-center gap-4">
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="w-full md:w-auto px-10 py-4 bg-[#1a4d2e] text-white rounded-2xl font-black tracking-wide hover:bg-[#143d24] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                  <User size={20} /> แก้ไขข้อมูลโปรไฟล์
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => { setIsEditing(false); setPreviewImage(null); }} className="px-8 py-4 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors">
                    ยกเลิก
                  </button>
                  <button type="submit" disabled={loading} className={`px-10 py-4 rounded-2xl font-black tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a4d2e] text-white hover:bg-[#143d24]'}`}>
                    {loading ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกการเปลี่ยนแปลง</>}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;