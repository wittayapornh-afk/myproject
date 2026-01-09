import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { MapPin, Truck, CreditCard, Smartphone, ChevronLeft, ArrowRight, ShieldCheck, Mail, Phone, User, Upload, Check, X, Image as ImageIcon } from 'lucide-react';
import QRCode from "react-qr-code";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";

import { formatPrice, getImageUrl } from '../utils/formatUtils';
import { BANKS } from '../data/banks'; // ✅ Shared Bank Data

import thaiData from '../data/ThaiAddressData.json'; // ✅ Full Address Data

registerLocale("th", th);

function CheckoutPage() {
    const { cartItems, getTotalPrice, clearCart } = useCart();
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        name: '', tel: '', email: '',
        address_details: '', // House No, Street
        province: '',
        district: '',
        subDistrict: '',
        zipcode: ''
    });

    // Address Selection State
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableSubDistricts, setAvailableSubDistricts] = useState([]);
    const [loading, setLoading] = useState(false);
    // Payment State
    const [paymentMethod, setPaymentMethod] = useState('Transfer');
    const [qrPayload, setQrPayload] = useState('');

    // Slip Upload State
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [bankName, setBankName] = useState('KBank');
    const [transferAmount, setTransferAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [transferDate, setTransferDate] = useState(new Date());

    // Toggle Bank Selection
    const handleBankSelect = (code) => {
        setBankName(code === bankName ? null : code);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // Auto-fill User Data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.username || '',
                tel: user.phone || '',
                email: user.email || '',
                address: user.address || '',
                province: '' // Province might not be in user profile initially
            });
        }
    }, [user]);

    // Update Amount & Generate QR when Cart Changes
    useEffect(() => {
        const total = getTotalPrice();
        setTransferAmount(total);
        if (total > 0 && token) {
            axios.post('http://localhost:8000/api/payment/promptpay_payload/', { amount: total }, {
                 headers: { Authorization: `Token ${token}` }
            })
            .then(res => setQrPayload(res.data.payload))
            .catch(err => console.error("QR Error", err));
        }
    }, [cartItems, token]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    // ✅ Thai Address Handlers
    const handleProvinceChange = (e) => {
        const provinceName = e.target.value;
        const provinceObj = thaiData.find(p => p.name_th === provinceName);
        
        setFormData({ 
            ...formData, 
            province: provinceName, 
            district: '', 
            subDistrict: '', 
            zipcode: '' 
        });
        
        setAvailableDistricts(provinceObj ? provinceObj.districts : []);
        setAvailableSubDistricts([]);
    };

    const handleDistrictChange = (e) => {
        const districtName = e.target.value;
        const districtObj = availableDistricts.find(d => d.name_th === districtName);
        
        setFormData({ 
            ...formData, 
            district: districtName, 
            subDistrict: '', 
            zipcode: '' 
        });
        
        setAvailableSubDistricts(districtObj ? districtObj.sub_districts : []);
    };

    const handleSubDistrictChange = (e) => {
        const subDistrictName = e.target.value;
        const subDistrictObj = availableSubDistricts.find(s => s.name_th === subDistrictName);
        
        setFormData({ 
            ...formData, 
            subDistrict: subDistrictName, 
            zipcode: subDistrictObj ? subDistrictObj.zip_code : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.province) return Swal.fire({ icon: 'warning', title: 'กรุณาเลือกจังหวัด', confirmButtonColor: '#1a4d2e' });

        // Validation for Transfer (QR or Bank)
        if (['QR', 'Bank'].includes(paymentMethod)) {
             if (!file) return Swal.fire({ icon: 'error', title: 'กรุณาแนบสลิปโอนเงิน', confirmButtonColor: '#1a4d2e' });
             if (!bankName) return Swal.fire({ icon: 'warning', title: 'กรุณาเลือกธนาคาร', confirmButtonColor: '#1a4d2e' });
             if (!accountNumber || accountNumber.length < 4) return Swal.fire({ icon: 'warning', title: 'ระบุเลขบัญชี 4 ตัวท้าย', confirmButtonColor: '#1a4d2e' });
        }

        setLoading(true);
        try {
            let storedToken = localStorage.getItem('token');
            if(!storedToken && user?.token) storedToken = user.token;

            if (!storedToken) {
                Swal.fire('Session Error', 'กรุณา Login ใหม่', 'error');
                logout(); navigate('/login'); return;
            }

            // 1. Create Order
            const payload = {
                items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
                customer: {
                    ...formData,
                    // Combine Address Components
                    address: `${formData.address_details} แขวง/ตำบล ${formData.subDistrict} เขต/อำเภอ ${formData.district} จังหวัด ${formData.province} ${formData.zipcode}`,
                    province: formData.province
                },
                paymentMethod: ['QR', 'Bank'].includes(paymentMethod) ? 'Transfer' : paymentMethod
            };

            const res = await axios.post('http://localhost:8000/api/checkout/', payload, {
                headers: { Authorization: `Token ${storedToken}` }
            });

            const orderId = res.data.order_id;

            // 2. Upload Slip (if Transfer/QR/Bank)
            if (['QR', 'Bank'].includes(paymentMethod) && file) {
                const slipData = new FormData();
                slipData.append('slip_image', file);
                slipData.append('transfer_amount', transferAmount);
                slipData.append('transfer_date', transferDate.toISOString());
                slipData.append('bank_name', bankName);
                slipData.append('transfer_account_number', accountNumber);

                await axios.post(`http://localhost:8000/api/upload_slip/${orderId}/`, slipData, {
                    headers: { Authorization: `Token ${storedToken}`, 'Content-Type': 'multipart/form-data' }
                });
            }

            clearCart();
            await Swal.fire({
                icon: 'success',
                title: 'สั่งซื้อสำเร็จ!',
                text: ['QR', 'Bank'].includes(paymentMethod) ? 'เราได้รับหลักฐานการโอนเงินแล้ว' : 'ขอบคุณที่ใช้บริการ',
                confirmButtonColor: '#1a4d2e'
            });
            navigate('/order-history');

        } catch (error) {
            console.error(error);
            Swal.fire('เกิดข้อผิดพลาด', error.response?.data?.error || error.message, 'error');
        } finally {
            setLoading(false);
        }
    };


    if (cartItems.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F7]">
            <h2 className="text-xl font-black text-gray-800">ไม่มีสินค้าในตะกร้า</h2>
            <button onClick={() => navigate('/shop')} className="mt-4 text-[#1a4d2e] underline font-bold">กลับไปเลือกซื้อสินค้า</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9F9F7] py-12 px-4 md:px-8 pt-28 font-sans">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-400 font-bold mb-8 hover:text-[#1a4d2e] transition-all">
                    <ChevronLeft size={20} /> กลับไปตะกร้าสินค้า
                </button>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    
                    {/* Left Column: Details & Payment */}
                    <div className="lg:col-span-3 space-y-8">
                        
                        {/* 1. Shipping Address */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                             <h2 className="text-xl font-black text-[#263A33] mb-6 flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-[#1a4d2e] rounded-xl"><MapPin /></div> ข้อมูลจัดส่ง
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <input name="name" value={formData.name} onChange={handleChange} required placeholder="ชื่อ-นามสกุล" className="bg-gray-50 border-0 rounded-xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e]" />
                                     <input name="tel" value={formData.tel} onChange={handleChange} required placeholder="เบอร์โทรศัพท์" className="bg-gray-50 border-0 rounded-xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e]" />
                                </div>
                                <input name="email" value={formData.email} onChange={handleChange} required placeholder="อีเมล" className="w-full bg-gray-50 border-0 rounded-xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e]" />
                                

                                {/* A: ส่วนกรอกรายละเอียดที่อยู่ (บ้านเลขที่, ถนน) */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-700 ml-2">ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)</label>
                                    <textarea 
                                        name="address_details" 
                                        value={formData.address_details} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="ตัวอย่าง: 123/4 หมู่ 5 ถนนสุขุมวิท" 
                                        rows="2" 
                                        className="w-full bg-gray-50 border-0 rounded-xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e] resize-none transition-all hover:bg-white hover:shadow-md"
                                    ></textarea>
                                    
                                    {/* B: ส่วนเลือกที่อยู่แบบ Dropdown (Address Selection) */}
                                    <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">เลือกพื้นที่จัดส่ง</h3>
                                        
                                        {/* แถวที่ 1: จังหวัด และ อำเภอ */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 ml-2">จังหวัด</label>
                                                <select 
                                                    name="province" 
                                                    value={formData.province} 
                                                    onChange={handleProvinceChange} 
                                                    required 
                                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none cursor-pointer hover:border-[#1a4d2e] transition-all"
                                                >
                                                    <option value="">เลือกจังหวัด...</option>
                                                    {thaiData.map(p => (
                                                        <option key={p.id} value={p.name_th}>{p.name_th}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 ml-2">อำเภอ/เขต</label>
                                                <select 
                                                    name="district" 
                                                    value={formData.district} 
                                                    onChange={handleDistrictChange} 
                                                    disabled={!formData.province} 
                                                    required 
                                                    className={`w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none cursor-pointer hover:border-[#1a4d2e] transition-all ${!formData.province && 'opacity-50 cursor-not-allowed bg-gray-100'}`}
                                                >
                                                    <option value="">เลือกอำเภอ/เขต...</option>
                                                    {availableDistricts.map(d => (
                                                        <option key={d.id} value={d.name_th}>{d.name_th}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* แถวที่ 2: ตำบล และ รหัสไปรษณีย์ */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 ml-2">ตำบล/แขวง</label>
                                                <select 
                                                    name="subDistrict" 
                                                    value={formData.subDistrict} 
                                                    onChange={handleSubDistrictChange} 
                                                    disabled={!formData.district} 
                                                    required 
                                                    className={`w-full bg-white border border-gray-200 rounded-xl p-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e] appearance-none cursor-pointer hover:border-[#1a4d2e] transition-all ${!formData.district && 'opacity-50 cursor-not-allowed bg-gray-100'}`}
                                                >
                                                    <option value="">เลือกตำบล/แขวง...</option>
                                                    {availableSubDistricts.map(s => (
                                                        <option key={s.id} value={s.name_th}>{s.name_th}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 ml-2">รหัสไปรษณีย์</label>
                                                <input 
                                                    name="zipcode" 
                                                    value={formData.zipcode} 
                                                    readOnly 
                                                    placeholder="รอการเลือกตำบล..." 
                                                    className="w-full bg-gray-200/50 border-0 rounded-xl p-4 font-black text-gray-600 outline-none cursor-default" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 2. Payment Method Selected */}
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                             <h2 className="text-xl font-black text-[#263A33] mb-6 flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-[#1a4d2e] rounded-xl"><CreditCard size={24} /></div> วิธีชำระเงิน
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {/* Option 1: QR Code */}
                                <button type="button" onClick={() => setPaymentMethod('QR')}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${paymentMethod === 'QR' ? 'border-[#1a4d2e] bg-green-50/50 shadow-lg shadow-green-100' : 'border-gray-100 hover:border-gray-200 hover:bg-white'}`}>
                                    <div className={`p-3 rounded-xl transition-colors ${paymentMethod === 'QR' ? 'bg-[#1a4d2e] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#1a4d2e] group-hover:text-white'}`}>
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className={`font-black text-xs ${paymentMethod === 'QR' ? 'text-[#1a4d2e]' : 'text-gray-600'}`}>สแกน QR</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">เร็ว • ฟรีค่าธรรมเนียม</p>
                                    </div>
                                    {paymentMethod === 'QR' && <div className="absolute top-2 right-2 w-3 h-3 bg-[#1a4d2e] rounded-full border border-white"></div>}
                                </button>

                                {/* Option 2: Bank Transfer */}
                                <button type="button" onClick={() => setPaymentMethod('Bank')}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${paymentMethod === 'Bank' ? 'border-[#1e4598] bg-blue-50/50 shadow-lg shadow-blue-100' : 'border-gray-100 hover:border-gray-200 hover:bg-white'}`}>
                                    <div className={`p-3 rounded-xl transition-colors ${paymentMethod === 'Bank' ? 'bg-[#1e4598] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-[#1e4598] group-hover:text-white'}`}>
                                        <Truck size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className={`font-black text-xs ${paymentMethod === 'Bank' ? 'text-[#1e4598]' : 'text-gray-600'}`}>เลขบัญชี</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">โอนผ่านแอปธนาคาร</p>
                                    </div>
                                    {paymentMethod === 'Bank' && <div className="absolute top-2 right-2 w-3 h-3 bg-[#1e4598] rounded-full border border-white"></div>}
                                </button>

                                {/* Option 3: Credit Card */}
                                <button type="button" onClick={() => setPaymentMethod('Card')}
                                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${paymentMethod === 'Card' ? 'border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-100' : 'border-gray-100 hover:border-gray-200 hover:bg-white'}`}>
                                    <div className={`p-3 rounded-xl transition-colors ${paymentMethod === 'Card' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-orange-500 group-hover:text-white'}`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="text-center">
                                        <p className={`font-black text-xs ${paymentMethod === 'Card' ? 'text-orange-600' : 'text-gray-600'}`}>บัตรเครดิต</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">ปลอดภัย 100%</p>
                                    </div>
                                    {paymentMethod === 'Card' && <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full border border-white"></div>}
                                </button>
                            </div>

                            {/* Dynamic Content Body */}
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                
                                {/* 🟢 Section 1: Payment Details (QR or Bank) */}
                                {(paymentMethod === 'QR' || paymentMethod === 'Bank') && (
                                    <div className="space-y-6">
                                        
                                        {/* A: PromptPay QR Display */}
                                        {paymentMethod === 'QR' && (
                                            <div className="flex flex-col md:flex-row gap-6 items-center bg-[#1a4d2e] p-6 rounded-3xl text-white relative overflow-hidden transition-all">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                                

                                                <div className="bg-white p-3 rounded-2xl shadow-lg flex-shrink-0">
                                                    {qrPayload ? <QRCode value={qrPayload} size={140} /> : <div className="w-[140px] h-[140px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-[10px]">Generating...</div>}
                                                </div>
                                                <div className="flex-1 text-center md:text-left z-10">
                                                    <h3 className="font-bold text-lg mb-1">สแกนจ่ายได้เลย</h3>
                                                    <p className="text-green-200 text-xs mb-3">Save QR ไปสแกนในแอปธนาคารใดก็ได้</p>
                                                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                                                        <div className="text-[10px] text-green-200 uppercase tracking-widest font-bold">ยอดที่ต้องชำระ</div>
                                                        <div className="text-2xl font-black tracking-tight">฿{formatPrice(getTotalPrice()).replace('฿', '')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* B: Shop Bank Account Details */}
                                        {paymentMethod === 'Bank' && (
                                            <div className="bg-[#1e4598] p-6 rounded-3xl text-white relative overflow-hidden transition-all">
                                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                                                
                                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                                                    <img src="https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/KBANK.png" className="w-8 h-8 rounded-full border-2 border-white" alt="KBank"/>
                                                    ธนาคารกสิกรไทย (KBank)
                                                </h3>
                                                
                                                <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md relative z-10 space-y-3">
                                                    <div>
                                                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">เลขที่บัญชี</p>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-2xl font-black tracking-widest font-mono">012-3-45678-9</p>
                                                            <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors" title="Copy"><ArrowRight size={14}/></button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">ชื่อบัญชี</p>
                                                        <p className="text-lg font-bold">บจก. มายโปรเจกต์ สโตร์</p>
                                                    </div>
                                                    <div>
                                                         <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">ยอดโอน</p>
                                                         <p className="text-xl font-black">฿{formatPrice(getTotalPrice()).replace('฿', '')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 🔴 Section 2: Slip Upload Form (Shared by QR & Bank) */}
                                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <Upload size={18} className="text-[#1a4d2e]"/> แนบหลักฐานการโอน (สำคัญ)
                                            </h3>
                                            
                                            {/* Bank Selection (Sender) */}
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">เลือกธนาคารที่คุณโอน</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
                                                {BANKS.map((b) => (
                                                    <button type="button" key={b.code} onClick={() => handleBankSelect(b.code)}
                                                        className={`relative p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${bankName === b.code ? `${b.border} bg-white shadow-md ring-1 ring-inset transform -translate-y-1` : 'border-transparent hover:bg-white'}`}>
                                                        <div className={`w-8 h-8 rounded-full overflow-hidden ${!b.logo && 'bg-gray-200'}`}>
                                                            {b.logo && <img src={b.logo} alt={b.name} className="w-full h-full object-cover"/>}
                                                        </div>
                                                        <span className={`text-[9px] font-bold ${bankName === b.code ? 'text-gray-800' : 'text-gray-400'}`}>{b.name}</span>
                                                        {bankName === b.code && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div>
                                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">เลขบัญชี (4 ตัวท้าย)</p>
                                                     <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} maxLength={4} placeholder="XXXX" className="w-full bg-white border text-center font-bold text-gray-700 p-3 rounded-xl outline-none focus:ring-1 focus:ring-[#1a4d2e]" />
                                                </div>
                                                <div>
                                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">วัน/เวลาโอน</p>
                                                     <DatePicker selected={transferDate} onChange={(d) => setTransferDate(d)} showTimeSelect timeFormat="HH:mm" dateFormat="dd/MM HH:mm" className="w-full bg-white border text-center font-bold text-gray-700 p-3 rounded-xl outline-none focus:ring-1 focus:ring-[#1a4d2e]" />
                                                </div>
                                            </div>

                                            {/* File Upload Area */}
                                            <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-32 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden group">
                                                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                                {preview ? (
                                                    <div className="relative w-full h-full p-2 bg-gray-50">
                                                        <img src={preview} className="w-full h-full object-contain rounded-xl" />
                                                        <button onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 shadow-sm z-20 hover:scale-110 transition-transform"><X size={14}/></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="p-3 bg-gray-100 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                                             <ImageIcon className="text-gray-400 group-hover:text-[#1a4d2e]" size={24} />
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-bold group-hover:text-[#1a4d2e] transition-colors">คลิกเพื่อแนบสลิป</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 🟠 Section 3: Credit Card Form (Dummy) */}
                                {paymentMethod === 'Card' && (
                                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 text-center space-y-4">
                                        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CreditCard size={32} />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-700">ชำระผ่านบัตรเครดิต</h3>
                                        <p className="text-sm text-gray-500">ระบบกำลังปรับปรุงเพื่อรองรับการชำระเงินผ่านบัตรเครดิตและเดบิตเร็วๆ นี้</p>
                                        <button disabled className="bg-gray-200 text-gray-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed text-sm">Coming Soon</button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#1a4d2e] p-8 rounded-[3rem] text-white shadow-xl sticky top-28">
                            <h2 className="text-xl font-black mb-6 border-b border-white/10 pb-4">สรุปคำสั่งซื้อ</h2>
                            <div className="space-y-4 mb-8 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center">

                                         <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0 p-1">
                                             <img src={getImageUrl(item.thumbnail)} className="w-full h-full object-contain" />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                             <p className="text-xs font-bold truncate">{item.title}</p>
                                             <p className="text-[10px] text-white/50">x{item.quantity}</p>
                                         </div>
                                         <p className="font-black text-sm">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                            

                            <div className="border-t border-white/10 pt-4 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-white/60">
                                    <span>ยอดรวม</span>
                                    <span>{formatPrice(getTotalPrice())}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-white/60">
                                    <span>ค่าส่ง</span>
                                    <span className="text-green-300">ฟรี</span>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <span className="text-2xl font-black">ยอดสุทธิ</span>
                                    <span className="text-3xl font-black">{formatPrice(getTotalPrice())}</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full mt-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 
                                ${loading ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-[#1a4d2e] hover:shadow-xl hover:-translate-y-1 active:scale-95'}`}
                            >
                                {loading ? 'Processing...' : (
                                    <>ยืนยันสั่งซื้อ & ชำระเงิน <ArrowRight size={20}/></>
                                )}
                            </button>
                            <p className="text-[10px] text-center mt-4 text-white/40">* 100% Secure Payment</p>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default CheckoutPage;