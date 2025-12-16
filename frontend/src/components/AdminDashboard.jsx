import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut, Store, Menu,
  Search, Plus, DollarSign, Edit, Trash2, X, Save, Image as ImageIcon,
  ChevronDown, Filter, Calendar, Tag
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]); // เก็บรายการหมวดหมู่
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); // State สำหรับกรองหมวดหมู่

  // Loading & Admin Check
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    title: '', category: '', price: '', stock: '', description: '', brand: ''
  });
  
  // Image States
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  // --- Initial Fetch ---
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Token ${token}` } };

      const [productsRes, ordersRes, catRes] = await Promise.all([
        axios.get('/api/admin/products/', config).catch(() => ({ data: [] })),
        axios.get('/api/admin/orders/', config).catch(() => ({ data: [] })),
        axios.get('/api/categories/').catch(() => ({ data: { categories: [] } }))
      ]);

      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      // กรอง "ทั้งหมด" ออกจากตัวเลือกใน Form (เพราะใน Form ไม่ควรมีคำว่าทั้งหมด)
      setCategories(catRes.data.categories.filter(c => c !== "ทั้งหมด"));

      try {
        const usersRes = await axios.get('/api/admin/users/', config);
        setUsers(usersRes.data);
        setIsAdmin(true);
      } catch (err) {}
      
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  // --- Helper: Status Colors ---
  const getStatusColor = (status) => {
    switch (status) {
        case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200 ring-amber-100';
        case 'Paid': return 'bg-blue-50 text-blue-600 border-blue-200 ring-blue-100';
        case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-200 ring-indigo-100';
        case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100';
        case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-200 ring-rose-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  // --- Modal Logic ---
  const openModal = async (product = null) => {
    setThumbnailFile(null); setThumbnailPreview(null);
    setGalleryFiles([]); setGalleryPreviews([]);
    setExistingGallery([]); setDeletedImageIds([]);

    if (product) {
        setCurrentProduct(product);
        setFormData({
            title: product.title, category: product.category, price: product.price,
            stock: product.stock, description: product.description || '', brand: product.brand || ''
        });
        if (product.thumbnail) setThumbnailPreview(product.thumbnail);
        try {
            const res = await axios.get(`/api/products/${product.id}/`);
            setExistingGallery(res.data.images || []);
        } catch (err) { console.error("Error loading gallery"); }
    } else {
        setCurrentProduct(null);
        setFormData({ title: '', category: '', price: '', stock: '', description: '', brand: '' });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles([...galleryFiles, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  const removeGalleryPreview = (index) => {
    const newFiles = [...galleryFiles]; newFiles.splice(index, 1); setGalleryFiles(newFiles);
    const newPreviews = [...galleryPreviews]; URL.revokeObjectURL(newPreviews[index]); newPreviews.splice(index, 1); setGalleryPreviews(newPreviews);
  };

  const markImageForDeletion = (id) => {
    setDeletedImageIds([...deletedImageIds, id]);
    setExistingGallery(existingGallery.filter(img => img.id !== id));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' } };
    
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (thumbnailFile) data.append('thumbnail', thumbnailFile);
    galleryFiles.forEach(file => data.append('new_gallery_images', file));
    deletedImageIds.forEach(id => data.append('delete_image_ids', id));

    try {
        if (currentProduct) {
            await axios.put(`/api/products/${currentProduct.id}/edit/`, data, config);
            Swal.fire('สำเร็จ', 'แก้ไขข้อมูลสินค้าเรียบร้อย', 'success');
        } else {
            await axios.post(`/api/products/add/`, data, config);
            Swal.fire('สำเร็จ', 'เพิ่มสินค้าใหม่เรียบร้อย', 'success');
        }
        setIsModalOpen(false);
        fetchData();
    } catch (err) {
        Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    const res = await Swal.fire({ title: 'ยืนยันการลบ?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบเลย', confirmButtonColor: '#d33' });
    if (res.isConfirmed) {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/products/${id}/delete/`, { headers: { Authorization: `Token ${token}` } });
            setProducts(products.filter(p => p.id !== id));
            Swal.fire('Deleted!', 'ลบสินค้าแล้ว', 'success');
        } catch (err) { Swal.fire('Error', 'ลบไม่ได้', 'error'); }
    }
  };

  const handleOrderStatusUpdate = async (id, status) => {
      const token = localStorage.getItem('token');
      try {
        await axios.post(`/api/orders/${id}/update/`, { status }, { headers: { Authorization: `Token ${token}` } });
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, timerProgressBar: true });
        Toast.fire({ icon: 'success', title: `สถานะออเดอร์ #${id} เปลี่ยนเป็น ${status}` });
      } catch (err) {
        Swal.fire('Error', 'อัปเดตสถานะไม่สำเร็จ', 'error');
      }
  };

  // --- Filter Logic ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => o.id.toString().includes(searchTerm) || o.customer.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatCurrency = (val) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
  
  const chartData = {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
    datasets: [{
        label: 'ยอดขาย (บาท)',
        data: [12000, 19000, 15000, 25000, 22000, orders.reduce((a,b)=>a+(parseFloat(b.total_price)||0),0)],
        borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.1)', fill: true, tension: 0.4,
    }],
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
      <Icon size={20} />{isSidebarOpen && <span className="font-medium">{label}</span>}
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-100 flex-shrink-0 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-50">
           <Store size={28} className="text-indigo-600"/> {isSidebarOpen && <span className="text-xl font-bold ml-2 text-gray-800">MY<span className="text-indigo-600">SHOP</span></span>}
        </div>
        <div className="flex-1 p-3 space-y-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="ภาพรวมระบบ" />
          <SidebarItem id="products" icon={Package} label="จัดการสินค้า" />
          <SidebarItem id="orders" icon={ShoppingCart} label="คำสั่งซื้อ" />
          {isAdmin && <SidebarItem id="users" icon={Users} label="ผู้ใช้งาน" />}
        </div>
        <div className="p-4 border-t"><button onClick={() => window.location.href='/'} className="flex items-center space-x-3 w-full p-2 text-gray-600 hover:text-red-500 transition-colors"><LogOut size={20}/>{isSidebarOpen && <span>ออกจากระบบ</span>}</button></div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <header className="bg-white h-20 border-b flex items-center justify-between px-8 shadow-sm z-10">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu size={20}/></button>
              <h2 className="text-xl font-bold text-gray-800 capitalize tracking-tight">{activeTab}</h2>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/><input type="text" placeholder="ค้นหาข้อมูล..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all w-64"/></div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">AD</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[{t:'รายได้รวม',v:formatCurrency(orders.reduce((a,b)=>a+(parseFloat(b.total_price)||0),0)),i:DollarSign,c:'bg-emerald-500'},{t:'ออเดอร์',v:orders.length,i:ShoppingCart,c:'bg-blue-500'},{t:'สินค้า',v:products.length,i:Package,c:'bg-violet-500'},{t:'ลูกค้า',v:users.length,i:Users,c:'bg-orange-500'}].map((s,i)=>(
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-all group">
                            <div><p className="text-gray-500 text-sm font-medium">{s.t}</p><h3 className="text-3xl font-bold text-gray-800 mt-1">{s.v}</h3></div>
                            <div className={`p-4 rounded-2xl text-white shadow-lg ${s.c} group-hover:scale-110 transition-transform`}>{React.createElement(s.i, {size: 24})}</div>
                        </div>
                    ))}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
                    <Line data={chartData} options={{maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{grid:{borderDash:[4,4]}},x:{grid:{display:false}}}}} />
                </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
               <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50/30 gap-4">
                  <h3 className="font-bold text-lg text-gray-800">สินค้าทั้งหมด ({filteredProducts.length})</h3>
                  
                  <div className="flex gap-3">
                      {/* ✅ Category Filter Dropdown */}
                      <div className="relative">
                          <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer hover:border-indigo-300 transition-colors"
                          >
                              <option value="All">หมวดหมู่ทั้งหมด</option>
                              {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                          </select>
                          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>

                      <button onClick={() => openModal()} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
                        <Plus size={18}/> เพิ่มสินค้า
                      </button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b uppercase text-xs"><tr><th className="p-4">รูปภาพ</th><th className="p-4">ชื่อสินค้า</th><th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th><th className="p-4">สต็อก</th><th className="p-4 text-center">จัดการ</th></tr></thead>
                    <tbody className="divide-y">
                        {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4"><img src={p.thumbnail || `${p.image}`} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border shadow-sm"/></td>
                            <td className="p-4 font-medium text-gray-800">{p.title}</td>
                            <td className="p-4"><span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium inline-flex items-center"><Tag size={10} className="mr-1"/>{p.category}</span></td>
                            <td className="p-4 font-medium text-gray-700">{formatCurrency(p.price)}</td>
                            <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock>10?'bg-emerald-50 text-emerald-600': p.stock>0?'bg-amber-50 text-amber-600':'bg-rose-50 text-rose-600'}`}>{p.stock} ชิ้น</span></td>
                            <td className="p-4 text-center">
                                <div className="flex justify-center gap-2">
                                    <button onClick={() => openModal(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={18}/></button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
               </div>
            </div>
          )}

          {activeTab === 'orders' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
               <div className="p-6 border-b bg-gray-50/30 flex justify-between items-center">
                   <h3 className="font-bold text-lg text-gray-800">รายการคำสั่งซื้อล่าสุด</h3>
                   <div className="flex gap-2"><button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Filter size={18}/></button></div>
               </div>
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b uppercase text-xs"><tr><th className="p-4">Order ID</th><th className="p-4">ลูกค้า</th><th className="p-4">วันที่</th><th className="p-4">ยอดรวม</th><th className="p-4">สถานะ</th></tr></thead>
                  <tbody className="divide-y">
                    {filteredOrders.map(o => (
                       <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-indigo-600">#{o.id}</td>
                          <td className="p-4 font-medium text-gray-700">{o.customer}</td>
                          <td className="p-4 text-gray-500 flex items-center gap-1"><Calendar size={14}/> {o.date}</td>
                          <td className="p-4 font-bold text-gray-900">{formatCurrency(o.total_price)}</td>
                          <td className="p-4">
                             <div className="relative inline-block w-40">
                                <select 
                                    value={o.status} 
                                    onChange={(e)=>handleOrderStatusUpdate(o.id, e.target.value)} 
                                    className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 transition-all ${getStatusColor(o.status)}`}
                                >
                                    <option value="Pending">🟡 รอดำเนินการ</option>
                                    <option value="Paid">🔵 จ่าย</option>
                                    <option value="Shipped">🟣 จัดส่งแล้ว</option>
                                    <option value="Completed">🟢 เสร็จสิ้น</option>
                                    <option value="Cancelled">🔴 ยกเลิก</option>
                                </select>
                                <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${getStatusColor(o.status).split(' ')[1]}`} />
                             </div>
                          </td>
                       </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          )}
        </div>
      </main>

      {/* Product Modal with Datalist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800">{currentProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label">ชื่อสินค้า</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="input-field" placeholder="เช่น iPhone 15 Pro Max"/>
                        </div>
                        <div>
                            <label className="label">หมวดหมู่</label>
                            {/* ✅ Datalist for Add/Edit Form */}
                            <input 
                                list="category-options" 
                                type="text" 
                                name="category" 
                                required 
                                value={formData.category} 
                                onChange={handleInputChange} 
                                className="input-field" 
                                placeholder="เลือกหรือพิมพ์ใหม่..."
                            />
                            <datalist id="category-options">
                                {categories.map((cat, idx) => (
                                    <option key={idx} value={cat} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="label">แบรนด์</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="input-field" placeholder="เช่น Apple"/>
                        </div>
                        <div>
                            <label className="label">ราคา (บาท)</label>
                            <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className="input-field" />
                        </div>
                        <div>
                            <label className="label">สต็อก (ชิ้น)</label>
                            <input type="number" name="stock" required value={formData.stock} onChange={handleInputChange} className="input-field" />
                        </div>
                        <div className="col-span-2">
                            <label className="label">รายละเอียดสินค้า</label>
                            <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="input-field"></textarea>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><ImageIcon size={18}/> จัดการรูปภาพ</h4>
                        <div className="mb-4">
                            <label className="label">รูปภาพหลัก (Thumbnail)</label>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                                    {thumbnailPreview ? <img src={thumbnailPreview} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">No Image</span>}
                                </div>
                                <input type="file" onChange={handleThumbnailChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            </div>
                        </div>
                        <div>
                            <label className="label">รูปภาพเพิ่มเติม (Gallery)</label>
                            <input type="file" multiple onChange={handleGalleryChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-3"/>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {existingGallery.map((img) => (
                                    <div key={img.id} className="relative group w-full h-20 bg-gray-100 rounded-lg overflow-hidden border">
                                        <img src={img.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"/>
                                        <button type="button" onClick={() => markImageForDeletion(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"><X size={12}/></button>
                                    </div>
                                ))}
                                {galleryPreviews.map((src, index) => (
                                    <div key={index} className="relative group w-full h-20 bg-indigo-50 rounded-lg overflow-hidden border border-indigo-200">
                                        <img src={src} className="w-full h-full object-cover"/>
                                        <button type="button" onClick={() => removeGalleryPreview(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black"><X size={12}/></button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[10px] px-1 text-center">New</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium flex items-center gap-2 shadow-md hover:shadow-indigo-200 transition-all"><Save size={18}/> บันทึกข้อมูล</button>
                    </div>
                </form>
            </div>
        </div>
      )}
      <style>{`.input-field { width: 100%; px: 4px; py: 2px; border-radius: 0.75rem; border: 1px solid #e2e8f0; outline: none; transition: all; background-color: #f8fafc; } .input-field:focus { box-shadow: 0 0 0 2px #e0e7ff; border-color: #6366f1; background-color: #fff; } .label { display: block; font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem; } @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }`}</style>
    </div>
  );
};

export default AdminDashboard;