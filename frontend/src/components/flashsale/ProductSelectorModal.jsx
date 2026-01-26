import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Package, Filter, SlidersHorizontal, Tag, AlertCircle, ChevronRight, Zap, ArrowUpDown } from 'lucide-react';

const ProductSelectorModal = ({ 
    isOpen, 
    onClose, 
    products = [], 
    categories = [], 
    onConfirm, 
    initialSelected = [],
    apiBaseUrl = "http://localhost:8000"
}) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortOrder, setSortOrder] = useState(null); // 'asc', 'desc', null
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; 
    
    const [localSelected, setLocalSelected] = useState(new Set(initialSelected.map(p => p.product_id || p.id)));

    useEffect(() => {
        if (isOpen) {
            setLocalSelected(new Set(initialSelected.map(p => p.product_id || p.id)));
            setSearchTerm('');
            setPriceRange({ min: '', max: '' });
            setSelectedCategory(null);
        }
    }, [isOpen, initialSelected]);

    const getImageUrl = (path) => {
        if (!path) return "/placeholder.png";
        if (path.startsWith("http") || path.startsWith("blob:")) return path;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        if (cleanPath.startsWith('media/')) return `${apiBaseUrl}/${cleanPath}`;
        return `${apiBaseUrl}/media/${cleanPath}`;
    };

    const isProductInCat = (p, cat) => {
        if (!cat) return true;
        const pVal = p.category;
        const cId = typeof cat === 'object' ? cat.id : cat;
        const cName = typeof cat === 'object' ? cat.name : cat;
        if (pVal == cId) return true;
        if (pVal == cName) return true;
        if (typeof pVal === 'object' && pVal !== null) {
            if (pVal.id == cId) return true;
            if (pVal.name === cName) return true;
        }
        return false;
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (selectedCategory && !isProductInCat(p, selectedCategory)) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const titleMatch = (p.title || p.product_name || '').toLowerCase().includes(term);
                const codeMatch = (p.code || p.id?.toString() || '').toLowerCase().includes(term);
                if (!titleMatch && !codeMatch) return false;
            }
            const price = parseFloat(p.price || 0);
            if (priceRange.min && price < parseFloat(priceRange.min)) return false;
            if (priceRange.max && price > parseFloat(priceRange.max)) return false;
            return true;
        });
    }, [products, selectedCategory, searchTerm, priceRange]);

    const sortedProducts = useMemo(() => {
        let result = [...filteredProducts];
        if (sortOrder) {
            result.sort((a, b) => {
                const priceA = parseFloat(a.price || 0);
                const priceB = parseFloat(b.price || 0);
                return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
            });
        }
        return result;
    }, [filteredProducts, sortOrder]);

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedProducts.slice(start, start + itemsPerPage);
    }, [sortedProducts, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [selectedCategory, searchTerm, priceRange]);

    const toggleSelect = (product) => {
        const id = product.id;
        setLocalSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelectAll = () => {
        const allFilteredIds = filteredProducts.map(p => p.id);
        const allSelected = allFilteredIds.every(id => localSelected.has(id));
        setLocalSelected(prev => {
            const next = new Set(prev);
            if (allSelected) allFilteredIds.forEach(id => next.delete(id));
            else allFilteredIds.forEach(id => next.add(id));
            return next;
        });
    };

    const handleConfirmSelection = () => {
        const selectedObjects = products.filter(p => localSelected.has(p.id));
        onConfirm(selectedObjects);
        onClose();
    };

    const getCategoryName = (p) => {
        if (typeof p.category === 'object') return p.category.name;
        const found = categories.find(c => c.id == p.category || c.name === p.category);
        return found ? (typeof found === 'object' ? found.name : found) : (p.category || 'General');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 sm:p-10">
                    {/* Glassmorphism Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        onClick={onClose}
                        className="absolute inset-0 bg-orange-950/40 backdrop-blur-xl"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        className="bg-white/95 w-full max-w-7xl h-full max-h-[90vh] rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative z-50 border border-white/40"
                    >
                        {/* Header Section (Premium Orange Glass) */}
                        <div className="px-10 py-8 border-b border-orange-50 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white shrink-0">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200">
                                        <Package size={28} />
                                    </div>
                                    Inventory Selector
                                    <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-black ml-4 shadow-md">
                                        <Zap size={14} className="text-orange-400 fill-orange-400" />
                                        {products.length} รายการทั้งหมด
                                    </div>
                                </h2>
                            </div>
                            <button onClick={onClose} className="w-14 h-14 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all active:scale-95 border border-gray-100">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Premium Category Sidebar */}
                            <div className="w-80 bg-gray-50/50 border-r border-orange-50 flex flex-col shrink-0">
                                <div className="p-8">
                                    <h3 className="font-black text-[10px] text-orange-400 uppercase tracking-[0.3em] mb-6 px-2">หมวดหมู่สินค้า</h3>
                                    <div className="space-y-2 overflow-y-auto max-h-[calc(90vh-320px)] custom-scrollbar pr-4 pb-20">
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-black text-sm flex items-center justify-between group ${
                                                selectedCategory === null 
                                                ? 'bg-orange-500 text-white shadow-xl shadow-orange-200 translate-x-1' 
                                                : 'text-gray-500 hover:bg-white hover:text-orange-500 hover:shadow-sm'
                                            }`}
                                        >
                                            <span className="truncate">ทุกหมวดหมู่</span>
                                            {selectedCategory === null ? <Check size={18} /> : <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </button>
                                        
                                        {categories.map((c, idx) => {
                                            const cName = typeof c === 'object' ? c.name : c;
                                            const isSelected = selectedCategory === c;
                                            const count = products.filter(p => isProductInCat(p, c)).length;
                                            
                                            // Hide empty categories
                                            if (count === 0) return null;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedCategory(c)}
                                                    className={`w-full text-left px-5 py-4 rounded-2xl transition-all font-black text-sm flex items-center justify-between group ${
                                                        isSelected
                                                        ? 'bg-gray-900 text-white shadow-xl translate-x-1' 
                                                        : 'text-gray-500 hover:bg-white hover:text-orange-500 hover:shadow-sm'
                                                    }`}
                                                >
                                                    <span className="truncate flex-1">{cName}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                                {/* Advanced Multi-Filter Bar */}
                                <div className="px-10 py-8 border-b border-orange-50 bg-white/50 backdrop-blur-sm flex flex-col md:flex-row gap-6 items-center justify-between relative z-20">
                                    <div className="relative w-full md:max-w-xl">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-400" size={24} />
                                        <input 
                                            type="text" 
                                            placeholder="ค้นหาด้วยชื่อ, SKU, หรือรหัสสินค้า..." 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                            className="w-full bg-gray-50/80 border-2 border-transparent focus:border-orange-500 rounded-2xl pl-16 pr-6 py-4 font-black text-gray-800 outline-none focus:ring-[8px] focus:ring-orange-100 focus:bg-white transition-all placeholder:text-gray-300 placeholder:font-bold"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-2xl border border-gray-100 group">
                                         <div className="px-4 text-orange-500 flex items-center gap-3">
                                            <SlidersHorizontal size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">ช่วงราคา</span>
                                        </div>
                                        <input 
                                            type="number" className="w-28 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-center outline-none focus:border-orange-500 transition-all"
                                            placeholder="ต่ำสุด" value={priceRange.min} onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                                        />
                                        <div className="w-2 h-0.5 bg-gray-300 rounded-full" />
                                        <input 
                                            type="number" className="w-28 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-center outline-none focus:border-orange-500 transition-all"
                                            placeholder="สูงสุด" value={priceRange.max} onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setSortOrder(prev => {
                                            if (prev === null) return 'asc';
                                            if (prev === 'asc') return 'desc';
                                            return null;
                                        })}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-black text-xs transition-all ${
                                            sortOrder 
                                            ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm' 
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200'
                                        }`}
                                    >
                                        <ArrowUpDown size={16} />
                                        ราคา 
                                        {sortOrder === 'asc' && '(ต่ำ-สูง)'}
                                        {sortOrder === 'desc' && '(สูง-ต่ำ)'}
                                    </button>
                                </div>

                                {/* Dynamic Product Grid / Table */}
                                <div className="flex-1 overflow-auto custom-scrollbar px-10">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-white sticky top-0 z-10">
                                            <tr>
                                                <th className="py-6 w-40">
                                                    <div className="flex items-center gap-3 cursor-pointer group" onClick={handleSelectAll}>
                                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${filteredProducts.length > 0 && filteredProducts.every(p => localSelected.has(p.id)) ? 'bg-orange-500 border-orange-500 shadow-md' : 'border-gray-200 group-hover:border-orange-400'}`}>
                                                            {filteredProducts.length > 0 && filteredProducts.every(p => localSelected.has(p.id)) && <Check size={14} className="text-white" strokeWidth={4} />}
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 group-hover:text-orange-500 transition-colors uppercase tracking-[0.2em]">เลือกทั้งหมด</span>
                                                    </div>
                                                </th>
                                                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">รายละเอียดสินค้า</th>
                                                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">หมวดหมู่</th>
                                                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">คงเหลือ</th>
                                                <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">ราคาปกติ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 pb-20">
                                            {filteredProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5">
                                                        <div className="flex flex-col items-center justify-center py-32 text-gray-300 animate-in fade-in zoom-in duration-500">
                                                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                                                <AlertCircle size={48} />
                                                            </div>
                                                            <p className="font-black text-xl text-gray-400">ไม่พบสินค้าที่ตรงกัน</p>
                                                            <p className="text-sm font-bold opacity-60">ลองปรับตัวกรองหรือเลือกหมวดหมู่อื่น</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedProducts.map(product => {
                                                    const isSelected = localSelected.has(product.id);
                                                    return (
                                                        <tr 
                                                            key={product.id} 
                                                            onClick={() => toggleSelect(product)}
                                                            className={`cursor-pointer transition-all duration-300 group ${isSelected ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
                                                        >
                                                            <td className="py-5">
                                                                 <div className="flex items-center pointer-events-none">
                                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500 shadow-lg scale-110' : 'border-gray-200 group-hover:border-orange-400'}`}>
                                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-5">
                                                                <div className="flex items-center gap-5">
                                                                    <div className="relative group/img overflow-hidden">
                                                                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 p-1 shrink-0 shadow-sm transition-transform group-hover/img:scale-105 duration-300">
                                                                            <img 
                                                                                src={getImageUrl(product.image || product.thumbnail)} 
                                                                                alt="" 
                                                                                className="w-full h-full object-cover rounded-[1rem]"
                                                                                onError={(e) => e.target.src = "/placeholder.png"}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-black text-gray-900 text-base line-clamp-1 tracking-tight">{product.title || product.product_name}</div>
                                                                        <div className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-wider">SKU: {product.code || product.id}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-5">
                                                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black border border-blue-100 shadow-sm uppercase tracking-wider">
                                                                    <Tag size={12} className="fill-blue-600" />
                                                                    {getCategoryName(product)}
                                                                </span>
                                                            </td>
                                                            <td className="py-5 text-center">
                                                                <div className={`text-sm font-black inline-flex items-center gap-2 px-3 py-1 rounded-lg ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                                                    {product.stock || 0}
                                                                </div>
                                                            </td>
                                                            <td className="py-5 text-right">
                                                                <span className="text-lg font-black text-gray-900 tracking-tighter">
                                                                    ฿{(parseFloat(product.price) || 0).toLocaleString()}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                         {/* High-Fidelity Professional Footer */}
                         <div className="px-10 py-8 border-t border-orange-50 bg-gray-50/50 flex justify-between items-center shrink-0 shadow-[0_-12px_48px_rgba(0,0,0,0.05)] relative z-30">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 px-6 py-3 bg-gray-900 rounded-2xl shadow-xl">
                                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">เลือกแล้ว:</span>
                                    <span className="text-xl font-black text-white">{localSelected.size}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">รายการ</span>
                                </div>
                                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm font-black text-xs text-gray-500">
                                     <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 rounded-xl hover:bg-orange-500 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300 transition-all flex items-center justify-center active:scale-90"
                                     >
                                         <ChevronRight size={24} className="rotate-180" />
                                     </button>
                                     <span className="tracking-widest">หน้า {currentPage} จาก {totalPages || 1}</span>
                                     <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="w-10 h-10 rounded-xl hover:bg-orange-500 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300 transition-all flex items-center justify-center active:scale-90"
                                     >
                                         <ChevronRight size={24} />
                                     </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 uppercase text-xs tracking-widest">ยกเลิก</button>
                                <button 
                                    onClick={handleConfirmSelection}
                                    disabled={localSelected.size === 0}
                                    className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-[1.25rem] font-black hover:shadow-2xl hover:shadow-orange-200 transition-all disabled:grayscale disabled:opacity-30 flex items-center gap-3 active:scale-95 uppercase text-sm tracking-widest shadow-xl shadow-orange-100"
                                >
                                    <Check size={20} strokeWidth={4} />
                                    ยืนยันการเลือก
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProductSelectorModal;
