import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Package, Eye, X, MapPin, Phone, User, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/formatUtils';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminOrderList() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
        const res = await fetch(`http://localhost:8000/api/admin/orders_v2/`, {
        headers: { 'Authorization': `Token ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
    } catch(err) {
        console.error(err);
        setOrders([]);
    }
  };

  const fetchOrderDetails = async (orderId) => {
      setLoadingDetails(true);
      try {
          const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/`, {
              headers: { 'Authorization': `Token ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setSelectedOrder(data);
              setShowModal(true);
          } else {
              Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้', 'error');
          }
      } catch (error) {
          console.error(error);
          Swal.fire('Error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
      } finally {
          setLoadingDetails(false);
      }
  };

  // ✅ Rule 7: ฟังก์ชันเปลี่ยนสถานะออเดอร์ (Update Status)
  const updateStatus = async (orderId, newStatus) => {
    const res = await fetch(`http://localhost:8000/api/admin/orders/${orderId}/`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      Swal.fire({ icon: 'success', title: 'อัปเดตสถานะแล้ว', toast: true, position: 'top-right', timer: 1500, showConfirmButton: false });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  // ✅ Rule 39: Filter & Search
  const filteredOrders = orders.filter(o => 
    (filterStatus === 'all' || o.status.toLowerCase() === filterStatus.toLowerCase()) &&
    (o.id.toString().includes(searchTerm) || o.customer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <Package size={32} className="text-[#1a4d2e]"/> การจัดการคำสั่งซื้อ
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="ค้นหา Order ID หรือ ชื่อลูกค้า..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white px-6 py-3 rounded-2xl border-none shadow-sm font-bold text-gray-600 outline-none"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="pending">รอตรวจสอบ</option>
            <option value="paid">ชำระแล้ว</option>
            <option value="shipped">จัดส่งแล้ว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">ลูกค้า</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">ยอดรวม</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-black">#{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.tel}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.date)}</td>
                  <td className="px-6 py-4 font-black text-[#1a4d2e]">{formatPrice(order.total_price)}</td>
                  <td className="px-6 py-4">
                    {/* ✅ Rule 7: Dropdown เปลี่ยนสถานะพร้อมสี */}
                    <select 
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-black outline-none border-none cursor-pointer ${
                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' : 
                        order.status === 'Paid' ? 'bg-green-50 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      <option value="Pending">รอตรวจสอบ</option>
                      <option value="Paid">ชำระแล้ว</option>
                      <option value="Shipped">จัดส่งแล้ว</option>
                      <option value="Cancelled">ยกเลิก</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => fetchOrderDetails(order.id)}
                        className="p-2 bg-gray-100 rounded-xl text-gray-600 hover:bg-[#1a4d2e] hover:text-white transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Details Modal */}
        <AnimatePresence>
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-[1001] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                                    <Package className="text-[#1a4d2e]" /> Order #{selectedOrder.id}
                                </h2>
                                <p className="text-sm text-gray-500 font-bold mt-1">
                                    สั่งซื้อเมื่อ: {formatDate(selectedOrder.date)}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={16} /> ข้อมูลลูกค้า
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                                        <p className="font-bold text-gray-800 text-lg">{selectedOrder.customer}</p>
                                        <p className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                            <Phone size={14} /> {selectedOrder.tel || '-'}
                                        </p>
                                        <p className="flex items-start gap-2 text-gray-600 text-sm font-medium">
                                            <MapPin size={14} className="mt-0.5 shrink-0" /> 
                                            {selectedOrder.province || 'ไม่มีที่อยู่จัดส่ง'}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Status & Payment */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard size={16} /> สถานะการชำระเงิน
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-500">สถานะ:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                                selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 
                                                selectedOrder.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="text-sm font-bold text-gray-500">ยอดรวมทั้งสิ้น:</span>
                                            <span className="text-xl font-black text-[#1a4d2e]">{formatPrice(selectedOrder.total_price)}</span>
                                        </div>
                                        {selectedOrder.slip_image && (
                                            <div className="mt-2">
                                                <p className="text-xs font-bold text-gray-400 mb-2">หลักฐานการโอนเงิน:</p>
                                                <a href={selectedOrder.slip_image.startsWith('http') ? selectedOrder.slip_image : `http://localhost:8000${selectedOrder.slip_image}`} target="_blank" rel="noreferrer">
                                                    <img 
                                                        src={selectedOrder.slip_image.startsWith('http') ? selectedOrder.slip_image : `http://localhost:8000${selectedOrder.slip_image}`} 
                                                        alt="Slip" 
                                                        className="w-full h-32 object-cover rounded-xl border border-gray-200 hover:scale-105 transition-transform"
                                                    />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShoppingBag size={16} /> รายการสินค้า ({selectedOrder.items?.length || 0})
                                </h3>
                                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                                            <tr>
                                                <th className="p-4">สินค้า</th>
                                                <th className="p-4 text-center">ราคา/หน่วย</th>
                                                <th className="p-4 text-center">จำนวน</th>
                                                <th className="p-4 text-right">รวม</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                                 {item.product_image ? (
                                                                     <img src={item.product_image.startsWith('http') ? item.product_image : `http://localhost:8000${item.product_image}`} className="w-full h-full object-cover" alt="" />
                                                                 ) : (
                                                                     <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20}/></div>
                                                                 )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.product}</p>
                                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center text-sm font-medium text-gray-600">
                                                        {formatPrice(item.price)}
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-gray-800">
                                                        x {item.quantity}
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-[#1a4d2e]">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        {/* Total Footer */}
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan="3" className="p-4 text-right font-bold text-gray-400 text-xs">ยอดสินค้ารวม:</td>
                                                <td className="p-4 text-right font-bold text-gray-600">{formatPrice(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" className="p-2 text-right font-bold text-gray-400 text-xs border-none pt-0">ค่าจัดส่ง:</td>
                                                <td className="p-2 text-right font-bold text-gray-600 border-none pt-0">{formatPrice(50)}</td>
                                            </tr>
                                            {selectedOrder.discount_amount > 0 && (
                                                <tr>
                                                    <td colSpan="3" className="p-2 text-right font-bold text-gray-400 text-xs border-none pt-0">ส่วนลด:</td>
                                                    <td className="p-2 text-right font-bold text-green-600 border-none pt-0">- {formatPrice(selectedOrder.discount_amount)}</td>
                                                </tr>
                                            )}
                                            <tr className="border-t border-gray-200">
                                                <td colSpan="3" className="p-4 text-right font-black text-gray-800 text-lg">ยอดสุทธิ:</td>
                                                <td className="p-4 text-right font-black text-[#1a4d2e] text-lg">{formatPrice(selectedOrder.total_price)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                             <button 
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors"
                             >
                                 ปิดหน้าต่าง
                             </button>
                             {selectedOrder.status === 'Pending' && (
                                 <button 
                                    onClick={() => updateStatus(selectedOrder.id, 'Paid')}
                                    className="px-6 py-2.5 rounded-xl bg-[#1a4d2e] text-white font-bold hover:bg-[#143d24] shadow-lg shadow-green-900/20 transition-all active:scale-95"
                                 >
                                     ยืนยันการชำระเงิน
                                 </button>
                             )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}