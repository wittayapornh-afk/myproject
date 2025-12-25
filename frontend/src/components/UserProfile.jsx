import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Camera, Save, User, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/formatUtils';

function UserProfile() {
  const { user, token, fetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', address: '' });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
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
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      if (selectedFile) data.append('avatar', selectedFile);

      const res = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'PUT',
        headers: { 'Authorization': `Token ${token}` },
        body: data
      });

      if (res.ok) {
        await fetchUser();
        setIsEditing(false);
        Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', confirmButtonColor: '#1a4d2e', timer: 1500 });
      } else {
        throw new Error('บันทึกไม่สำเร็จ');
      }
    } catch (error) {
      Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setLoading(false); // ✅ Rule: จบ Loading
    }
  };

  if (!user) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-10 px-4 flex justify-center pt-24">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        
        {/* ✅ Rule: ปุ่มย้อนกลับ */}
        <Link to="/shop" className="absolute top-4 left-4 z-10 bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md flex items-center gap-1 transition-all">
            <ArrowLeft size={16}/> กลับ
        </Link>

        <div className="h-32 bg-[#1a4d2e]"></div>

        <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex flex-col items-center">
                <div className="relative group">
                    <img 
                        src={previewImage || getImageUrl(user.avatar)} 
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
                        alt="Profile"
                        onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    />
                    {isEditing && (
                        <label className="absolute bottom-1 right-1 bg-[#1a4d2e] text-white p-2 rounded-full cursor-pointer hover:bg-[#143d24] border-2 border-white shadow-sm transition-transform hover:scale-110">
                            <Camera size={18} />
                            <input type="file" className="hidden" onChange={(e) => {
                                if(e.target.files[0]) {
                                    setSelectedFile(e.target.files[0]);
                                    setPreviewImage(URL.createObjectURL(e.target.files[0]));
                                }
                            }} />
                        </label>
                    )}
                </div>
                <h2 className="mt-3 text-2xl font-bold text-gray-800">{user.username}</h2>
                <span className="text-gray-500 font-medium bg-gray-100 px-3 py-0.5 rounded-full text-sm mt-1 uppercase">{user.role}</span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                {/* ... (Fields เหมือนเดิม) ... */}
                {/* ✅ Rule: Email Read-only */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">อีเมล</label>
                    <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3 py-3 cursor-not-allowed">
                        <Mail size={18} className="text-gray-400"/>
                        <input type="email" value={formData.email} disabled className="bg-transparent w-full outline-none text-sm font-bold text-gray-500 cursor-not-allowed" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">เบอร์โทรศัพท์</label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                        <Phone size={18} className="text-gray-400"/>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700" placeholder="-" />
                    </div>
                </div>
                
                 {/* ... Address Field ... */}
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">ที่อยู่จัดส่ง</label>
                    <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                        <MapPin size={18} className="text-gray-400 mt-0.5"/>
                        <textarea rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 resize-none" placeholder="ระบุที่อยู่..."></textarea>
                    </div>
                </div>

                <div className="pt-6 flex justify-center gap-3">
                    {!isEditing ? (
                        <button type="button" onClick={() => setIsEditing(true)} className="w-full md:w-auto px-8 py-3 bg-[#1a4d2e] text-white rounded-xl font-bold hover:bg-[#143d24] transition-all shadow-md">
                            แก้ไขข้อมูล
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={() => {setIsEditing(false); setPreviewImage(null);}} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                ยกเลิก
                            </button>
                            {/* ✅ Rule: ปุ่ม Loading state */}
                            <button type="submit" disabled={loading} className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a4d2e] text-white hover:bg-[#143d24]'}`}>
                                {loading ? 'กำลังบันทึก...' : <><Save size={18} /> บันทึก</>}
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