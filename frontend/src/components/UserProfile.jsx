import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Camera, Save, User, Mail, Phone, MapPin, ArrowLeft, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl, getUserAvatar } from '../utils/formatUtils';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function UserProfile() {
  const { user, token, fetchUser, login } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // GPS & Map
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapPosition, setMapPosition] = useState(null); // { lat, lng }

  // Change Password State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  // ✅ Password Criteria State (Matches RegisterPage)
  const [passwordCriteria, setPasswordCriteria] = useState({ length: false, number: false, special: false });

  // Form Data
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Validation State
  const [usernameStatus, setUsernameStatus] = useState(null); // null, 'checking', 'available', 'taken'

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

  // ✅ Check Username Availability
  const checkUsername = async (username) => {
    if (!username || username === user.username) {
      setUsernameStatus(null);
      return;
    }
    if (username.length < 3) return;

    setUsernameStatus('checking');
    try {
      const res = await fetch(`${API_BASE_URL}/api/check-username/?username=${username}`);
      const data = await res.json();
      if (data.available) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('taken');
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameStatus(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    // Restriction for Name (No special chars, allow letters & spaces)
    if (name === 'first_name' || name === 'last_name') {
      // Regex: Allow Thai/English letters, spaces. Disallow special chars like !@#$%^&*()
      const restrictedValue = value.replace(/[^a-zA-Z\u0E00-\u0E7F\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: restrictedValue }));
      return;
    }

    // Restriction for Username (Allow alphanumeric only)
    if (name === 'username') {
      const restrictedValue = value.replace(/[^a-zA-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: restrictedValue }));

      if (restrictedValue && isEditing) {
        const timeoutId = setTimeout(() => checkUsername(restrictedValue), 500);
        return () => clearTimeout(timeoutId);
      }
      return;
    }

    // Restriction for Address (Letters, Numbers, Spaces, and specific symbols: - _ / . , () [])
    if (name === 'address') {
      const restrictedValue = value.replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s\-\_\/\.\,\(\)\[\]]/g, '');
      setFormData(prev => ({ ...prev, [name]: restrictedValue }));
      return;
    }

    // Restriction for Email (a-z, 0-9, ., @)
    if (name === 'email') {
      const restrictedValue = value.replace(/[^a-zA-Z0-9.@]/g, '');
      setFormData(prev => ({ ...prev, [name]: restrictedValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'taken') {
      Swal.fire({ icon: 'error', title: 'ชื่อผู้ใช้ซ้ำ', text: 'กรุณาเลือกชื่อผู้ใช้อื่น', confirmButtonColor: '#d33' });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      // Email is read-only in this form logic, but if needed: data.append('email', formData.email);
      if (selectedFile) data.append('avatar', selectedFile);

      const res = await fetch(`${API_BASE_URL}/api/profile/`, {
        method: 'PUT',
        headers: { 'Authorization': `Token ${token}` },
        body: data
      });

      const responseData = await res.json();

      if (res.ok) {
        if (login) {
          login(token, responseData);
          await fetchUser();
        }
        setIsEditing(false);
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'ข้อมูลได้รับการอัปเดตแล้ว',
          confirmButtonColor: '#1a4d2e',
          timer: 1500
        });
      } else {
        throw new Error(responseData.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Save Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Password Input Handler
  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;

    // Block Thai characters
    const sanitizedValue = value.replace(/[\u0E00-\u0E7F]/g, '');

    setPasswordData(prev => ({ ...prev, [name]: sanitizedValue }));

    if (name === 'new_password') {
      setPasswordCriteria({
        length: sanitizedValue.length >= 6,
        number: /\d/.test(sanitizedValue),
        special: /[^A-Za-z0-9]/.test(sanitizedValue)
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate Criteria
    if (!passwordCriteria.length || !passwordCriteria.number) {
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ปลอดภัย',
        text: 'กรุณาตั้งรหัสผ่านให้ตรงตามเงื่อนไข (6 ตัวอักษร + ตัวเลข)',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      Swal.fire('ข้อผิดพลาด', 'รหัสผ่านใหม่ไม่ตรงกัน', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON Response:", text);
        throw new Error(text.includes("<html") ? `Server Error (${res.status}): Please contact admin` : text);
      }

      const data = await res.json();

      if (res.ok) {
        Swal.fire('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
        setShowPasswordChange(false);
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        setPasswordCriteria({ length: false, number: false, special: false });
      } else {
        throw new Error(data.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      }
    } catch (error) {
      console.error("Change Password Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
        confirmButtonColor: '#d33'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenMap = () => {
    // 1. Use existing position if already selected/set
    if (mapPosition) {
      setShowMap(true);
      return;
    }

    // 2. Try to load from localStorage (Persist selection)
    const savedPos = localStorage.getItem('selectedMapPosition');
    if (savedPos) {
      try {
        const { lat, lng } = JSON.parse(savedPos);
        setMapPosition({ lat, lng });
        setShowMap(true);
        return;
      } catch (e) {
        localStorage.removeItem('selectedMapPosition');
      }
    }

    // 2. Default to Bangkok first (immediate feedback)
    setMapPosition({ lat: 13.7563, lng: 100.5018 });
    setShowMap(true);

    // 3. Optional: Try to get actual GPS in background (if user hasn't selected anything yet)
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Only update if map is still open and user hasn't manually moved/clicked (simplified check)
          setMapPosition({ lat: latitude, lng: longitude });
          setGpsLoading(false);
        },
        (error) => {
          console.error('Geolocation Error:', error);
          setGpsLoading(false);
        }
      );
    }
  };

  const handleConfirmLocation = async () => {
    if (!mapPosition) return;
    setGpsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition.lat}&lon=${mapPosition.lng}&zoom=18&addressdetails=1&accept-language=th`);
      const data = await response.json();

      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
        setShowMap(false);
        Swal.fire({
          icon: 'success',
          title: 'ดึงข้อมูลสำเร็จ',
          text: 'อัปเดตที่อยู่เรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error('ไม่สามารถหาที่อยู่ได้');
      }
    } catch (error) {
      console.error('GPS Sync Error:', error);
      Swal.fire('Error', 'ไม่สามารถดึงข้อมูลที่อยู่ได้', 'error');
    } finally {
      setGpsLoading(false);
    }
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        setMapPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
        localStorage.setItem('selectedMapPosition', JSON.stringify(e.latlng));
      },
    });

    return mapPosition === null ? null : (
      <Marker position={mapPosition}></Marker>
    );
  };

  if (!user) return <div className="p-20 text-center font-bold text-gray-500 font-sans">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] py-10 px-4 flex justify-center pt-28 pb-20 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#1a4d2e] to-transparent -z-0"></div>

      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header Image */}
        <div className="h-40 bg-gradient-to-r from-[#1a4d2e] to-[#143d24] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

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

                </div>
              </div>

              {isEditing && (
                <label className="absolute bottom-1 right-1 bg-[#1a4d2e] text-white p-3 rounded-full cursor-pointer hover:bg-[#256640] border-4 border-white shadow-lg transition-transform hover:scale-110 active:scale-95 z-20">
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
                <span className="text-xs font-bold text-[#1a4d2e] uppercase tracking-wider">{user.role === 'new_user' ? 'สมาชิกใหม่' : user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">ชื่อผู้ใช้งาน (Username)</label>
                <div className="relative">
                  <div className={`flex items-center gap-3 bg-gray-50/50 hover:bg-white border group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e] ${usernameStatus === 'taken' ? 'border-red-500' : 'border-gray-200'}`}>
                    <User size={20} className="text-gray-400 group-focus-within:text-[#1a4d2e]" />
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300 disabled:text-gray-500" />
                  </div>
                  {/* Status Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <Loader2 className="animate-spin text-gray-400" size={16} />}
                    {usernameStatus === 'available' && <CheckCircle className="text-green-500" size={16} />}
                    {usernameStatus === 'taken' && <XCircle className="text-red-500" size={16} />}
                  </div>
                </div>
                {usernameStatus === 'taken' && <p className="text-red-500 text-[10px] mt-1 font-bold ml-1">* ชื่อนี้ถูกใช้แล้ว</p>}
              </div>

              {/* Email */}
              <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">อีเมล (Email)</label>
                <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                  <Mail size={20} className="text-gray-400 group-focus-within:text-[#1a4d2e]" />
                  <input type="text" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">ชื่อจริง</label>
                <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300" placeholder="ชื่อจริง" />
                </div>
              </div>
              <div className="group">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">นามสกุล</label>
                <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300" placeholder="นามสกุล" />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="text-xs font-black text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">เบอร์โทรศัพท์</label>
              <div className="flex items-center gap-3 bg-gray-50/50 hover:bg-white border border-gray-200 group-hover:border-[#1a4d2e]/30 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-2 focus-within:ring-[#1a4d2e]/20 focus-within:bg-white focus-within:border-[#1a4d2e]">
                <Phone size={20} className="text-gray-400 group-focus-within:text-[#1a4d2e]" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300" placeholder="0xxxxxxxxx" />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">ที่อยู่จัดส่งสินค้า</label>
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
                <textarea rows="2" name="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} className="bg-transparent w-full outline-none text-sm font-bold text-gray-700 resize-none placeholder-gray-300" placeholder="ที่อยู่จัดส่งสินค้า..."></textarea>
              </div>
            </div>

            {/* Change Password Toggle */}
            <div className="pt-4">
              <button type="button" onClick={() => setShowPasswordChange(!showPasswordChange)} className="text-[#1a4d2e] text-sm font-black flex items-center gap-2 hover:underline">
                <Lock size={16} /> เปลี่ยนรหัสผ่าน
              </button>

              {showPasswordChange && (
                <div className="mt-4 p-6 bg-gray-50 border border-gray-200 rounded-3xl animate-in fade-in slide-in-from-top-4">
                  <h4 className="font-bold text-[#263A33] mb-4">เปลี่ยนรหัสผ่าน</h4>
                  <div className="space-y-4">
                    <input
                      type="password"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChangeInput}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a4d2e] outline-none text-sm"
                      placeholder="รหัสผ่านเดิม"
                    />

                    {/* New Password Group */}
                    <div>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChangeInput}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1a4d2e] outline-none text-sm"
                        placeholder="รหัสผ่านใหม่"
                      />
                      {/* Password Validation Feedback (Matches RegisterPage) */}
                      <div className="space-y-2 mt-2 ml-1">
                        <div className="flex gap-4">
                          <div className={`text-[10px] font-bold flex items-center gap-1 ${passwordCriteria.length ? 'text-green-500' : 'text-gray-400'}`}>
                            {passwordCriteria.length ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>} อย่างน้อย 6 ตัว
                          </div>
                          <div className={`text-[10px] font-bold flex items-center gap-1 ${passwordCriteria.number ? 'text-green-500' : 'text-gray-400'}`}>
                            {passwordCriteria.number ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-gray-400"></div>} มีตัวเลข
                          </div>
                        </div>
                        {passwordCriteria.special && (
                          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-2 py-1.5 rounded-lg border border-yellow-200 animate-in fade-in">
                            <div className="bg-yellow-100 p-0.5 rounded-full"><div className="text-[8px] font-black w-3 h-3 flex items-center justify-center">!</div></div>
                            <span className="text-[10px] font-bold">มีการใช้อักษรพิเศษ หรือ เว้นวรรค</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChangeInput}
                      className={`w-full px-4 py-3 rounded-xl border outline-none text-sm ${passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 focus:border-[#1a4d2e]'}`}
                      placeholder="ยืนยันรหัสผ่านใหม่"
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowPasswordChange(false)} className="px-4 py-2 text-sm text-gray-500 font-bold hover:bg-gray-200 rounded-lg">ยกเลิก</button>
                      <button type="button" onClick={handleChangePassword} disabled={passwordLoading} className="px-6 py-2 bg-[#1a4d2e] text-white text-sm font-bold rounded-xl hover:bg-[#143d24]">
                        {passwordLoading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 flex justify-center gap-4">
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="w-full md:w-auto px-10 py-4 bg-[#1a4d2e] text-white rounded-2xl font-black tracking-wide hover:bg-[#143d24] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                  <User size={20} /> แก้ไขข้อมูลโปรไฟล์
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => {
                    setIsEditing(false);
                    setPreviewImage(null);
                    // Reset form data to original user values
                    setFormData({
                      username: user.username || '',
                      first_name: user.first_name || '',
                      last_name: user.last_name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      address: user.address || ''
                    });
                  }} className="px-8 py-4 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-colors">
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
      {showMap && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#1a4d2e] text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><MapPin size={20} /> เลือกตำแหน่งที่อยู่</h3>
              <button onClick={() => setShowMap(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="flex-1 relative">
              {mapPosition && (
                <MapContainer center={mapPosition} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowMap(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={gpsLoading}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1a4d2e] hover:bg-[#143d24] transition-colors flex items-center gap-2"
              >
                {gpsLoading ? 'กำลังดึงที่อยู่...' : <><MapPin size={18} /> ยืนยันตำแหน่ง</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;