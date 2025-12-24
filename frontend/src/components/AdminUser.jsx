import React, { useState } from 'react';
import { User, Mail, Shield, MoreVertical } from 'lucide-react';

export default function AdminUsers() {
  // Mock Data (เชื่อม API ได้ภายหลัง)
  const [users, setUsers] = useState([
    { id: 1, name: 'admin527', email: 'admin@shop.com', role: 'Super Admin', status: 'Active', joinDate: '2025-01-01' },
    { id: 2, name: 'Somchai Jaidee', email: 'somchai@gmail.com', role: 'Customer', status: 'Active', joinDate: '2025-02-14' },
    { id: 3, name: 'Alice Smith', email: 'alice@hotmail.com', role: 'Customer', status: 'Inactive', joinDate: '2025-03-10' },
  ]);

  return (
    <div className="p-6 bg-[#f4f4f0] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้งาน (Users)</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-500">
          ผู้ใช้ทั้งหมด: <span className="font-bold text-[#1a4d2e] text-lg">{users.length}</span> คน
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">ผู้ใช้งาน</th>
              <th className="px-6 py-3">บทบาท (Role)</th>
              <th className="px-6 py-3">วันที่สมัคร</th>
              <th className="px-6 py-3 text-center">สถานะ</th>
              <th className="px-6 py-3 text-right">ตัวเลือก</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Shield size={16} className={user.role === 'Super Admin' ? 'text-purple-600' : 'text-gray-400'} />
                    {user.role}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.joinDate}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}