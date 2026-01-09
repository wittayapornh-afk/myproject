import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Camera, Save, User, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/formatUtils';

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
  
  // Placeholder for Map Feature to prevent crashes
  const [gpsLoading, setGpsLoading] = useState(false);
  const handleOpenMap = () => {
    Swal.fire({
        title: 'Coming Soon',
        text: 'ระบบปักหมุดแผนที่กำลังอยู่ในระหว่างการพัฒนา',
        icon: 'info',
        confirmButtonColor: '#1a4d2e'
    });
  };
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_BASE_URL = "http://localhost:8000";

  // Helper to format validation errors
  const formatErrorMessages = (errorData) => {
    if (typeof errorData === 'string') return errorData;
    if (Array.isArray(errorData)) return errorData.join(', ');
    if (typeof errorData === 'object' && errorData !== null) {
      return Object.entries(errorData)
        .map(([key, value]) => {
          // Flatten array of errors for a field
          const msg = Array.isArray(value) ? value.join(' ') : String(value);
          // Capitalize key
          const field = key.charAt(0).toUpperCase() + key.slice(1);
          return `${field}: ${msg}`;
        })
        .join('\n');
    }
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  };

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
        let errorMessage = 'บันทึกไม่สำเร็จ';
        try {
          const errorData = await res.json();
          console.error('Server Validation Error:', errorData);
          errorMessage = formatErrorMessages(errorData);
        } catch (e) {
          console.error('Non-JSON Error Response:', e);
          errorMessage = `Server Error (${res.status}): ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Save Error:', error);
      // Use "html" property for multiline formatting if needed, or stick to "text" with newlines
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        html: `<pre style="text-align: left; font-family: sans-serif; white-space: pre-wrap;">${error.message}</pre>`,
        confirmButtonColor: '#d33'
      });
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
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Address</label>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleOpenMap}
                    disabled={gpsLoading}
                    className="px-4 py-2 bg-[#1a4d2e]/10 hover:bg-[#1a4d2e] text-[#1a4d2e] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 group"
                  >
                    <MapPin size={16} className={`transition-transform group-hover:scale-110 ${gpsLoading ? "animate-spin" : ""}`} />
                    {gpsLoading ? 'กำลังโหลด...' : 'เลือกจากแผนที่'}
                  </button>
                )}
              </div>
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
      {/* Map Modal */}
      {/* Map Modal Removed because it was incomplete and causing errors */}
    </div>
  );
}

export default UserProfile;