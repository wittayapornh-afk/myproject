import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AdminActivityLogs() {
    const { token, logout } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            if (!activeToken) return;

            const response = await axios.get('http://localhost:8000/api/admin/logs/', {
                headers: { Authorization: `Token ${activeToken}` }
            });
            setLogs(response.data);
        } catch (error) {
            console.error("Fetch Logs Error", error);
            if (error.response && error.response.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Filter Logic
    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.admin.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || log.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Unique Categories for Dropdown
    const categories = ['All', ...new Set(logs.map(log => log.category))];

    const getCategoryColor = (cat) => {
        switch(cat) {
            case 'Product': return 'bg-blue-100 text-blue-800';
            case 'Order': return 'bg-green-100 text-green-800';
            case 'User': return 'bg-purple-100 text-purple-800';
            case 'Auth': return 'bg-gray-100 text-gray-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
             {/* Toolbar */}
             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 items-end xl:items-center">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">ค้นหากิจกรรม</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="ค้นหาการกระทำ / ชื่อแอดมิน..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e]" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="w-full xl:w-48">
                    <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">หมวดหมู่</label>
                    <div className="relative">
                        <select 
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none bg-white cursor-pointer" 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                    </div>
                </div>

                <button onClick={fetchLogs} className="w-full xl:w-auto h-[42px] px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center gap-2 transition-colors mt-auto">
                    <RefreshCw size={18}/>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200 text-sm">
                            <tr>
                                <th className="p-4 w-20">#ID</th>
                                <th className="p-4 w-40">วันที่/เวลา</th>
                                <th className="p-4 w-32">ผู้ดำเนินการ</th>
                                <th className="p-4 w-32">หมวดหมู่</th>
                                <th className="p-4">รายละเอียดกิจกรรม</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-12 text-center text-gray-500">กำลังโหลด...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="p-12 text-center text-gray-400">ไม่พบข้อมูลบันทึกกิจกรรม</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors text-sm">
                                        <td className="p-4 text-gray-400">#{log.id}</td>
                                        <td className="p-4 text-gray-600">{log.date}</td>
                                        <td className="p-4 font-bold text-[#1a4d2e]">{log.admin}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(log.category)}`}>
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-800">{log.action}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminActivityLogs;
