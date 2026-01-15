import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Mail, Shield, CheckCircle, XCircle, Edit, Save, X, Plus, Search, ChevronLeft, ChevronRight, Lock, Phone, MapPin, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function UserListAdmin() {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [editingUser, setEditingUser] = useState(null); // เก็บ user ที่กำลังแก้ไข
  const [formData, setFormData] = useState({}); // เก็บข้อมูลฟอร์ม
  
  // ✅ Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
=======
>>>>>>> 5342a4afd66d9b27d2fbd63c4893b854e9fba838

  // 🔍 Data Table State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ทั้งหมด'); // ทั้งหมด, staff, customer
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  // 🛠️ Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const activeToken = token || localStorage.getItem('token');
      // console.log("Fetching users with token:", activeToken); // Debug

      const response = await axios.get('http://localhost:8000/api/admin/users/', {
        headers: { Authorization: `Token ${activeToken}` }
      });

      console.log("Users Fetched:", response.data); // Debug
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("API did not return an array:", response.data);
        Swal.fire('Error', 'API Response Error (Not an Array)', 'error');
        setUsers([]);
      }

    } catch (error) {
      console.error("Error fetching users:", error);
      const status = error.response ? error.response.status : 'Unknown';
      const msg = error.response?.data?.error || error.message;

      Swal.fire({
        icon: 'error',
        title: `เกิดข้อผิดพลาด (${status})`,
        text: `ไม่สามารถดึงข้อมูลผู้ใช้งานได้: ${msg}`,
        footer: 'โปรดตรวจสอบ Console เพื่อดูรายละเอียดเพิ่มเติม'
      });

      if (error.response && error.response.status === 401) {
<<<<<<< HEAD
          logout(); // ✅ Auto logout on 401
=======
        logout();
>>>>>>> 5342a4afd66d9b27d2fbd63c4893b854e9fba838
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ==========================================
  // 🧹 Data Processing (Search, Sort, Filter)
  // ==========================================
  const filteredUsers = users.filter(user => {
    // 1. Role Filter
    if (filterRole === 'admin') {
      if (user.role_code !== 'admin') return false;
    } else if (filterRole === 'seller') {
      if (user.role_code !== 'seller') return false;
    } else if (filterRole === 'customer') {
      if (user.role_code !== 'customer') return false;
    } else if (filterRole === 'new_user') {
      if (user.role_code !== 'new_user') return false;
    }

    // 2. Search Term
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      (user.username || '').toLowerCase().includes(lowerSearch) ||
      (user.email || '').toLowerCase().includes(lowerSearch) ||
      (user.first_name || '').toLowerCase().includes(lowerSearch) ||
      (user.phone || '').toLowerCase().includes(lowerSearch)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle null/undefined
    if (!aValue) aValue = '';
    if (!bValue) bValue = '';

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ==========================================
  // 📝 Form Handlers
  // ==========================================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = (isCreate = false) => {
    if (isCreate) {
      if (!formData.username || !formData.email || !formData.password || !formData.role) {
        Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอก Username, Password, Email, Role ให้ครบถ้วน', 'warning');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        Swal.fire('รหัสผ่านไม่ตรงกัน', 'กรุณากรอกรหัสผ่านยืนยันให้ถูกต้อง', 'warning');
        return false;
      }
    }
    return true;
  };

  // ==========================================
  // 🚀 Actions (Create, Update, Delete)
  // ==========================================

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role_code,
      phone: user.phone === '-' ? '' : user.phone,
      first_name: user.first_name,
      last_name: user.last_name,
      address: user.address || '',
      is_active: user.is_active
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8000/api/admin/user/${editingUser.id}/update/`, formData, {
        headers: { Authorization: `Token ${token}` }
      });

      Swal.fire({
        icon: 'success',
        title: 'อัปเดตข้อมูลสำเร็จ',
        showConfirmButton: false,
        timer: 1500
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
        return;
      }
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.error || 'ไม่สามารถอัปเดตข้อมูลได้'
      });
    }
  };

<<<<<<< HEAD
  const handleToggleBlock = async (user) => {
      const isBlocked = !user.is_active;
      const actionText = isBlocked ? 'ปลดบล็อก' : 'ระงับการใช้งาน';
      
      const result = await Swal.fire({
          title: `ยืนยัน${actionText}?`,
          text: `คุณต้องการ${actionText}ผู้ใช้ "${user.username}" ใช่หรือไม่?`,
          icon: isBlocked ? 'success' : 'warning',
          showCancelButton: true,
          confirmButtonText: `ใช่, ${actionText}`,
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: isBlocked ? '#10B981' : '#EF4444',
          cancelButtonColor: '#94A3B8'
      });

      if (result.isConfirmed) {
          try {
              const token = localStorage.getItem('token');
              await axios.put(`http://localhost:8000/api/admin/user/${user.id}/update/`, {
                  is_active: isBlocked // True = Active (Unblock), False = Inactive (Block)
              }, {
                  headers: { Authorization: `Token ${token}` }
              });

              Swal.fire({
                  icon: 'success',
                  title: 'สำเร็จ!',
                  text: `${actionText}เรียบร้อยแล้ว`,
                  timer: 1500,
                  showConfirmButton: false
              });

              fetchUsers();
          } catch (error) {
              console.error(error);
              Swal.fire('Error', 'ไม่สามารถทำรายการได้', 'error');
          }
      }
  };

  // ✅ Filtering Logic
  const filteredUsers = users.filter(user => {
      const matchSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchRole = filterRole === 'all' || user.role_code === filterRole;
      
      const matchStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && user.is_active) || 
                          (filterStatus === 'inactive' && !user.is_active);
      
      return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm gap-4">
        <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="text-[#305949]" /> รายชื่อผู้ใช้งานในระบบ
            </h2>
            <span className="text-xs text-gray-500 font-medium ml-8">ทั้งหมด {users.length} คน</span>
        </div>
        
        {/* ✅ Filters Toolbar */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อ / อีเมล..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#305949] w-64 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
             </div>
             
             <div className="relative">
                <select 
                    className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#305949] appearance-none bg-white font-medium text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">ทุกบทบาท</option>
                    <option value="customer">ลูกค้า</option>
                    <option value="seller">ผู้ขาย</option>
                    <option value="admin">Admin</option>
                </select>
                <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
             </div>

             <div className="relative">
                <select 
                    className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#305949] appearance-none bg-white font-medium text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">ทุกสถานะ</option>
                    <option value="active">Active</option>
                    <option value="inactive">Blocked</option>
                </select>
                <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
             </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F8F9FA] text-gray-400 font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-6 pl-8">ผู้ใช้งาน</th>
              <th className="p-6">อีเมล</th>
              <th className="p-6">สถานะ</th>
              <th className="p-6 text-center">บทบาท</th>
              <th className="p-6 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">กำลังโหลด...</td></tr>
            ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
            ) : filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${!user.is_active ? 'bg-red-50/30' : ''}`}>
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {user.avatar ? <img src={`http://localhost:8000${user.avatar}`} className="w-full h-full object-cover" /> : <User className="p-1 w-full h-full text-gray-500"/>}
                    </div>
                    {user.username}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  <div className="flex items-center gap-2"><Mail size={14} /> {user.email}</div>
                </td>
                <td className="px-6 py-4">
                  {user.is_active ? (
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-100"><CheckCircle size={12} /> Active</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-100"><Shield size={12} /> Blocked</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.role_code === 'admin' || user.role_code === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* ✅ Block Button */}
                    <button
                        onClick={() => handleToggleBlock(user)}
                        className={`p-2 rounded-lg transition-colors ${user.is_active ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-green-500 hover:bg-green-50 hover:text-green-600'}`}
                        title={user.is_active ? "ระงับการใช้งาน (Block)" : "ปลดบล็อก (Unblock)"}
                    >
                        {user.is_active ? <Shield size={16} /> : <CheckCircle size={16} />}
                    </button>
                    
                    <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-500 hover:bg-blue-50 hover:text-blue-600 p-2 rounded-lg transition-colors"
                        title="แก้ไขข้อมูล"
                    >
                        <Edit size={16} />
                    </button>
                  </div>
                </td>
=======
  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: 'ยืนยันลบผู้ใช้งาน?',
      text: `ต้องการลบผู้ใช้ "${user.username}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบผู้ใช้งาน',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/admin/users/${user.id}/delete/`, {
          headers: { Authorization: `Token ${token}` }
        });
        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้งานถูกลบออกจากระบบแล้ว', 'success');
        fetchUsers();
      } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', error.response?.data?.error || 'ลบไม่สำเร็จ', 'error');
      }
    }
  };

  // ==========================================
  // 🎨 UI Components
  // ==========================================

  return (
    <div className="space-y-6 animate-fade-in font-['Prompt'] text-[#2c3e50] pb-20">

      {/* 🔹 Header & Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[#1a4d2e]">
            <User className="text-[#305949]" size={28} /> จัดการผู้ใช้งาน
          </h2>
          <p className="text-gray-400 text-sm mt-1">บริหารจัดการสมาชิก พนักงาน และผู้ดูแลระบบทั้งหมด</p>
        </div>
      </div>

      {/* 🔹 Filters & Search */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {['ทั้งหมด', 'admin', 'seller', 'customer', 'new_user'].map(role => (
            <button
              key={role}
              onClick={() => { setFilterRole(role); setCurrentPage(1); }}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterRole === role
                ? 'bg-white text-[#1a4d2e] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {role === 'ทั้งหมด' ? 'ทั้งหมด' :
                role === 'admin' ? 'ผู้ดูแลระบบ' :
                  role === 'seller' ? 'ผู้ขาย' :
                    role === 'customer' ? 'ลูกค้า' : 'สมาชิกใหม่'}
            </button>
          ))}
        </div>

        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="ค้นหา: ชื่อผู้ใช้, อีเมล, เบอร์โทร..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#1a4d2e] rounded-2xl outline-none font-medium transition-colors"
          />
        </div>
      </div>

      {/* 🔹 Data Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-600 font-bold text-sm uppercase tracking-wider">
              <tr>
                <th className="p-5 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('username')}>ชื่อผู้ใช้</th>
                <th className="p-5 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>อีเมล/เบอร์โทร</th>
                <th className="p-5 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role_code')}>บทบาท</th>
                <th className="p-5 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('is_active')}>สถานะ</th>
                <th className="p-5 text-right">จัดการ</th>
>>>>>>> 5342a4afd66d9b27d2fbd63c4893b854e9fba838
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
              ) : paginatedUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400">ไม่พบผู้ใช้งาน</td></tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${['admin', 'super_admin'].includes(user.role_code) ? 'bg-purple-500' :
                          user.role_code === 'seller' ? 'bg-orange-500' : 'bg-[#1a4d2e]'
                          }`}>
                          {user.avatar ? <img src={`http://localhost:8000${user.avatar}`} className="w-full h-full object-cover rounded-full" /> : user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{user.username}</div>
                          <div className="text-xs text-gray-400">{(user.first_name || user.last_name) ? `${user.first_name} ${user.last_name}` : '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={12} /> {user.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${user.role_code === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        user.role_code === 'seller' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        {user.role_code === 'admin' ? 'ผู้ดูแลระบบ' :
                          user.role_code === 'seller' ? 'ผู้ขาย' :
                            user.role_code === 'customer' ? 'ลูกค้าทั่วไป' :
                              user.role_code === 'new_user' ? 'สมาชิกใหม่' : 'ลูกค้าทั่วไป'}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100"><CheckCircle size={12} /> ใช้งานอยู่</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold border border-rose-100"><XCircle size={12} /> ระงับ</span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="แก้ไข">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(user)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="ลบ">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-3xl">
          <span className="text-xs font-bold text-gray-400">แสดงหน้า {currentPage} จาก {totalPages} ({sortedUsers.length} รายการ)</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-all font-bold text-sm flex items-center gap-1"
            >
              <ChevronLeft size={16} /> ก่อนหน้า
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-all font-bold text-sm flex items-center gap-1"
            >
              ถัดไป <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* =======================
          MODAL: Create User (Removed as per request)
         ======================= */}

      {/* =======================
          MODAL: Edit User 
         ======================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <Edit size={24} className="text-blue-600" /> แก้ไขข้อมูลผู้ใช้ ({editingUser.username})
              </h3>
              <button onClick={() => setEditingUser(null)} className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
<<<<<<< HEAD
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text" name="username"
                    value={formData.username} readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text" name="phone"
                    value={formData.phone} readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
=======

            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อผู้ใช้</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="input-field-custom bg-gray-100 text-gray-500 cursor-not-allowed" readOnly />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อจริง</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="input-field-custom bg-gray-100 text-gray-500 cursor-not-allowed" readOnly />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">อีเมล</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field-custom bg-gray-100 text-gray-500 cursor-not-allowed" readOnly />
                  </div>

                </div>

                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">บทบาท (Role)</label>
                    <select name="role" onChange={handleInputChange} value={formData.role} className="input-field-custom cursor-pointer appearance-none bg-white">
                      <option value="new_user">สมาชิกใหม่ (New User)</option>
                      <option value="customer">ลูกค้าทั่วไป (Customer)</option>
                      <option value="seller">ผู้ขาย (Seller)</option>
                      <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">นามสกุล</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="input-field-custom bg-gray-100 text-gray-500 cursor-not-allowed" readOnly />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="input-field-custom bg-gray-100 text-gray-500 cursor-not-allowed" readOnly />
                  </div>

>>>>>>> 5342a4afd66d9b27d2fbd63c4893b854e9fba838
                </div>
              </div>
              <div>
<<<<<<< HEAD
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email" name="email"
                  value={formData.email} readOnly
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                  <input
                    type="text" name="first_name"
                    value={formData.first_name} readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                  <input
                    type="text" name="last_name"
                    value={formData.last_name} readOnly
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
=======
                <label className="block text-sm font-bold text-gray-700 mb-1">ที่อยู่</label>
>>>>>>> 5342a4afd66d9b27d2fbd63c4893b854e9fba838
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
<<<<<<< HEAD
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed outline-none resize-none"
                />
=======
                  className="input-field-custom bg-gray-100 text-gray-500 cursor-not-allowed w-full resize-none"
                  readOnly
                ></textarea>
>>>>>>> 5342a4afd66d9b27d2fbd63c4893b854e9fba838
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-[#1a4d2e] rounded focus:ring-[#1a4d2e] border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  สถานะ Active (เปิดใช้งานบัญชี)
                </label>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-all">ยกเลิก</button>
                <button type="submit" className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                  <Save size={20} /> บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div >
      )
      }

    </div >
  );
}