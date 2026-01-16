import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Mail, Shield, CheckCircle, XCircle, Edit, Save, X, Plus, Search, ChevronLeft, ChevronRight, Lock, Phone, MapPin, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL } from '../config';

export default function UserListAdmin() {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const response = await axios.get(`${API_BASE_URL}/api/admin/users/`, {
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
        // logout(); // ❌ Don't auto-logout loops
        console.warn("Unauthorized: Please login again.");
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
      if (user.role !== 'admin') return false;
    } else if (filterRole === 'seller') {
      if (user.role !== 'seller') return false;
    } else if (filterRole === 'customer') {
      if (user.role !== 'customer') return false;
    } else if (filterRole === 'new_user') {
      if (user.role !== 'new_user') return false;
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
      role: user.role,
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
      await axios.put(`${API_BASE_URL}/api/admin/user/${editingUser.id}/update/`, formData, {
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

        await axios.delete(`http://localhost:8000/api/admin/user/${user.id}/delete/`, {
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
                <th className="p-5 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>บทบาท</th>
                <th className="p-5 text-center cursor-pointer hover:bg-gray-100" onClick={() => handleSort('is_active')}>สถานะ</th>
                <th className="p-5 text-right">จัดการ</th>
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${['admin', 'super_admin'].includes(user.role) ? 'bg-purple-500' :
                          user.role === 'seller' ? 'bg-orange-500' : 'bg-[#1a4d2e]'
                          }`}>
                          {user.avatar ? <img src={`${API_BASE_URL}${user.avatar}`} className="w-full h-full object-cover rounded-full" /> : user.username[0].toUpperCase()}
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
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        user.role === 'seller' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                        {user.role === 'admin' ? 'ผู้ดูแลระบบ' :
                          user.role === 'seller' ? 'ผู้ขาย' :
                            user.role === 'customer' ? 'ลูกค้าทั่วไป' :
                              user.role === 'new_user' ? 'สมาชิกใหม่' : 'ลูกค้าทั่วไป'}
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

                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ที่อยู่</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="input-field-custom bg-gray-100 text-gray-500 cursor-not-allowed w-full resize-none"
                  readOnly
                ></textarea>
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