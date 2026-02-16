import React, { useState, useEffect, useMemo } from 'react';
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
 * 🏢 Enterprise Tag Management System (Royal Purple Edition)
 * Version 3.0 - Smart Features & Thai Localization
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
  const [tagColor, setTagColor] = useState('#581c87');
  const [tagIcon, setTagIcon] = useState('Tag');
  const [tagPriority, setTagPriority] = useState(0); 
  const [smartRule, setSmartRule] = useState('');    
  
  // ✅ NEW: Analytics & Preview States
  const [tagAnalyticsData, setTagAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  
  // ✅ NEW: Bulk Delete State
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // ✅ ระบบช่วยตั้งชื่ออัตโนมัติตามไอคอน (Smart Icon Naming)
  const handleIconSelect = (iconName) => {
    setTagIcon(iconName);
    
    const nameMap = {
      'Tag': 'ป้ายกำกับ',
      'Zap': 'สินค้ามาแรง',
      'Star': 'สินค้าแนะนำ',
      'Award': 'รางวัลยอดเยี่ยม',
      'Sparkles': 'สินค้าใหม่',
      'Percent': 'ส่วนลดพิเศษ',
      'Gift': 'ของขวัญฟรี',
      'Clock': 'เวลาจำกัด',
      'Package': 'พร้อมส่ง',
      'ShoppingBag': 'ดีลเด็ด',
      'Activity': 'กิจกรรมป้าย',
      'Hash': 'ติดเทรนด์'
    };

    // เปลี่ยนชื่อให้อัตโนมัติถ้าชื่อว่าง หรือชื่อเดิมเป็นค่าที่ระบบเคยเติมให้ (สลับไอคอนไปมาได้)
    const currentName = newTagName.trim();
    const isAutoFilled = Object.values(nameMap).includes(currentName) || currentName === '';
    
    if (isAutoFilled && nameMap[iconName]) {
      setNewTagName(nameMap[iconName]);
    }
  };

  // Group Dropdown & Selection
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [existingGroups, setExistingGroups] = useState(['ทั่วไป', 'สถานะสินค้า', 'แคมเปญ', 'ส่วนลด', 'แบรนด์', 'คุณสมบัติพิเศษ']); 
  
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
  const [stockFilter, setStockFilter] = useState('all'); 
  const [quickFilter, setQuickFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Automation Rule States
  const [automationRules, setAutomationRules] = useState([
    { id: 1, name: 'สินค้าขายดี (🏆)', condition: 'ยอดขาย > 50 ใน 30 วัน', action: 'เพิ่มป้าย: Best Seller', active: true, icon: <Star size={24} />, color: '#ffa200ff' },
    { id: 2, name: 'สินค้าแนะนำ/มาแรง (🔥)', condition: 'ยอดขาย > 10 ใน 2 วัน', action: 'เพิ่มป้าย: Hot Selling', active: true, icon: <Zap size={24} />, color: '#f97316' },
    { id: 3, name: 'โอกาสสุดท้าย/สต็อกต่ำ (⌛)', condition: 'สต็อก < 5', action: 'เพิ่มป้าย: Last Chance', active: true, icon: <AlertCircle size={24} />, color: '#00ff33ff' },
    { id: 4, name: 'สินค้าเข้าใหม่ (🆕)', condition: 'สร้างไม่เกิน 7 วัน', action: 'เพิ่มป้าย: New Arrival', active: true, icon: <Sparkles size={24} />, color: '#3b82f6' },
    { id: 5, name: 'สินค้าลดราคา (🏷️)', condition: 'ราคาลดจากราคาปกติ', action: 'เพิ่มป้าย: On Sale', active: true, icon: <Percent size={24} />, color: '#e7ff0eff' },
    { id: 7, name: 'สินค้าหมด (❌)', condition: 'สินค้าหมดสต็อก', action: 'เพิ่มป้าย: Out of Stock', active: true, icon: <Slash size={24} />, color: '#f40000ff' },
  ]);
  const [automationStats, setAutomationStats] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const API_BASE = 'http://localhost:8000';

  // ✅ NEW: Reset Delete Mode when switching tabs
  useEffect(() => {
    setIsDeleteMode(false);
    setSelectedTags([]);
  }, [activeTab]);

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
      // ✅ Only show categories that have products
      const activeCategories = rawCategories.filter(cat => 
        products.some(p => p.category === cat)
      );
      setCategories(['ทั้งหมด', ...activeCategories]);
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
    setSortBy('newest');
    setOnlyDiscounted(false);
    setViewMode('grid');
    setItemsPerPage(12);
    setTagPriority(0);
    setSmartRule('');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [productSearchTerm, categoryFilter, priceRange, stockFilter, quickFilter, sortBy, onlyDiscounted]);

  useEffect(() => {
    fetchTags();
    fetchProducts();
    fetchCategories();
    fetchTagAnalytics(); // ✅ NEW: Initial analytics fetch
  }, []);

  // ✅ NEW: Fetch Tag Analytics
  const fetchTagAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/analytics/tags/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setTagAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching tag analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // ==========================================
  // ➕ Create & Edit Tag
  // ==========================================
  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setNewTagName(tag.name);
    setTagGroup(tag.group_name || 'ทั่วไป');
    setTagColor(tag.color || '#581c87');
    setTagIcon(tag.icon || 'Tag');
    setTagPriority(tag.priority || 0);
    setSmartRule(tag.smart_rule || '');
    
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
        confirmButtonColor: '#581c87'
      });
      return;
    }

    // ✅ Priority Validation
    if (tagPriority < 0) {
      Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ลำดับความสำคัญ (Priority) ต้องไม่ติดลบ',
          confirmButtonColor: '#d33',
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // ✅ Map Thai group names to Backend Choice Keys
      const groupMap = {
        'ทั่วไป': 'other',
        'สถานะสินค้า': 'feature', // หรือ 'category' ตามความเหมาะสม
        'แคมเปญ': 'promotion',
        'ส่วนลด': 'promotion',
        'แบรนด์': 'brand',
        'คุณสมบัติพิเศษ': 'feature'
      };

      const payload = { 
        name: newTagName.trim(),
        group_name: groupMap[tagGroup] || 'other', // ✅ Use Key instead of Thai string
        color: tagColor,
        icon: tagIcon,
        priority: tagPriority,
        smart_rule: smartRule
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
      setTagColor('#581c87');
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
      
      const data = response.data || {};
      const stats = data.statistics || {};
      const updatedCount = data.updated_count || 0;
      
      setAutomationStats(stats);
      await fetchTags();
      await fetchProducts();
      
      Swal.fire({
          icon: 'success',
          title: 'ประมวลผลสมาร์ทแท็กสำเร็จ',
          html: `
            <div class="text-left mt-4 space-y-2">
              <p class="font-bold text-lg mb-2">อัปเดตไปทั้งหมด: ${updatedCount} รายการ</p>
              ${Object.entries(stats).map(([name, count]) => `
                <div class="flex justify-between items-center py-1 border-b border-gray-100">
                  <span class="text-gray-600">${name}</span>
                  <span class="font-bold text-[#581c87]">${count} ชิ้น</span>
                </div>
              `).join('')}
            </div>
          `,
          confirmButtonColor: '#581c87'
      });

    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการรันระบบอัตโนมัติที่ Server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 📦 Selection & Filter Logic
  // ==========================================
  const toggleProduct = (productId) => {
    // [Group Constraint Logic]
    if (tagGroup === 'สถานะสินค้า') {
      const product = products.find(p => p.id === productId);
      const hasOtherStatusTag = product?.tags?.some(t => t.group_name === 'สถานะสินค้า' && (!selectedTag || t.id !== selectedTag.id));
      
      if (hasOtherStatusTag && !selectedProducts.includes(productId)) {
        Swal.fire({
          icon: 'info',
          title: 'ข้อจำกัดกลุ่ม (Group Constraint)',
          text: 'สินค้านี้มีป้ายกำกับในกลุ่ม "สถานะสินค้า" อยู่แล้ว ระบบจะทำการเปลี่ยนป้ายให้ใหม่เมื่อคุณบันทึก',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    }

    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  
  const handleSelectToggle = () => {
     const filtered = getFilteredProducts();
     const allSelected = filtered.every(p => selectedProducts.includes(p.id));
     
     if (allSelected) {
        const filteredIds = filtered.map(p => p.id);
        setSelectedProducts(prev => prev.filter(id => !filteredIds.includes(id)));
     } else {
        const newIds = filtered.map(p => p.id);
        setSelectedProducts(prev => [...new Set([...prev, ...newIds])]);
     }
  };

  const getFilteredProducts = () => {
    const filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(productSearchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ทั้งหมด' || product.category === categoryFilter;
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      
      let matchesStock = true;
      if (stockFilter === 'in_stock') matchesStock = product.stock > 0;
      else if (stockFilter === 'low_stock') matchesStock = product.stock > 0 && product.stock <= 10;
      else if (stockFilter === 'out_of_stock') matchesStock = product.stock === 0;

      const matchesQuickFilter = quickFilter === 'all' ? true :
                                 quickFilter === 'flash_sale' ? !!product.flash_sale_info :
                                 quickFilter === 'out_of_stock' ? product.stock === 0 :
                                 quickFilter === 'new_arrival' ? (new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) : true;

      const matchesDiscount = onlyDiscounted ? (product.discount_price && product.discount_price < product.price) : true;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesQuickFilter && matchesDiscount;
    });

    // ✅ Sorting Logic
    return filtered.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });
  };

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ✅ Active Categories (Only show categories that have at least one product)
  const activeCategories = useMemo(() => {
    const counts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    // Sort and filter categories that actually exist in the products list
    return categories.filter(cat => cat === 'ทั้งหมด' || (counts[cat] > 0));
  }, [categories, products]);

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
      confirmButtonText: 'ลบข้อมูล',
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
        Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบป้ายกำกับได้', 'error');
      }
    }
  };

  const handleToggleStatus = async (tag) => {
      try {
          const token = localStorage.getItem('token');
          const newStatus = !tag.is_active;
          
          await axios.patch(`${API_BASE}/api/tags/${tag.id}/`, { is_active: newStatus }, {
              headers: { Authorization: `Token ${token}` }
          });

          setTags(prev => prev.map(t => t.id === tag.id ? { ...t, is_active: newStatus } : t));
          
          Swal.fire({
              icon: 'success',
              title: newStatus ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 1000,
              background: newStatus ? '#f5f3ff' : '#fef2f2',
              color: newStatus ? '#581c87' : '#b91c1c'
          });

      } catch (err) {
          console.error(err);
          Swal.fire('Error', 'ไม่สามารถเปลี่ยนสถานะได้', 'error');
      }
  };

  const handleBulkDeleteTags = async () => {
    if (selectedTags.length === 0) return;

    const result = await Swal.fire({
      title: `ลบป้ายกำกับ ${selectedTags.length} รายการ?`,
      text: "คุณต้องการลบป้ายกำกับทั้งหมดที่เลือกใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ยืนยันการลบลายตัว',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Parallel deletion
        await Promise.all(selectedTags.map(id => 
          axios.delete(`${API_BASE}/api/tags/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          })
        ));

        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: `ลบป้ายกำกับทั้งหมดรวม ${selectedTags.length} รายการแล้ว`,
          timer: 2000,
          showConfirmButton: false
        });
        
        setSelectedTags([]);
        fetchTags();
      } catch (err) {
        console.error(err);
        Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการลบบางรายการ', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTagSelection = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSelectAllTags = () => {
    if (selectedTags.length === filteredTags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(filteredTags.map(t => t.id));
    }
  };

  const [filterType, setFilterType] = useState('all'); 
  const [groupFilter, setGroupFilter] = useState('all');
  
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase());
    let matchesFilter = true;
    if (filterType === 'has_products') matchesFilter = (tag.product_count || 0) > 0;
    else if (filterType === 'empty') matchesFilter = (tag.product_count || 0) === 0;

    const matchesGroup = groupFilter === 'all' || (tag.group_name || 'ทั่วไป') === groupFilter;
    
    return matchesSearch && matchesFilter && matchesGroup;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-8 md:px-16 lg:px-24 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* 1️⃣ Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="p-3 bg-purple-900 rounded-2xl shadow-xl shadow-purple-200">
                 <Tag className="text-white" size={28} />
               </div>
               <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">ระบบจัดการ <span className="text-[#581c87]">ป้ายกำกับ</span></h1>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                    <span className="px-2 py-0.5 bg-purple-100 text-[#581c87] rounded text-[10px] uppercase tracking-widest">รุ่น 3.0 อัจฉริยะ</span>
                    <span>•</span>
                    <span>ระบบอัตโนมัติและจัดการลำดับความสำคัญ (Thai Edition)</span>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             {isDeleteMode ? (
                <>
                  <button 
                    onClick={handleSelectAllTags}
                    className={`px-6 py-3.5 rounded-2xl border-2 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${selectedTags.length === filteredTags.length && filteredTags.length > 0 ? 'bg-red-700 border-red-700 text-white shadow-lg shadow-red-200' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:border-red-300'}`}
                  >
                     {selectedTags.length === filteredTags.length && filteredTags.length > 0 ? (
                       <><X size={18} strokeWidth={3} /> ยกเลิกการเลือก</>
                     ) : (
                       <><Check size={18} strokeWidth={3} /> เลือกทั้งหมด</>
                     )}
                  </button>
                  <button 
                    onClick={handleBulkDeleteTags}
                    disabled={selectedTags.length === 0}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-2xl shadow-red-200 hover:translate-y-[-2px] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                    ลบที่เลือก ({selectedTags.length})
                  </button>
                  <button 
                    onClick={() => {
                      setIsDeleteMode(false);
                      setSelectedTags([]);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black transition-all flex items-center gap-2"
                  >
                    ยกเลิก
                  </button>
                </>
             ) : (
                <>
                  <button 
                    onClick={() => setIsDeleteMode(true)}
                    className="bg-white border border-red-100 text-red-500 hover:bg-red-50 px-6 py-3.5 rounded-2xl font-black shadow-sm transition-all flex items-center gap-2"
                  >
                    <Trash2 size={20} />
                    จัดการ/ลบป้าย
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedTag(null);
                      setNewTagName('');
                      setSelectedProducts([]);
                      resetProductFilters();
                      setShowCreateModal(true);
                    }}
                    className="bg-[#581c87] hover:bg-[#4c1d95] text-white px-8 py-3.5 rounded-2xl font-black shadow-2xl shadow-purple-200 hover:shadow-purple-300 hover:translate-y-[-2px] transition-all flex items-center gap-2"
                  >
                    <Plus size={22} strokeWidth={3} />
                    สร้างป้ายกำกับใหม่
                  </button>
                </>
             )}
          </div>
        </div>

        {/* 2️⃣ Tab Navigation */}
        <div className="bg-white rounded-[24px] p-2 inline-flex shadow-xl border border-slate-100">
            <button 
               onClick={() => setActiveTab('overview')}
               className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-[#581c87] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
               <LayoutGrid size={18} /> ภาพรวมระบบ (Overview)
            </button>
            <button 
               onClick={() => setActiveTab('automation')}
               className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'automation' ? 'bg-[#581c87] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
               <Zap size={18} /> กฎอัจฉริยะ (Smart Rules)
            </button>
            <button 
               onClick={() => setActiveTab('performance')}
               className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${activeTab === 'performance' ? 'bg-[#581c87] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
               <Activity size={18} /> ประสิทธิภาพ (Performance)
            </button>
        </div>

        {/* 3️⃣ Tab Content */}
        <AnimatePresence mode="wait">
        
          {activeTab === 'overview' && (
            <motion.div 
               key="overview"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-6"
            >
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 bg-white p-5 rounded-[28px] shadow-xl border border-slate-50 flex items-center gap-4">
                     <Search className="text-slate-300" size={24} />
                     <input 
                       type="text" 
                       value={tagSearchTerm}
                       onChange={(e) => setTagSearchTerm(e.target.value)}
                       placeholder="ค้นหาตามชื่อป้ายกำกับ (เช่น สินค้าขายดี, ลดราคา...)" 
                       className="flex-1 bg-transparent outline-none font-bold text-lg placeholder-slate-300"
                     />
                     <div className="h-10 w-[1px] bg-slate-100"></div>
                     <div className="flex items-center gap-2 px-2">
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent font-black text-xs text-[#581c87] uppercase tracking-wider outline-none cursor-pointer"
                        >
                            <option value="all">สถานะการใช้งานคลัง</option>
                            <option value="has_products">มีการใช้งานอยู่ (In Use)</option>
                            <option value="empty">ยังไม่ถูกใช้งาน (Empty)</option>
                        </select>
                     </div>
                     <div className="h-10 w-[1px] bg-slate-100"></div>
                     <div className="flex items-center gap-2 px-2">
                        <select 
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                            className="bg-transparent font-black text-xs text-slate-500 uppercase tracking-wider outline-none cursor-pointer"
                        >
                            <option value="all">ทุกระนาบกลุ่ม</option>
                            {existingGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                     </div>
                  </div>
                  
                   <div className="bg-[#581c87] rounded-[28px] p-6 text-white shadow-2xl shadow-purple-200/50 flex items-center justify-between relative overflow-hidden border border-white/10">
                      <div className="relative z-10">
                         <p className="text-purple-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">จำนวนป้ายทั้งหมด</p>
                         <h3 className="text-4xl font-black tracking-tighter">{tags.length}</h3>
                      </div>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                      <Tag size={40} className="text-white/20 relative z-10" strokeWidth={3} />
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                    <div 
                      key={tag.id} 
                      onClick={() => isDeleteMode ? toggleTagSelection(tag.id) : handleEditTag(tag)}
                      className={`bg-white p-6 rounded-[32px] border transition-all group relative overflow-hidden cursor-pointer ${
                        isSelected 
                        ? (isDeleteMode ? 'border-red-600 border-[3px] shadow-2xl shadow-red-200 bg-red-100' : 'border-[#581c87] shadow-xl bg-purple-50/10')
                        : 'border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                      }`}
                    >
                       {/* Selection Checkbox */}
                       {(isDeleteMode || isSelected) && (
                          <div className="absolute top-4 right-4 z-20">
                             <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                               isSelected 
                               ? (isDeleteMode ? 'bg-red-600 border-red-600 scale-125 shadow-lg' : 'bg-[#581c87] border-[#581c87] scale-110')
                               : 'bg-white/50 backdrop-blur-sm border-slate-200'
                             }`}>
                                {isSelected && <Check size={16} className="text-white" strokeWidth={5} />}
                             </div>
                          </div>
                       )}
                       <div className="flex justify-between items-start mb-6">
                           <div 
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl bg-[#581c87]"
                           >
                              <Tag size={28} strokeWidth={2.5} />
                           </div>
                          
                          <div className="flex flex-col items-end gap-2">
                             <label className="relative inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
                                 <input 
                                     type="checkbox" 
                                     className="sr-only peer"
                                     checked={tag.is_active !== false}
                                     onChange={() => handleToggleStatus(tag)}
                                 />
                                 <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#581c87]"></div>
                              </label>
                             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400">
                                <Clock size={10} />
                                ลำดับ: {tag.priority || 0}
                             </div>
                          </div>
                       </div>

                       <div className="space-y-1">
                          <h4 className="text-xl font-black text-slate-800 tracking-tight">{tag.name}</h4>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase text-[#581c87] bg-purple-50 px-2 py-1 rounded-md">{tag.group_name || 'ทั่วไป'}</span>
                             {tag.smart_rule && (
                                <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-md flex items-center gap-1">
                                   <Zap size={10} /> {tag.smart_rule}
                                </span>
                             )}
                          </div>
                       </div>

                       <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                                {(tag.product_thumbnails || []).map((thumb, i) => (
                                   <div 
                                      key={i} 
                                      className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm transition-all hover:scale-110 hover:z-10"
                                   >
                                      {thumb ? (
                                         <img 
                                            src={getImageUrl(thumb)} 
                                            alt={`product-${i}`} 
                                            className="w-full h-full object-cover"
                                         />
                                      ) : (
                                         <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                            {i + 1}
                                         </div>
                                      )}
                                   </div>
                                ))}
                                {(tag.product_count || 0) > (tag.product_thumbnails?.length || 0) && (
                                   <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                                      +{(tag.product_count || 0) - (tag.product_thumbnails?.length || 0)}
                                   </div>
                                )}
                             </div>
                              <div className="flex flex-col gap-0.5 min-w-[80px]">
                                 <p className="text-[14px] font-black text-slate-800 leading-none">
                                    {tag.product_count || 0}
                                 </p>
                                 <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 whitespace-nowrap">
                                    สินค้าในป้ายนี้
                                 </p>
                              </div>
                          </div>
                          
                           <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <button 
                                 onClick={() => handleEditTag(tag)}
                                 className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-[#581c87] hover:bg-purple-50 rounded-xl transition-all border border-slate-100"
                              >
                                 <Edit2 size={16} />
                              </button>
                              <button 
                                 onClick={() => handleDeleteTag(tag)}
                                 className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-100"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                       </div>
                    </div>
                    );
                  })}
                  
                  {filteredTags.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-300">
                       <Layers size={64} className="opacity-10" />
                       <p className="font-black text-xl">ไม่พบข้อมูลป้ายกำกับที่คุณต้องการ</p>
                    </div>
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === 'automation' && (
             <motion.div 
               key="automation"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="space-y-10"
             >
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-50 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#581c87] to-transparent opacity-20"></div>
                    <div className="w-24 h-24 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-[#581c87] shadow-lg">
                      <Zap size={48} fill="currentColor" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight">ระบบคัดกรองอัตโนมัติ (Rule-Based AI)</h2>
                      <p className="text-slate-500 max-w-2xl mx-auto mt-4 text-lg font-medium leading-relaxed">
                        ระบบจะทำการตรวจสอบข้อมูลสินค้าแบบ Real-time ตามเงื่อนไขที่คุณกำหนด <br/>
                        เพื่อติดป้ายกำกับให้สินค้าโดยอัตโนมัติ ลดเวลาการทำงานของ Admin
                      </p>
                    </div>
                    
                    <div className="flex justify-center gap-6 pt-4">
                       <button 
                         onClick={runAutomation}
                         disabled={loading}
                         className="px-10 py-5 bg-[#581c87] hover:bg-[#4c1d95] text-white rounded-[24px] font-black shadow-2xl shadow-purple-200 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50 uppercase tracking-widest text-sm"
                       >
                          {loading ? <div className="animate-spin rounded-full h-5 w-5 border-4 border-white/30 border-t-white"/> : <Zap size={24} />}
                          รันระบบคัดกรองป้ายอัตโนมัติ (Run Automation)
                       </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {automationRules.map(rule => (
                    <div 
                        key={rule.id} 
                        className={`p-8 rounded-[40px] border-2 transition-all duration-500 relative overflow-hidden ${
                            rule.active 
                            ? 'bg-white border-purple-200 shadow-[0_20px_50px_rgba(88,28,135,0.1)] scale-[1.02]' 
                            : 'bg-slate-50/50 border-slate-200 border-dashed opacity-60 scale-100'
                        }`}
                    >
                       {/* Background Decorative Element */}
                       <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full transition-all duration-700 ${rule.active ? 'bg-purple-50 opacity-100' : 'bg-slate-200 opacity-20'}`} />

                       <div className="flex justify-between items-start mb-8 relative z-10">
                          <div 
                             className={`p-4 rounded-2xl shadow-sm transition-all duration-500 text-white ${rule.active ? 'rotate-3 scale-110' : 'bg-slate-200 text-slate-400 rotate-0 scale-100'}`}
                             style={rule.active ? { backgroundColor: rule.color } : {}}
                          >
                             {rule.icon || <Lightbulb size={32} />}
                          </div>
                          
                          {/* 🍏 iOS Style Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  checked={rule.active}
                                  onChange={() => {
                                      const newRules = automationRules.map(r => r.id === rule.id ? {...r, active: !r.active} : r);
                                      setAutomationRules(newRules);
                                      Swal.fire({
                                          icon: rule.active ? 'info' : 'success',
                                          title: !rule.active ? 'เปิดกฎอัตโนมัติ' : 'ปิดการทำงานกฎ',
                                          text: rule.name,
                                          toast: true,
                                          position: 'top-end',
                                          showConfirmButton: false,
                                          timer: 1500,
                                          background: rule.active ? '#f8fafc' : (rule.color || '#581c87'),
                                          color: rule.active ? '#64748b' : '#fff'
                                      });
                                  }}
                              />
                              <div 
                                 className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"
                                 style={rule.active ? { backgroundColor: rule.color } : {}}
                              ></div>
                          </label>
                       </div>
                       
                       <div className="relative z-10">
                          <h3 className={`text-2xl font-black mb-3 transition-colors ${rule.active ? 'text-slate-900' : 'text-slate-400'}`}>
                             {rule.name}
                          </h3>
                          
                          <div className="space-y-4 mb-2">
                             <div className="flex items-start gap-3">
                                <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] italic shrink-0 transition-colors ${rule.active ? 'bg-slate-100' : 'bg-slate-100 text-slate-300'}`} style={rule.active ? { color: rule.color } : {}}>IF</div>
                                <p className={`text-sm font-bold leading-relaxed ${rule.active ? 'text-slate-600' : 'text-slate-400'}`}>{rule.condition}</p>
                             </div>
                             <div className="flex items-start gap-3">
                                <div className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] italic shrink-0 transition-colors ${rule.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>THEN</div>
                                <p className={`text-sm font-black leading-relaxed ${rule.active ? 'text-slate-900' : 'text-slate-400'}`}>{rule.action}</p>
                             </div>
                          </div>
                       </div>
                       
                       {/* Status Indicator Bar */}
                       <div 
                          className={`mt-6 h-1 w-full rounded-full transition-all duration-1000 ${rule.active ? '' : 'bg-slate-200'}`} 
                          style={rule.active ? { backgroundColor: rule.color } : {}}
                       />
                    </div>
                  ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div 
              key="performance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* 📊 Analytics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: 'จำนวนป้ายทั้งหมด', value: tags.length, icon: Tag, color: 'bg-indigo-50 text-indigo-500' },
                   { label: 'สินค้าที่ติดป้าย', value: tagAnalyticsData?.total_tagged_products || 0, icon: Box, color: 'bg-purple-50 text-purple-500' },
                   { label: 'ป้ายที่ยอดนิยมสูงสุด', value: tagAnalyticsData?.most_used_tag || '-', icon: Award, color: 'bg-blue-50 text-blue-500' },
                   { label: 'ยอดขายรวมจากป้าย', value: `฿${(tagAnalyticsData?.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-rose-50 text-rose-500' }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-50 flex items-center gap-4">
                     <div className={`p-4 rounded-2xl ${stat.color}`}>
                       <stat.icon size={24} />
                     </div>
                     <div>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                       <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
                     </div>
                   </div>
                 ))}
              </div>

              {/* 📈 Detailed Performance Table */}
              <div className="bg-white rounded-[40px] shadow-2xl border border-slate-50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#581c87] text-white rounded-lg">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 italic">รายงานประสิทธิภาพการใช้งานป้าย</h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tag Revenue & Conversion Attribution</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchTagAnalytics}
                    className="p-4 bg-white rounded-2xl border border-slate-100 text-[#581c87] shadow-sm hover:rotate-180 transition-all duration-500"
                  >
                    <Activity size={24} className={loadingAnalytics ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100">
                        <th className="px-8 py-6">ชื่อป้ายกำกับ (Tag Name)</th>
                        <th className="px-8 py-6 text-center">สินค้า (Products)</th>
                        <th className="px-8 py-6 text-center">ยอดการมองเห็น (Reach)</th>
                        <th className="px-8 py-6 text-right">ยอดขายสะสม (Revenue)</th>
                        <th className="px-8 py-6 text-center">อัตราการซื้อ (Conv.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(tagAnalyticsData?.tag_performance || []).map((perf, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-100" style={{ backgroundColor: perf.color || '#581c87' }}>
                                <Tag size={18} />
                              </div>
                              <span className="font-bold text-slate-700">{perf.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="font-black text-slate-400 italic">{perf.product_count}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="font-black text-slate-800">{(perf.reach || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="font-black text-[#581c87]">฿{(perf.revenue || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${perf.conversion_rate || 0}%` }} />
                              </div>
                              <span className="text-[10px] font-black text-emerald-600">{perf.conversion_rate || 0}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!tagAnalyticsData?.tag_performance || tagAnalyticsData.tag_performance.length === 0) && (
                        <tr>
                          <td colSpan="5" className="px-8 py-20 text-center font-black text-slate-300 uppercase italic">
                            ไม่พบข้อมูลประสิทธิภาพในช่วงเวลานี้...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-md md:pl-[320px] lg:pl-[350px] overflow-y-auto pt-24 pb-12"
          >
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 40 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 40 }}
               className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[32px] shadow-[0_45px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative"
            >
               <div className="bg-[#581c87] text-white p-6 md:p-8 flex justify-between items-center relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                     <div className="p-3 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20">
                        <Tag size={24} strokeWidth={3} />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black tracking-tight uppercase italic">{selectedTag ? 'แก้ไขป้ายกำกับ' : 'สร้างป้ายกำกับใหม่'}</h2>
                        <p className="text-purple-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">Global Configuration System</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto bg-slate-50/20 p-6 md:p-8">
                  <div className="space-y-10">
                     
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4">
                           <div className="flex items-center gap-2 text-purple-900 mb-1">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#581c87]">
                                 <Layers size={18} />
                              </div>
                              <h3 className="font-black text-lg italic">1. ข้อมูลพื้นฐาน</h3>
                           </div>
                           
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ชื่อป้ายกำกับ *</label>
                                 <input 
                                    type="text" 
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="MEGA SALE, สินค้าแนะนำ..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-purple-900/5 focus:border-[#581c87] transition-all shadow-inner"
                                 />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">กลุ่ม (Group)</label>
                                    <select 
                                       value={tagGroup}
                                       onChange={(e) => setTagGroup(e.target.value)}
                                       className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-700 outline-none"
                                    >
                                       {existingGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                                    <input 
                                       type="number" 
                                       min="0"
                                       value={tagPriority}
                                       onChange={(e) => setTagPriority(Math.max(0, parseInt(e.target.value) || 0))}
                                       className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-[#581c87] outline-none"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4">
                           <div className="flex items-center gap-2 text-purple-900 mb-1">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#581c87]">
                                 <Star size={18} />
                              </div>
                              <h3 className="font-black text-lg italic">2. รูปแบบแสดงผล</h3>
                           </div>

                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">โทนสีป้าย</label>
                                 <div className="flex flex-wrap gap-2">
                                    {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#581c87', '#d946ef', '#64748b'].map(color => (
                                       <button key={color} onClick={() => setTagColor(color)} className={`w-8 h-8 rounded-full transition-all border-2 ${tagColor === color ? 'border-white scale-110 shadow-lg ring-1 ring-[#581c87]' : 'border-transparent opacity-60'}`} style={{ backgroundColor: color }} />
                                    ))}
                                    <input type="color" value={tagColor} onChange={e => setTagColor(e.target.value)} className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-white shadow-sm" />
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ไอคอน</label>
                                 <div className="grid grid-cols-6 gap-2 p-2 bg-slate-50/50 rounded-xl border border-slate-100 shadow-inner">
                                    {[
                                       { name: 'Tag', icon: Tag }, { name: 'Zap', icon: Zap }, { name: 'Star', icon: Star },
                                       { name: 'Award', icon: Award }, { name: 'Sparkles', icon: Sparkles }, { name: 'Percent', icon: Percent },
                                       { name: 'Gift', icon: Gift }, { name: 'Clock', icon: Clock }, { name: 'Package', icon: Package },
                                       { name: 'ShoppingBag', icon: ShoppingBag }, { name: 'Activity', icon: Activity }, { name: 'Hash', icon: Hash }
                                    ].map(item => (
                                       <button key={item.name} onClick={() => handleIconSelect(item.name)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${tagIcon === item.name ? 'bg-[#581c87] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}>
                                          <item.icon size={16} strokeWidth={tagIcon === item.name ? 3 : 2} />
                                       </button>
                                    ))}
                                 </div>
                               </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-[#581c87] p-10 rounded-[50px] shadow-3xl text-white relative overflow-hidden group border border-white/5">
                              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/10 transition-all duration-700"></div>
                              
                              <div className="flex flex-col md:flex-row gap-10 items-center">
                                 <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-2">
                                       <div className="p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                                          <Zap size={22} className="text-amber-300" fill="currentColor" />
                                       </div>
                                       <h3 className="text-2xl font-black uppercase tracking-tight">ระบบคัดกรองอัตโนมัติ (AI Rules)</h3>
                                    </div>
                                    <p className="text-purple-100 font-medium text-xs leading-relaxed max-w-lg">
                                       ระบบจะสแกนคลังสินค้าของคุณทุกคืนและติดป้ายนี้ให้โดยอัตโนมัติตามยอดขายและสต็อกจริง
                                    </p>
                                    
                                    <div className="relative max-w-sm">
                                       <select 
                                          value={smartRule}
                                          onChange={(e) => setSmartRule(e.target.value)}
                                          className="w-full bg-white text-[#581c87] py-4 px-6 rounded-2xl font-black text-sm outline-none shadow-2xl appearance-none cursor-pointer"
                                       >
                                          <option value="">🚫 ปิดใช้งานระบบรันกฎ</option>
                                          <option value="best_seller">🏆 แชมป์เปี้ยน (Top 5%)</option>
                                          <option value="hot_selling">🔥 สินค้ามาแรง (Trending)</option>
                                          <option value="new_arrival">🆕 สินค้าใหม่ (7 วัน)</option>
                                          <option value="low_stock">⌛ สต็อกต่ำ (&lt; 5 ชิ้น)</option>
                                          <option value="on_sale">🏷️ สินค้าลดราคา</option>
                                       </select>
                                       <MoreHorizontal size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
                                    </div>
                                 </div>

                                  <div className="w-full md:w-80 shrink-0">
                                    <div className="p-8 bg-black/20 backdrop-blur-3xl rounded-[40px] border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
                                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                       
                                       <div className="flex justify-between items-center">
                                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-200">Product Preview</p>
                                          <div className="flex gap-1">
                                             <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                             <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                                             <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                          </div>
                                       </div>

                                       {/* 🖼️ Real-world Mockup */}
                                       <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-inner group/preview">
                                          <img 
                                             src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" 
                                             alt="Sample Product" 
                                             className="w-full h-full object-cover transform group-hover/preview:scale-110 transition-transform duration-700 opacity-90"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                          
                                          {/* 🏷️ The Tag Overlay */}
                                          <motion.div 
                                             initial={{ x: -20, opacity: 0 }}
                                             animate={{ x: 0, opacity: 1 }}
                                             transition={{ delay: 0.2 }}
                                             className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-xl"
                                             style={{ backgroundColor: tagColor, color: '#fff' }}
                                          >
                                             {(() => {
                                                const IconComp = [
                                                   { name: 'Tag', icon: Tag }, { name: 'Zap', icon: Zap }, { name: 'Star', icon: Star },
                                                   { name: 'Award', icon: Award }, { name: 'Sparkles', icon: Sparkles }, { name: 'Percent', icon: Percent },
                                                   { name: 'Gift', icon: Gift }, { name: 'Clock', icon: Clock }, { name: 'Package', icon: Package },
                                                   { name: 'ShoppingBag', icon: ShoppingBag }, { name: 'Activity', icon: Activity }, { name: 'Hash', icon: Hash }
                                                ].find(i => i.name === tagIcon)?.icon || Tag;
                                                return <IconComp size={14} fill="currentColor" />;
                                             })()}
                                             <span className="font-black text-[10px] uppercase tracking-wider">{newTagName || 'PREVIEW'}</span>
                                          </motion.div>
                                          
                                          {/* Price Tag Mockup */}
                                          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                                             <span className="text-xs font-black text-slate-900">฿1,290</span>
                                          </div>
                                       </div>

                                       <div className="pt-2">
                                          <p className="text-[10px] text-center font-bold text-purple-100 leading-relaxed italic opacity-80">
                                            "ตัวอย่างการแสดงผลบนการ์ดสินค้าจริงในแอปฯ"
                                          </p>
                                       </div>
                                    </div>
                                  </div>
                              </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center px-1">
                             <div className="space-y-0.5">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">เลือกรายการสินค้า (Manual)</h3>
                                <p className="text-slate-400 font-medium text-xs">ระบุสินค้าที่ต้องการใช้งานด้วยตัวเอง</p>
                             </div>
                             <div className="flex gap-2 items-center">
                                <div className="bg-slate-100 p-0.5 rounded-lg flex gap-0.5">
                                   <button 
                                      onClick={() => setViewMode('grid')}
                                      className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#581c87]' : 'text-slate-400 hover:text-slate-600'}`}
                                      title="กริด"
                                   >
                                      <LayoutGrid size={16} />
                                   </button>
                                   <button 
                                      onClick={() => setViewMode('table')}
                                      className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#581c87]' : 'text-slate-400 hover:text-slate-600'}`}
                                      title="ตาราง"
                                   >
                                      <List size={16} />
                                   </button>
                                </div>
                                <button 
                                   onClick={handleSelectToggle}
                                   className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                   เลือกทั้งหมด
                                </button>
                                <button 
                                   onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                   className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center gap-1.5 ${showAdvancedFilters ? 'bg-[#581c87] text-white' : 'bg-white text-[#581c87] border border-purple-100 hover:bg-purple-50'}`}
                                >
                                   <SlidersHorizontal size={12} /> ตัวกรอง
                                </button>
                             </div>
                         </div>

                         {/* 🛒 Selected Items Tray (Memory System) */}
                         <AnimatePresence>
                            {selectedProducts.length > 0 && (
                               <motion.div 
                                  initial={{ opacity: 0, y: -20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  className="bg-purple-900/90 backdrop-blur-xl p-4 rounded-[28px] border border-purple-400/20 shadow-2xl space-y-3 mb-4"
                               >
                                  <div className="flex justify-between items-center px-2">
                                     <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" />
                                        <p className="text-[10px] font-black uppercase text-purple-100 tracking-widest">สินค้าที่เลือกไว้แล้ว ({selectedProducts.length})</p>
                                     </div>
                                     <button 
                                        onClick={() => setSelectedProducts([])}
                                        className="text-[9px] font-bold text-purple-300 hover:text-white transition-colors"
                                     >
                                        ล้างทั้งหมด
                                     </button>
                                  </div>
                                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                                     {selectedProducts.map(id => {
                                        const p = products.find(item => item.id === id);
                                        if (!p) return null;
                                        return (
                                           <div key={id} className="relative group shrink-0">
                                              <img 
                                                 src={getImageUrl(p.thumbnail)} 
                                                 className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400/30 group-hover:border-white transition-all shadow-lg" 
                                                 alt="" 
                                              />
                                              <button 
                                                 onClick={() => toggleProduct(id)}
                                                 className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110"
                                              >
                                                 <X size={10} strokeWidth={4} />
                                              </button>
                                           </div>
                                        )
                                     })}
                                  </div>
                               </motion.div>
                            )}
                         </AnimatePresence>

                         <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-50 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-3">
                               <div className="relative flex-1 group">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                  <input 
                                     type="text" 
                                     placeholder="ค้นหาชื่อสินค้า..." 
                                     value={productSearchTerm}
                                     onChange={e => setProductSearchTerm(e.target.value)}
                                     className="w-full bg-slate-50/50 pl-11 pr-4 py-2.5 rounded-xl border border-slate-100/50 text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-purple-500/5 focus:border-purple-200 transition-all"
                                  />
                               </div>
                               <div className="flex items-center gap-2">
                                  <button 
                                     onClick={() => setCategoryFilter('ทั้งหมด')}
                                     className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'ทั้งหมด' ? 'bg-[#581c87] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                  >
                                     ทั้งหมด
                                  </button>
                                  <div className="h-6 w-[1px] bg-slate-100 hidden md:block" />
                                  <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[400px]">
                                     {activeCategories.filter(c => c !== 'ทั้งหมด').map(c => (
                                        <button 
                                           key={c}
                                           onClick={() => setCategoryFilter(c)}
                                           className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === c ? 'bg-[#581c87] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                           {c}
                                        </button>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>

                         {showAdvancedFilters && (
                            <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               className="grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                               <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-3">
                                  <p className="text-[10px] font-black uppercase text-slate-400">ช่วงราคาสินค้า</p>
                                  <div className="flex gap-3">
                                     <input value={priceRange.min} onChange={e=>setPriceRange({...priceRange, min: e.target.value})} type="number" placeholder="ต่ำสุด" className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" />
                                     <input value={priceRange.max} onChange={e=>setPriceRange({...priceRange, max: e.target.value})} type="number" placeholder="สูงสุด" className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" />
                                  </div>
                               </div>
                               <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-3">
                                  <p className="text-[10px] font-black uppercase text-slate-400">สถานะสต็อก</p>
                                  <div className="flex gap-2">
                                     {['all', 'in_stock', 'low_stock'].map(s => (
                                        <button key={s} onClick={()=>setStockFilter(s)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${stockFilter === s ? 'bg-[#581c87] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                           {s === 'all' ? 'ทั้งหมด' : s === 'in_stock' ? 'มีสต็อก' : 'สต็อกต่ำ'}
                                        </button>
                                     ))}
                                  </div>
                               </div>
                               <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-3">
                                  <p className="text-[10px] font-black uppercase text-slate-400">ตัวกรองด่วน</p>
                                  <div className="flex gap-2">
                                     {['all', 'flash_sale', 'new_arrival'].map(q => (
                                        <button key={q} onClick={()=>setQuickFilter(q)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${quickFilter === q ? 'bg-[#581c87] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                           {q === 'all' ? 'ทั้งหมด' : q === 'flash_sale' ? 'Flash Sale' : 'มาใหม่'}
                                        </button>
                                     ))}
                                  </div>
                               </div>

                               {/* 🆕 New Filters Row */}
                               <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-3">
                                  <p className="text-[10px] font-black uppercase text-slate-400">การเรียงลำดับ (Sort)</p>
                                  <select 
                                     value={sortBy} 
                                     onChange={(e) => setSortBy(e.target.value)}
                                     className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold font-sans outline-none cursor-pointer"
                                  >
                                     <option value="newest">🕒 ล่าสุด (Newest)</option>
                                     <option value="price_asc">💰 ราคา: ต่ำ-สูง</option>
                                     <option value="price_desc">💵 ราคา: สูง-ต่ำ</option>
                                     <option value="name_asc">🔠 ชื่อสินค้า A-Z</option>
                                  </select>
                               </div>

                               <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-3 flex flex-col justify-center">
                                  <div className="flex items-center justify-between">
                                     <p className="text-[10px] font-black uppercase text-slate-400">แสดงเฉพาะลดราคา</p>
                                     <label className="relative inline-flex items-center cursor-pointer">
                                         <input 
                                             type="checkbox" 
                                             className="sr-only peer"
                                             checked={onlyDiscounted}
                                             onChange={() => setOnlyDiscounted(!onlyDiscounted)}
                                         />
                                         <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#581c87]"></div>
                                     </label>
                                  </div>
                               </div>

                               <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-3">
                                  <p className="text-[10px] font-black uppercase text-slate-400">จำนวนที่แสดง (Per Page)</p>
                                  <div className="flex gap-2">
                                     {[12, 24, 48, 96].map(num => (
                                        <button key={num} onClick={()=>setItemsPerPage(num)} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${itemsPerPage === num ? 'bg-[#581c87] text-white' : 'bg-slate-50 text-slate-400'}`}>
                                           {num}
                                        </button>
                                     ))}
                                  </div>
                               </div>
                            </motion.div>
                         )}

                         <div className="bg-white rounded-2xl shadow-xl border border-slate-50 p-3 min-h-[400px]">
                            {viewMode === 'grid' ? (
                               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                  {paginatedProducts.map(product => {
                                     const isSelected = selectedProducts.includes(product.id);
                                     return (
                                        <div 
                                           key={product.id}
                                           onClick={() => toggleProduct(product.id)}
                                           className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${isSelected ? 'border-[#581c87] scale-[0.98] shadow-2xl' : 'border-transparent hover:shadow-xl'}`}
                                        >
                                           <img src={getImageUrl(product.thumbnail)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                           <div className={`absolute inset-0 flex items-center justify-center transition-all ${isSelected ? 'bg-[#581c87]/30 backdrop-blur-[2px]' : 'bg-black/0 group-hover:bg-black/5'}`}>
                                              {isSelected && (
                                                  <motion.div initial={{scale:0}} animate={{scale:1}}>
                                                     <Check size={40} className="text-white drop-shadow-2xl" strokeWidth={4} />
                                                  </motion.div>
                                              )}
                                           </div>
                                           <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                              <p className="text-white text-[11px] font-black uppercase truncate mb-0.5">{product.title}</p>
                                              <div className="flex justify-between items-center">
                                                 <p className="text-purple-300 font-bold text-[10px]">฿{product.price.toLocaleString()}</p>
                                                 <div className="w-1.5 h-1.5 rounded-full bg-purple-400 opacity-50" />
                                              </div>
                                           </div>
                                        </div>
                                     )
                                  })}
                               </div>
                            ) : (
                               <div className="overflow-x-auto">
                                  <table className="w-full text-left border-separate border-spacing-y-2">
                                     <thead>
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                           <th className="px-6 py-4">เลือก</th>
                                           <th className="px-6 py-4">สินค้า</th>
                                           <th className="px-6 py-4">หมวดหมู่</th>
                                           <th className="px-6 py-4 text-right">ราคา</th>
                                           <th className="px-6 py-4 text-center">คลัง</th>
                                        </tr>
                                     </thead>
                                     <tbody>
                                        {paginatedProducts.map(product => {
                                           const isSelected = selectedProducts.includes(product.id);
                                           return (
                                              <tr 
                                                 key={product.id} 
                                                 onClick={() => toggleProduct(product.id)}
                                                 className={`group cursor-pointer transition-all ${isSelected ? 'bg-purple-50' : 'bg-slate-50/50 hover:bg-slate-50'}`}
                                              >
                                                 <td className="px-6 py-3 rounded-l-[20px]">
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#581c87] border-[#581c87]' : 'border-slate-200'}`}>
                                                       {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                 </td>
                                                 <td className="px-6 py-3">
                                                    <div className="flex items-center gap-4">
                                                       <img src={getImageUrl(product.thumbnail)} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                                                       <span className="font-bold text-slate-700">{product.title}</span>
                                                    </div>
                                                 </td>
                                                 <td className="px-6 py-3">
                                                    <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase">{product.category}</span>
                                                 </td>
                                                 <td className="px-6 py-3 text-right">
                                                    <span className="font-black text-[#581c87]">฿{product.price.toLocaleString()}</span>
                                                 </td>
                                                 <td className="px-6 py-3 text-center">
                                                    <span className={`font-black text-xs ${product.stock <= 10 ? 'text-red-500' : 'text-slate-400'}`}>{product.stock}</span>
                                                 </td>
                                              </tr>
                                           )
                                        })}
                                     </tbody>
                                  </table>
                               </div>
                            )}
                            
                            {paginatedProducts.length === 0 && (
                               <div className="py-20 text-center font-black text-slate-300 uppercase italic">ไม่พบสินค้าที่คุณต้องการเลือก...</div>
                            )}
                         </div>
                         
                         <div className="flex flex-col items-center gap-4 pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-6">
                               <button 
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#581c87] hover:border-[#581c87] disabled:opacity-20 transition-all shadow-sm"
                               >
                                  <ChevronLeft size={18} strokeWidth={3} />
                                </button>

                                <div className="flex flex-col items-center">
                                   <span className="text-lg font-black text-[#581c87] tabular-nums">
                                      {currentPage} <span className="text-slate-200 mx-0.5">/</span> {totalPages || 1}
                                   </span>
                                </div>

                                <button 
                                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                   disabled={currentPage === totalPages || totalPages === 0}
                                   className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#581c87] hover:border-[#581c87] disabled:opacity-20 transition-all shadow-sm"
                                >
                                   <ChevronRight size={18} strokeWidth={3} />
                                </button>
                             </div>

                             <div className="bg-purple-900 text-white px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                                <Package size={14} className="text-purple-300" />
                                <span>เลือกแล้ว: <span className="text-white font-black">{selectedProducts.length}</span> / {filteredProducts.length}</span>
                             </div>
                          </div>
                      </div>
                  </div>
               </div>

               <div className="bg-white border-t border-slate-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 z-30">
                  <div className="flex items-center gap-6">
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global Setup</p>
                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 rounded-full shadow-lg" style={{backgroundColor: tagColor}}></div>
                           <h2 className="text-xl font-black text-slate-800 tracking-tight italic">{newTagName || 'No Name'}</h2>
                           <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-400 border border-slate-200 uppercase">{tagGroup}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                     <button onClick={() => setShowCreateModal(false)} className="px-6 py-3 rounded-xl font-black text-slate-400 hover:text-slate-800 transition-all uppercase tracking-widest text-[10px]">ยกเลิก</button>
                     <button 
                        onClick={handleSaveTag}
                        disabled={loading}
                        className="px-10 py-3 bg-[#581c87] text-white rounded-xl font-black shadow-lg hover:bg-[#4c1d95] transition-all flex items-center gap-3 uppercase tracking-widest text-[10px]"
                     >
                        {loading ? 'บันทึก...' : <><Check size={16} strokeWidth={4} /> บันทึกใช้งาน</>}
                     </button>
                  </div>
               </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function hasTag(product, tagId) {
    return product.tags && product.tags.some(t => t.id === tagId);
}

export default TagManagement;

