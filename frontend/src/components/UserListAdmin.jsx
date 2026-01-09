import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, CheckCircle, XCircle, Edit, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext'; // ✅ Import useAuth

export default function UserListAdmin() {
  const { token, logout } = useAuth(); // ✅ Use context
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // เก็บ user ที่กำลังแก้ไข
  const [formData, setFormData] = useState({}); // เก็บข้อมูลฟอร์ม

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const activeToken = token || localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/users/', {
        headers: { Authorization: `Token ${activeToken}` }
      });
      setUsers(data => response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response && error.response.status === 401) {
          logout(); // ✅ Auto logout on 401
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      fetchUsers(); // รีโหลดข้อมูลใหม่
    } catch (error) {
      console.error("Update error object:", error);
      console.error("Response data:", error.response?.data);

      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: 'เซสชั่นหมดอายุ',
          text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          window.location.href = '/login'; // Redirect to login
        });
        return;
      }

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.error || error.response?.data?.detail || 'ไม่สามารถอัปเดตข้อมูลได้'
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <User className="text-[#305949]" /> รายชื่อผู้ใช้งานในระบบ
        </h2>
        <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
          ทั้งหมด: {users.length} คน
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">ผู้ใช้งาน</th>
              <th className="px-6 py-4">อีเมล</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4 text-center">บทบาท</th>
              <th className="px-6 py-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">กำลังโหลด...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                  <Mail size={14} /> {user.email}
                </td>
                <td className="px-6 py-4">
                  {user.is_active ? (
                    <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs"><CheckCircle size={12} /> Active</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs"><XCircle size={12} /> Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${user.role_code === 'admin' || user.role_code === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit size={18} className="text-blue-600" /> แก้ไขข้อมูลผู้ใช้
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text" name="username"
                    value={formData.username} onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text" name="phone"
                    value={formData.phone} onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email" name="email"
                  value={formData.email} onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง</label>
                  <input
                    type="text" name="first_name"
                    value={formData.first_name} onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                  <input
                    type="text" name="last_name"
                    value={formData.last_name} onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท (Role)</label>
                <select
                  name="role"
                  value={formData.role} onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="new_user">New User (ผู้ใช้ทั่วไป)</option>
                  <option value="customer">Customer (ลูกค้า)</option>
                  <option value="seller">Seller (ผู้ขาย)</option>
                  <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                  สถานะ Active (เปิดใช้งาน)
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-2">
                  <Save size={16} /> บันทึกการเปลี่ยนแปลง
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