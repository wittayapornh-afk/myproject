import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, Plus, Trash2, Search, X, Check, ChevronLeft, ChevronRight, 
  Filter, Package, Layers, LayoutGrid, List, MoreHorizontal, 
  Edit2, Lightbulb, Zap, ShoppingBag, AlertCircle, Gift, Star,
  Settings, ArrowRight, Activity, Percent, SlidersHorizontal, DollarSign, Box, Hash,
  Sparkles, Slash, Award, Clock
} from 'lucide-react';
import { getImageUrl } from '../utils/formatUtils';

/**
 * 🏢 Enterprise Tag Management System (Thai Localized)
 * Version 2.2 - Simplified & Enhanced Filters
 * 
 * Changes:
 * - Removed Expiration Date (Calendar)
 * - Added Advanced Product Filters (Price, Stock)
 * - Refined Layout
 */
function TagManagement() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'automation'
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [tagGroup, setTagGroup] = useState('ทั่วไป');
  const [tagColor, setTagColor] = useState('#6366f1');
  const [tagIcon, setTagIcon] = useState('Tag');

  // ✅ Missing State Fix
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [existingGroups, setExistingGroups] = useState(['General', 'Status', 'Promotion', 'Event', 'Campaign']); 
  
  // Product States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Basic Filter & Search
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');
  
  // 🔍 Advanced Filters (New)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [quickFilter, setQuickFilter] = useState('all'); // ⚡ New Quick Filter State

  // Automation Rule States
  const [automationRules, setAutomationRules] = useState([
    { id: 1, name: 'Best Seller (🏆)', condition: 'ยอดขาย > 50 ใน 30 วัน', action: 'เพิ่มป้าย: Best Seller', active: true, icon: <Star size={24} /> },
    { id: 2, name: 'Hot Selling (🔥)', condition: 'ยอดขาย > 10 ใน 2 วัน', action: 'เพิ่มป้าย: Hot Selling', active: true, icon: <Zap size={24} /> },
    { id: 3, name: 'Last Chance (⌛)', condition: 'สต็อก < 5', action: 'เพิ่มป้าย: Last Chance', active: true, icon: <AlertCircle size={24} /> },
    { id: 4, name: 'New Arrival (🆕)', condition: 'สร้างไม่เกิน 7 วัน', action: 'เพิ่มป้าย: New Arrival', active: true, icon: <Sparkles size={24} /> },
    { id: 5, name: 'On Sale (🏷️)', condition: 'ราคาลดจากราคาปกติ', action: 'เพิ่มป้าย: On Sale', active: true, icon: <Percent size={24} /> },
    { id: 6, name: 'Flash Sale (⚡)', condition: 'อยูในแคมเปญ Flash Sale', action: 'เพิ่มป้าย: Flash Sale', active: true, icon: <Activity size={24} /> },
    { id: 7, name: 'Out of Stock (❌)', condition: 'สินค้าหมดสต็อก', action: 'เพิ่มป้าย: Out of Stock', active: true, icon: <Slash size={24} /> },
  ]);
  const [automationStats, setAutomationStats] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const API_BASE = 'http://localhost:8000';

  // ==========================================
  // 🔄 Fetch Data
  // ==========================================
  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/tags/`);
      setTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/admin/products/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/categories/`);
      const rawCategories = response.data.categories || [];
      setCategories(['ทั้งหมด', ...rawCategories]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // ✅ Reset filters when opening/closing modal
  const resetProductFilters = () => {
    setProductSearchTerm('');
    setCategoryFilter('ทั้งหมด');
    setPriceRange({ min: '', max: '' });
    setStockFilter('all');
    setQuickFilter('all');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [productSearchTerm, categoryFilter, priceRange, stockFilter, quickFilter]);

  useEffect(() => {
    fetchTags();
    fetchProducts();
    fetchCategories();
  }, []);

  // ==========================================
  // ➕ Create Tag
  // ==========================================
  // ==========================================
  // ➕ Create & Edit Tag
  // ==========================================
  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setNewTagName(tag.name);
    setTagGroup(tag.group_name || 'ทั่วไป');
    setTagColor(tag.color || '#6366f1');
    setTagIcon(tag.icon || 'Tag');
    
    // ✅ Reset product filters for a clean start
    resetProductFilters();
    
    // ✅ Pre-select products that have this tag
    const productsWithTag = products.filter(p => p.tags && p.tags.some(t => t.id == tag.id)).map(p => p.id);
    setSelectedProducts(productsWithTag);
    
    setShowCreateModal(true);
  };

  const handleSaveTag = async () => {
    if (!newTagName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'ระบุข้อมูลไม่ครบ',
        text: 'กรุณาระบุชื่อป้ายกำกับ',
        confirmButtonColor: '#312e81'
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = { 
        name: newTagName.trim(),
        group_name: tagGroup,
        color: tagColor,
        icon: tagIcon
      };
      let tagId;

      if (selectedTag) {
        // ✅ Update Existing Tag
        await axios.put(`${API_BASE}/api/tags/${selectedTag.id}/`, payload, {
             headers: { Authorization: `Token ${token}` }
        });
        tagId = selectedTag.id;
      } else {
        // ✅ Create New Tag
        const res = await axios.post(`${API_BASE}/api/tags/`, payload, {
            headers: { Authorization: `Token ${token}` }
        });
        tagId = res.data.id;
      }
      
      // ✅ 3. Optimized Bulk Assignment (Diff sync)
      const currentlyTaggedIds = products.filter(p => hasTag(p, tagId)).map(p => p.id);
      const toAdd = selectedProducts.filter(id => !currentlyTaggedIds.includes(id));
      const toRemove = currentlyTaggedIds.filter(id => !selectedProducts.includes(id));

      if (toAdd.length > 0) {
        await axios.post(`${API_BASE}/api/products/bulk-update-tags/`, {
          product_ids: toAdd,
          tag_id: tagId,
          action: 'add'
        }, { headers: { Authorization: `Token ${token}` } });
      }

      if (toRemove.length > 0) {
        await axios.post(`${API_BASE}/api/products/bulk-update-tags/`, {
          product_ids: toRemove,
          tag_id: tagId,
          action: 'remove'
        }, { headers: { Authorization: `Token ${token}` } });
      }
      
      setNewTagName('');
      setTagGroup('ทั่วไป');
      setTagColor('#6366f1');
      setTagIcon('Tag');
      setSelectedProducts([]);
      setSelectedTag(null);
      resetProductFilters();
      setShowCreateModal(false);
      await fetchTags();
      await fetchProducts();
      
      Swal.fire({
        icon: 'success',
        title: selectedTag ? 'บันทึกแก้ไขเรียบร้อย' : 'สร้างป้ายกำกับสำเร็จ',
        text: `อัปเดตสินค้าเรียบร้อยแล้ว`,
        timer: 1500,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🤖 Backend Automation Call
  // ==========================================
  const runAutomation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_BASE}/api/tags/automation/run/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setAutomationStats(response.data.statistics);
      await fetchTags();
      await fetchProducts();
      
      Swal.fire({
          icon: 'success',
          title: 'ประมวลผลสมาร์ทแท็กสำเร็จ',
          html: `
            <div class="text-left mt-4 space-y-2">
              <p class="font-bold text-lg mb-2">อัปเดตไปทั้งหมด: ${response.data.updated_count} รายการ</p>
              ${Object.entries(response.data.statistics).map(([name, count]) => `
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-gray-600">${name}</span>
                  <span class="font-bold text-indigo-600">${count} ชิ้น</span>
                </div>
              `).join('')}
            </div>
          `,
          confirmButtonColor: '#312e81'
      });

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการรันระบบอัตโนมัติที่ Server', 'error');
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // 📦 Selection & Filter Logic
  // ==========================================
  const toggleProduct = (productId) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  
  // ✅ Improved Select All: เลือกเฉพาะที่แสดงผลจากการ Filter
  const handleSelectToggle = () => {
     const filtered = getFilteredProducts();
     const allSelected = filtered.every(p => selectedProducts.includes(p.id));
     
     if (allSelected) {
        // ถ้าเลือกครบแล้ว ให้เอาออกเฉพาะที่อยู่ใน filter
        const filteredIds = filtered.map(p => p.id);
        setSelectedProducts(prev => prev.filter(id => !filteredIds.includes(id)));
     } else {
        // ถ้ายังไม่ครบ ให้เพิ่มเข้าไป (ใช้ Set กันซ้ำ)
        const newIds = filtered.map(p => p.id);
        setSelectedProducts(prev => [...new Set([...prev, ...newIds])]);
     }
  };

  const getFilteredProducts = () => {
    const filtered = products.filter(product => {
      // 1. Basic Search
      const matchesSearch = product.title.toLowerCase().includes(productSearchTerm.toLowerCase());
      
      // 2. Category
      const matchesCategory = categoryFilter === 'ทั้งหมด' || product.category === categoryFilter;
      
      // 3. Price Range
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      
      // 4. Stock Status
      let matchesStock = true;
      if (stockFilter === 'in_stock') matchesStock = product.stock > 0;
      else if (stockFilter === 'low_stock') matchesStock = product.stock > 0 && product.stock <= 10;
      else if (stockFilter === 'out_of_stock') matchesStock = product.stock === 0;

      // ⚡ Quick Filter Logic
      const matchesQuickFilter = quickFilter === 'all' ? true :
                                 quickFilter === 'flash_sale' ? !!product.flash_sale_info :
                                 quickFilter === 'out_of_stock' ? product.stock === 0 :
                                 quickFilter === 'new_arrival' ? (new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) : true;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesQuickFilter;
    });

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Helper for color badges
  const getBadgeColor = (idx) => {
    const styles = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200'
    ];
    return styles[idx % styles.length];
  };

  // ==========================================
  // 🗑️ Delete Tag
  // ==========================================
  const handleDeleteTag = async (tag) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `ต้องการลบป้ายกำกับ "${tag.name}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE}/api/tags/${tag.id}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        
        Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            timer: 1500,
            showConfirmButton: false
        });
        fetchTags();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'ไม่สามารถลบได้', 'error');
      }
    }
  };

  // 🔄 Toggle Tag Status
  const handleToggleStatus = async (tag) => {
      try {
          const token = localStorage.getItem('token');
          const newStatus = !tag.is_active;
          
          await axios.patch(`${API_BASE}/api/tags/${tag.id}/`, { is_active: newStatus }, {
              headers: { Authorization: `Token ${token}` }
          });

          // Optimistic Update
          setTags(prev => prev.map(t => t.id === tag.id ? { ...t, is_active: newStatus } : t));
          
          Swal.fire({
              icon: 'success',
              title: newStatus ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1000,
              background: newStatus ? '#ecfdf5' : '#fef2f2',
              color: newStatus ? '#047857' : '#b91c1c'
          });

      } catch (err) {
          console.error(err);
          Swal.fire('Error', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
      }
  };

  // Filter Tags for Display
  const [filterType, setFilterType] = useState('all'); // 'all', 'has_products', 'empty'
  const [groupFilter, setGroupFilter] = useState('all');
  
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase());
    
    // Status Filter Logic
    let matchesFilter = true;
    if (filterType === 'has_products') matchesFilter = (tag.product_count || 0) > 0;
    else if (filterType === 'empty') matchesFilter = (tag.product_count || 0) === 0;

    // Group Filter Logic
    const matchesGroup = groupFilter === 'all' || (tag.group_name || 'ทั่วไป') === groupFilter;
    
    return matchesSearch && matchesFilter && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-8 md:px-16 lg:px-24 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* 1️⃣ Enterprise Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="p-3 bg-indigo-900 rounded-xl shadow-lg shadow-indigo-200">
                 <Tag className="text-white" size={24} />
               </div>
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">ระบบจัดการป้ายกำกับ</h1>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs uppercase tracking-wide">v2.2</span>
                    <span>•</span>
                    <span>ระบบคัดกรองสินค้าขั้นสูง (Advanced Filtering)</span>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={() => {
                  setSelectedTag(null);
                  setNewTagName('');
                  setSelectedProducts([]);
                  resetProductFilters();
                  setShowCreateModal(true);
                }}
                className="bg-indigo-900 hover:bg-indigo-800 text-white px-6 py-3 rounded-xl font-bold font-sans shadow-xl shadow-indigo-200 hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                สร้างป้ายกำกับใหม่
              </button>
          </div>
        </div>

        {/* 2️⃣ Tab Navigation */}
        <div className="bg-white rounded-2xl p-1.5 inline-flex shadow-sm border border-slate-200">
            <button 
               onClick={() => setActiveTab('overview')}
               className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={18} /> ภาพรวม (Overview)
            </button>
            <button 
               onClick={() => setActiveTab('automation')}
               className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'automation' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <Zap size={18} /> กฎอัตโนมัติ (Automation)
            </button>
        </div>

        {/* 3️⃣ Tab Content */}
        <AnimatePresence mode="wait">
        
          {/* === OVERVIEW TAB === */}
          {activeTab === 'overview' && (
            <motion.div 
               key="overview"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-6"
            >
               {/* Search & Stats Bar */}
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Search Input */}
                  <div className="lg:col-span-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                     <Search className="text-slate-400" size={20} />
                     <input 
                       type="text" 
                       value={tagSearchTerm}
                       onChange={(e) => setTagSearchTerm(e.target.value)}
                       placeholder="ค้นหาป้ายกำกับ..." 
                       className="flex-1 bg-transparent outline-none font-medium placeholder-slate-400"
                     />
                     <div className="h-8 w-[1px] bg-slate-200"></div>
                     <div className="flex items-center gap-2 px-2">
                        <Filter size={16} className="text-slate-500"/>
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent font-bold text-sm text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="all">สถานะทั้งหมด</option>
                            <option value="has_products">มีสินค้า (In Use)</option>
                            <option value="empty">ไม่มีสินค้า (Empty)</option>
                        </select>
                     </div>
                     <div className="h-8 w-[1px] bg-slate-200"></div>
                     <div className="flex items-center gap-2 px-2">
                        <Layers size={16} className="text-slate-500"/>
                        <select 
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                            className="bg-transparent font-bold text-sm text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="all">ทุกกลุ่ม</option>
                            <option value="ทั่วไป">ทั่วไป</option>
                            <option value="สถานะสินค้า">สถานะสินค้า</option>
                            <option value="แคมเปญ">แคมเปญ</option>
                            <option value="ส่วนลด">ส่วนลด</option>
                            <option value="ภายใน">ใช้ภายใน</option>
                        </select>
                     </div>
                  </div>
                  
                  {/* Quick Stat */}
                  <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-100 flex items-center justify-between relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-indigo-200 text-sm font-medium mb-1">ป้ายกำกับทั้งหมด</p>
                        <h3 className="text-3xl font-black">{tags.length}</h3>
                     </div>
                     <Activity size={32} className="text-indigo-400/30" />
                     <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  </div>
               </div>

               {/* Tags Table - Cleaner Layout without Expiration Col */}
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-5 text-left font-bold text-slate-500 text-sm tracking-wide">ชื่อป้ายกำกับ</th>
                        <th className="px-6 py-5 text-left font-bold text-slate-500 text-sm tracking-wide">สถานะ</th>
                        <th className="px-6 py-5 text-center font-bold text-slate-500 text-sm tracking-wide">จำนวนสินค้า</th>
                        <th className="px-6 py-5 text-right font-bold text-slate-500 text-sm tracking-wide">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredTags.map((tag, idx) => (
                        <tr key={tag.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-none">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div 
                                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                                  style={{ backgroundColor: tag.color || '#6366f1' }}
                               >
                                  <Tag size={20} />
                               </div>
                               <div>
                                  <p className="font-bold text-slate-700">{tag.name}</p>
                                  <span className="text-[10px] font-black uppercase text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">{tag.group_name || 'ทั่วไป'}</span>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={tag.is_active !== false} // Default true
                                    onChange={() => handleToggleStatus(tag)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-xs font-bold text-slate-500">{tag.is_active !== false ? 'เปิดอยู่' : 'ปิดอยู่'}</span>
                            </label>
                          </td>
                          <td className="px-6 py-4 text-center">
                             <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
                               <Package size={14} className="text-slate-400"/>
                               <span className="font-bold text-slate-700">{tag.product_count || 0}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleEditTag(tag)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                                  title="แก้ไข"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTag(tag)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200"
                                  title="ลบป้ายกำกับ"
                                >
                                  <Trash2 size={16} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                      {filteredTags.length === 0 && (
                        <tr><td colSpan="4" className="text-center py-12 text-slate-400">ไม่พบป้ายกำกับ</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {/* === AUTOMATION TAB (Keep as is) === */}
          {activeTab === 'automation' && (
             <motion.div 
               key="automation"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
             >
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
                      <Zap size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">ระบบอัตโนมัติตามกฎ (Rule-Based Automation)</h2>
                      <p className="text-slate-500 max-w-lg mx-auto mt-2">ตั้งเงื่อนไข If-Then เพื่อติดป้ายกำกับให้อัตโนมัติ (เช่น สินค้าใกล้หมดให้ติดป้าย Last Chance)</p>
                    </div>
                    <button 
                      onClick={runAutomation}
                      disabled={loading}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 hover:scale-105 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/> : <Zap size={20} />}
                       รันระบบอัตโนมัติเดี๋ยวนี้ (Run Now)
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {automationRules.map(rule => (
                    <div key={rule.id} className={`p-6 rounded-2xl border transition-all ${rule.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                       <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl ${rule.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                             {rule.icon || <Lightbulb size={24} />}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                             {rule.active ? 'Active' : 'Inactive'}
                          </div>
                       </div>
                       <h3 className="text-lg font-bold text-slate-800 mb-1">{rule.name}</h3>
                       <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-4">
                          <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">IF: {rule.condition}</span>
                          <ArrowRight size={14} />
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">THEN: {rule.action}</span>
                       </div>
                       
                       <button 
                         onClick={() => {
                             const newRules = automationRules.map(r => r.id === rule.id ? {...r, active: !r.active} : r);
                             setAutomationRules(newRules);
                             Swal.fire({
                                 icon: 'success',
                                 title: newRules.find(r => r.id === rule.id).active ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว',
                                 toast: true,
                                 position: 'top-end',
                                 showConfirmButton: false,
                                 timer: 1500
                             });
                         }}
                         className={`w-full py-2.5 rounded-xl font-bold transition-all ${
                             rule.active 
                             ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                             : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                         }`}
                       >
                           {rule.active ? 'ปิดใช้งาน (Disable)' : 'เปิดใช้งาน (Enable)'}
                       </button>
                    </div>
                  ))}
                </div>
             </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* ================= MODALS ================= */}
      
      {/* Create Modal (Refined: No Calendar, Added Filters) */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm md:pl-[320px] lg:pl-[350px]"
          >
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative"
            >
               {/* 1️⃣ Modern Header */}
               <div className="bg-indigo-900 text-white p-6 md:p-8 flex justify-between items-center relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-5 relative z-10">
                     <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg text-white">
                        <Tag size={28} strokeWidth={2.5} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black tracking-tight">{selectedTag ? 'แก้ไขป้ายกำกับ (Edit Tag)' : 'สร้างป้ายกำกับใหม่ (New Tag)'}</h2>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-0.5">Tag Configuration & Product Selection</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
               </div>

               {/* 2️⃣ Main Scrollable Body */}
               <div className="flex-1 overflow-y-auto bg-slate-50/30">
                  <div className="p-6 md:p-8 space-y-8">
                     
                     {/* SECTION A: Tag Configuration */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Card 1: Basic Info */}
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                           <div className="flex items-center gap-3 text-indigo-900 mb-2">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                 <Edit2 size={18} />
                              </div>
                              <h3 className="font-black text-lg">ข้อมูลทั่วไป (Basic Info)</h3>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-wider">ชื่อป้ายกำกับ *</label>
                                 <input 
                                    type="text" 
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="เช่น สินค้าขายดี, โปรแรง..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all placeholder:font-medium placeholder:text-slate-300"
                                 />
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-wider">กลุ่มของป้ายกำกับ (Group)</label>
                                 <select 
                                    value={tagGroup}
                                    onChange={(e) => setTagGroup(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer appearance-none"
                                 >
                                    <option value="other">อื่นๆ (Other)</option>
                                    <option value="category">หมวดหมู่ (Category)</option>
                                    <option value="promotion">โปรโมชั่น (Promotion)</option>
                                    <option value="feature">คุณสมบัติ (Feature)</option>
                                    <option value="brand">แบรนด์ (Brand)</option>
                                 </select>
                              </div>

                              {selectedTag && (
                                <div className="space-y-1.5 opacity-60">
                                   <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Slug (URL)</label>
                                   <input 
                                      type="text" 
                                      value={selectedTag.slug || '-'}
                                      disabled
                                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed"
                                   />
                                </div>
                              )}
                           </div>
                        </div>

                        {/* Card 2: Visual Style */}
                        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                           <div className="flex items-center gap-3 text-indigo-900 mb-2">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                 <Star size={18} />
                              </div>
                              <h3 className="font-black text-lg">การแสดงผล (Visual Style)</h3>
                           </div>

                           <div className="space-y-4">
                              {/* Color */}
                              <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-wider">โทนสี (Color Theme)</label>
                                 <div className="flex flex-wrap gap-2.5">
                                    {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b'].map(color => (
                                       <button
                                          key={color}
                                          onClick={() => setTagColor(color)}
                                          className={`w-8 h-8 rounded-full transition-all border-4 ${tagColor === color ? 'border-white scale-125 shadow-xl ring-2 ring-indigo-500' : 'border-transparent hover:scale-110 shadow-sm'}`}
                                          style={{ backgroundColor: color }}
                                       />
                                    ))}
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer hover:scale-110 shadow-sm transition-transform">
                                       <input 
                                          type="color" 
                                          value={tagColor}
                                          onChange={e => setTagColor(e.target.value)}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                       />
                                       <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold" style={{backgroundColor: tagColor}}>+</div>
                                    </div>
                                 </div>
                              </div>

                              {/* Icon Selector */}
                              <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-wider">เลือกไอคอน (Icon)</label>
                                 <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-[20px] border border-slate-100">
                                    {[
                                       { name: 'Tag', icon: Tag },
                                       { name: 'Zap', icon: Zap },
                                       { name: 'Percent', icon: Percent },
                                       { name: 'ShoppingBag', icon: ShoppingBag },
                                       { name: 'Gift', icon: Gift },
                                       { name: 'Star', icon: Star },
                                       { name: 'Activity', icon: Activity },
                                       { name: 'Hash', icon: Hash }
                                    ].map(item => (
                                       <button 
                                          key={item.name}
                                          onClick={() => setTagIcon(item.name)}
                                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${tagIcon === item.name ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100/50 scale-110' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                                          title={item.name}
                                       >
                                          <item.icon size={20} />
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* SECTION B: Selected Products Tray */}
                     <div className="bg-indigo-900/5 rounded-[28px] p-6 border border-indigo-100/50">
                        <div className="flex items-center justify-between mb-4 px-2">
                           <div className="flex items-center gap-2">
                              <ShoppingBag size={18} className="text-indigo-600" />
                              <h3 className="font-black text-slate-800 tracking-tight">สินค้าที่เลือกเข้าร่วม ({selectedProducts.length})</h3>
                           </div>
                           {selectedProducts.length > 0 && (
                              <button 
                                 onClick={() => setSelectedProducts([])}
                                 className="text-xs font-black text-red-500 hover:text-red-700 bg-white px-4 py-1.5 rounded-full shadow-sm border border-red-50 transition-all uppercase tracking-wide"
                              >
                                 ล้างทั้งหมด
                              </button>
                           )}
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-indigo-200">
                           {selectedProducts.length > 0 ? (
                              products.filter(p => selectedProducts.includes(p.id)).map(p => (
                                 <div key={p.id} className="relative group shrink-0">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover:border-indigo-500 transition-all relative bg-white">
                                       <img 
                                          src={getImageUrl(p.thumbnail)} 
                                          alt={p.title} 
                                          className="w-full h-full object-cover"
                                          title={p.title}
                                       />
                                       <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors" />
                                    </div>
                                    <button
                                       onClick={() => toggleProduct(p.id)}
                                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                                    >
                                       <X size={12} strokeWidth={3} />
                                    </button>
                                 </div>
                              ))
                           ) : (
                              <div className="w-full py-8 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed border-indigo-100 rounded-[20px]">
                                 <LayoutGrid size={32} className="opacity-30" />
                                 <p className="text-sm font-bold">ยังไม่ได้เลือกสินค้า</p>
                                 <p className="text-[10px] uppercase font-black tracking-widest text-slate-300">Choose products from the grid below</p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* SECTION C: Product Selector Grid */}
                     <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                        {/* Selector Toolbar */}
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 space-y-4">
                           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                                 <List size={22} className="text-indigo-600" />
                                 ค้นหาและเลือกสินค้า
                                 <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">{filteredProducts.length} รายการ</span>
                              </h3>
                              
                              <button
                                 onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                 className={`px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-sm border ${showAdvancedFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                              >
                                 <SlidersHorizontal size={18}/> {showAdvancedFilters ? 'ปิดตัวกรอง' : 'ตัวกรองขั้นสูง'}
                              </button>
                           </div>

                           <div className="flex flex-col md:flex-row gap-4">
                              <div className="relative flex-1 group">
                                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20}/>
                                 <input 
                                    type="text" 
                                    placeholder="ค้นหาสินค้าตามชื่อ..." 
                                    value={productSearchTerm}
                                    onChange={e => setProductSearchTerm(e.target.value)}
                                    className="w-full bg-white pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                 />
                              </div>
                              
                              <div className="w-full md:w-64">
                                 <select 
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                    className="w-full bg-white px-5 py-3.5 rounded-2xl border border-slate-200 text-sm font-black text-slate-700 outline-none shadow-sm cursor-pointer hover:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
                                 >
                                    <option value="ทั้งหมด">📦 ทุกหมวดหมู่</option>
                                    {categories.filter(c => c !== 'ทั้งหมด').map(c => <option key={c} value={c}>{c}</option>)}
                                 </select>
                              </div>

                              <button 
                                 onClick={handleSelectToggle} 
                                 className={`px-8 py-3.5 rounded-2xl text-sm font-black transition-all ${filteredProducts.every(p => selectedProducts.includes(p.id)) && filteredProducts.length > 0 ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'}`}
                              >
                                 {filteredProducts.every(p => selectedProducts.includes(p.id)) && filteredProducts.length > 0 ? 'ยกเลิกทั้งหมด' : 'เลือกแสดงผลทั้งหมด'}
                              </button>
                           </div>

                           {/* Dynamic Filters Panel */}
                           <AnimatePresence>
                              {showAdvancedFilters && (
                                 <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                 >
                                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                       {/* Price Filter */}
                                       <div className="p-5 bg-white rounded-[24px] border border-indigo-50 shadow-sm space-y-3">
                                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                             <DollarSign size={14} className="text-emerald-500" /> ช่วงราคา (Price Range)
                                          </label>
                                          <div className="flex items-center gap-3">
                                             <input 
                                                type="number" 
                                                placeholder="ต่ำสุด"
                                                value={priceRange.min}
                                                onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-center outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                             />
                                             <div className="h-px w-4 bg-slate-200"></div>
                                             <input 
                                                type="number" 
                                                placeholder="สูงสุด"
                                                value={priceRange.max}
                                                onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-center outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                             />
                                          </div>
                                       </div>

                                       {/* Stock Filter */}
                                       <div className="p-5 bg-white rounded-[24px] border border-indigo-50 shadow-sm space-y-3">
                                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                             <Package size={14} className="text-amber-500" /> สถานะสต็อก
                                          </label>
                                          <div className="flex flex-wrap gap-2">
                                             {[
                                                { id: 'all', label: 'ทั้งหมด', color: 'slate' },
                                                { id: 'in_stock', label: 'มีของ', color: 'emerald' },
                                                { id: 'low_stock', label: 'เหลือน้อย', color: 'amber' },
                                                { id: 'out_of_stock', label: 'หมด', color: 'red' }
                                             ].map(f => (
                                                <button
                                                   key={f.id}
                                                   onClick={() => setStockFilter(f.id)}
                                                   className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${stockFilter === f.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                                >
                                                   {f.label}
                                                </button>
                                             ))}
                                          </div>
                                       </div>

                                       {/* Quick Type Filter */}
                                       <div className="p-5 bg-white rounded-[24px] border border-indigo-50 shadow-sm space-y-3">
                                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                             <Zap size={14} className="text-indigo-500" /> ทางลัดคัดกรอง
                                          </label>
                                          <div className="flex flex-wrap gap-2">
                                             {[
                                                { id: 'all', label: 'ทั้งหมด' },
                                                { id: 'flash_sale', label: '🔥 Flash Sale' },
                                                { id: 'new_arrival', label: '✨ สินค้าใหม่' }
                                             ].map(f => (
                                                <button
                                                   key={f.id}
                                                   onClick={() => setQuickFilter(f.id)}
                                                   className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${quickFilter === f.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                                                >
                                                   {f.label}
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>

                        {/* Product Grid Area */}
                        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                           {paginatedProducts.length > 0 ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                 {paginatedProducts.map(product => {
                                    const isSelected = selectedProducts.includes(product.id);
                                    return (
                                       <motion.div 
                                          key={product.id} 
                                          whileHover={{ y: -4 }}
                                          onClick={() => toggleProduct(product.id)}
                                          className={`group relative bg-white border-2 rounded-[24px] p-4 cursor-pointer transition-all flex flex-col gap-3 shadow-sm select-none ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-transparent hover:border-indigo-200'}`}
                                       >
                                          {/* Checkbox Badge */}
                                          <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all z-10 ${isSelected ? 'bg-indigo-600 text-white scale-110' : 'bg-white/80 backdrop-blur-sm border border-slate-100 text-transparent scale-0 group-hover:scale-100'}`}>
                                             <Check size={16} strokeWidth={4} />
                                          </div>

                                          {/* Thumbnail */}
                                          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                                             <img 
                                                src={getImageUrl(product.thumbnail)} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                alt={product.title}
                                             />
                                          </div>

                                          {/* Info */}
                                          <div className="space-y-1">
                                             <p className={`text-sm font-black leading-tight line-clamp-2 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                {product.title}
                                             </p>
                                             <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                   {product.category}
                                                </span>
                                             </div>
                                          </div>

                                          <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
                                             <span className="text-base font-black text-indigo-900">฿{product.price.toLocaleString()}</span>
                                             {product.stock <= 0 ? (
                                                <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full">OUT OF STOCK</span>
                                             ) : (
                                                <div className="flex items-center gap-1">
                                                   <Box size={10} className="text-slate-300" />
                                                   <span className={`text-[10px] font-bold ${product.stock < 10 ? 'text-amber-600' : 'text-slate-400'}`}>{product.stock}</span>
                                                </div>
                                             )}
                                          </div>
                                       </motion.div>
                                    )
                                 })}
                              </div>
                           ) : (
                              <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 gap-4">
                                 <div className="p-8 bg-white rounded-full shadow-inner">
                                    <ShoppingBag size={64} className="opacity-20" />
                                 </div>
                                 <div className="text-center space-y-1">
                                    <p className="text-lg font-black text-slate-400">ไม่พบสินค้าที่คุณต้องการ</p>
                                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Try adjusting your filters</p>
                                 </div>
                              </div>
                           )}

                           {/* Robust Pagination */}
                           {totalPages > 1 && (
                              <div className="mt-12 py-8 flex flex-col md:flex-row items-center justify-center gap-6">
                                 <div className="flex items-center gap-3">
                                    <button 
                                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                       disabled={currentPage === 1}
                                       className="w-12 h-12 rounded-[18px] bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-center"
                                    >
                                       <ChevronLeft size={24} />
                                    </button>
                                    
                                    <div className="flex items-center gap-2">
                                       {[...Array(totalPages)].map((_, i) => {
                                          const isNearby = Math.abs(currentPage - (i + 1)) <= 1;
                                          const isEdge = i === 0 || i === totalPages - 1;
                                          
                                          if (!isNearby && !isEdge) {
                                             if (i === 1 || i === totalPages - 2) return <span key={i} className="text-slate-300 text-sm font-black mx-1">...</span>;
                                             return null;
                                          }

                                          return (
                                             <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-12 h-12 rounded-[18px] text-sm font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                                             >
                                                {i + 1}
                                             </button>
                                          );
                                       })}
                                    </div>

                                    <button 
                                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                       disabled={currentPage === totalPages}
                                       className="w-12 h-12 rounded-[18px] bg-white border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-center"
                                    >
                                       <ChevronRight size={24} />
                                    </button>
                                 </div>
                                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Page {currentPage} of {totalPages}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               {/* 4️⃣ Final Sticky Footer */}
               <div className="bg-white border-t border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0 z-30">
                  <div className="flex items-center gap-8">
                     <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Selected Products</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-black text-indigo-900 leading-none">{selectedProducts.length}</span>
                           <span className="text-sm font-bold text-slate-400 uppercase">Items</span>
                        </div>
                     </div>
                     <div className="h-10 w-px bg-slate-100"></div>
                     <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tag Target</p>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="w-4 h-4 rounded-full" style={{backgroundColor: tagColor}}></div>
                           <span className="text-sm font-black text-slate-700">{newTagName || 'Untitled Tag'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                     <button 
                        onClick={() => setShowCreateModal(false)} 
                        className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all text-sm uppercase tracking-widest"
                     >
                        ยกเลิก
                     </button>
                     <button 
                        onClick={handleSaveTag}
                        className="flex-1 md:flex-none px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-[0.1em]"
                     >
                        <Check size={20} strokeWidth={3} /> 
                        บันทึกป้ายกำกับ
                     </button>
                  </div>
               </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Tag Functionality */}
    </div>
  );
}

// ✅ Helper Function: Check if product has tag
function hasTag(product, tagId) {
    return product.tags && product.tags.some(t => t.id === tagId);
}

export default TagManagement;
