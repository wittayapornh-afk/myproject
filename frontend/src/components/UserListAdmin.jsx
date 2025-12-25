import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function UserListAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        // *Backend ต้องมี ViewSet สำหรับ User
        const response = await axios.get('http://localhost:8000/api/users/', {
            headers: { Authorization: `Token ${token}` }
        });
        setUsers(response.data);
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        setLoading(false);
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
              <th className="px-6 py-4 text-center">เป็นแอดมิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
                <tr><td colSpan="4" className="text-center py-8">กำลังโหลด...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                    <Mail size={14} /> {user.email}
                </td>
                <td className="px-6 py-4">
                    {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs"><CheckCircle size={12}/> Active</span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs"><XCircle size={12}/> Inactive</span>
                    )}
                </td>
                <td className="px-6 py-4 text-center">
                   {user.is_superuser || user.is_staff ? (
                      <Shield size={16} className="text-purple-600 mx-auto" />
                   ) : (
                      <span className="text-gray-300">-</span>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}