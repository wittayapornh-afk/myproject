import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Upload, X, Check, Image as ImageIcon, Copy, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QRCode from "react-qr-code";
import DatePicker, { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";

// ✅ Register Locale for DatePicker
registerLocale("th", th);

// 🎨 Bank Data with Real Logos
const BANKS = [
    { code: 'KBank', name: 'กสิกรไทย', color: '#138f2d', border: 'border-[#138f2d]', logo: 'https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/KBANK.png' },
    { code: 'SCB', name: 'ไทยพาณิชย์', color: '#4e2e7f', border: 'border-[#4e2e7f]', logo: 'https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/SCB.png' },
    { code: 'KTB', name: 'กรุงไทย', color: '#00a5e3', border: 'border-[#00a5e3]', logo: 'https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/KTB.png' },
    { code: 'BBL', name: 'กรุงเทพ', color: '#1e4598', border: 'border-[#1e4598]', logo: 'https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/BBL.png' },
    { code: 'TTB', name: 'ทหารไทยฯ', color: '#0564b7', border: 'border-[#0564b7]', logo: 'https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/TTB.png' },
    { code: 'GSB', name: 'ออมสิน', color: '#eb198d', border: 'border-[#eb198d]', logo: 'https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/GSB.png' },
    { code: 'BAY', name: 'กรุงศรี', color: '#fec43b', border: 'border-[#fec43b]', logo: 'https://raw.githubusercontent.com/casperstack/thai-banks-logo/master/icons/BAY.png' },
];

export default function PaymentModal({ isOpen, onClose, orderId, onSuccess, orderTotal, promptPayPayload }) {
    const { token } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ New Fields
    const [bankName, setBankName] = useState('KBank');
    const [transferAmount, setTransferAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState(''); // ✅ Account Number
    const [transferDate, setTransferDate] = useState(new Date());

    useEffect(() => {
        if (isOpen && orderTotal) {
            setTransferAmount(orderTotal); // Prefill amount
        }
    }, [isOpen, orderTotal]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // ✅ Toggle Bank Selection
    const handleBankSelect = (code) => {
        if (bankName === code) {
            setBankName(null); // Deselect if clicking same bank
        } else {
            setBankName(code);
        }
    };

    const handleUpload = async () => {
        if (!bankName) {
            Swal.fire({ icon: 'warning', title: 'กรุณาเลือกธนาคาร', confirmButtonColor: '#1a4d2e' });
            return;
        }
        if (!transferAmount) {
             Swal.fire({ icon: 'warning', title: 'กรุณาระบุยอดเงิน', confirmButtonColor: '#1a4d2e' });
             return;
        }
        if (!accountNumber || accountNumber.length < 4) {
             Swal.fire({ icon: 'warning', title: 'กรุณาระบุเลขบัญชี (4 ตัวท้าย)', confirmButtonColor: '#1a4d2e' });
             return;
        }
        if (!file) {
            Swal.fire({ icon: 'warning', title: 'กรุณาแนบสลิป', confirmButtonColor: '#1a4d2e' });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('slip_image', file);
        formData.append('transfer_amount', transferAmount);
        formData.append('transfer_date', transferDate.toISOString());
        formData.append('bank_name', bankName);
        formData.append('transfer_account_number', accountNumber); // ✅ Send Account Number

        try {
            await axios.post(`http://localhost:8000/api/upload_slip/${orderId}/`, formData, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'แจ้งชำระเงินสำเร็จ!',
                text: 'เราได้รับข้อมูลแล้ว และจะตรวจสอบโดยเร็วที่สุด',
                timer: 2000,
                showConfirmButton: false
            });
            
            onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถอัปโหลดได้ โปรดลองใหม่',
                confirmButtonColor: '#1a4d2e'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-0 rounded-3xl shadow-2xl w-full max-w-5xl relative mx-4 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200 h-[90vh] md:h-auto">
                
                {/* ❌ Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                >
                    <X size={24} />
                </button>

                {/* 🎨 Left Side: QR Code Payment */}
                <div className="hidden md:flex w-full md:w-5/12 bg-[#1a4d2e] p-8 text-white flex-col items-center justify-center text-center relative overflow-hidden">
                     {/* Decorative Circles */}
                     <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                     <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2"><Smartphone /> สแกนจ่ายง่ายๆ</h3>
                    <p className="text-green-200 text-xs mb-8">รองรับทุกธนาคาร (PromptPay)</p>
                    
                    <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-green-800/20 mb-8 transform hover:scale-105 transition-transform duration-300">
                        {promptPayPayload ? (
                             <QRCode value={promptPayPayload} size={200} />
                        ) : (
                            <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded-xl">
                                Generating QR...
                            </div>
                        )}
                    </div>

                    <div className="text-4xl font-black mb-2 tracking-tight">฿{Number(orderTotal || 0).toLocaleString()}</div>
                    <p className="text-green-200 text-sm font-medium bg-white/10 px-4 py-1 rounded-full">ยอดที่ต้องชำระ</p>
                </div>

                {/* 📝 Right Side: Slip Upload Form */}
                <div className="w-full md:w-7/12 p-6 md:p-8 bg-gray-50/50 overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-[#1a4d2e]">แจ้งโอนเงิน</h2>
                        <p className="text-sm text-gray-500 font-bold">ออเดอร์ #{orderId} <span className="md:hidden inline-block ml-2 text-[#1a4d2e] font-black">• ฿{Number(orderTotal || 0).toLocaleString()}</span></p>
                    </div>

                    <div className="space-y-6">
                        {/* 🏦 Bank Selection Grid */}
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">เลือกธนาคารที่โอน</label>
                            <div className="grid grid-cols-4 gap-3">
                                {BANKS.map((bank) => (
                                    <button
                                        key={bank.code}
                                        onClick={() => handleBankSelect(bank.code)}
                                        className={`
                                            relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 group
                                            ${bankName === bank.code 
                                                ? `${bank.border} bg-white shadow-lg shadow-gray-200 transform -translate-y-1` 
                                                : 'border-transparent bg-gray-50 hover:bg-white hover:shadow-md'
                                            }
                                        `}
                                    >
                                        <div 
                                            className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center overflow-hidden shadow-sm ${bankName === bank.code ? 'scale-110 ring-2 ring-offset-2 ' + bank.border.replace('border', 'ring') : 'group-hover:scale-110 grayscale group-hover:grayscale-0'} transition-all`} 
                                        >
                                            {bank.logo ? (
                                                <img src={bank.logo} alt={bank.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">Other</span>
                                            )}
                                        </div>
                                        <span className={`text-[10px] font-bold ${bankName === bank.code ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {bank.name}
                                        </span>
                                        
                                        {/* Checkmark Badge */}
                                        {bankName === bank.code && (
                                            <div className="absolute top-[-5px] right-[-5px] w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 animate-in zoom-in">
                                                <Check size={12} className="text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 💰 Grid: Amount & Account Number */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">ยอดเงินที่โอน</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                                    <input 
                                        type="number" 
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        className="w-full p-3 pl-8 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e] transition-shadow"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">เลขบัญชี (4 ตัวท้าย)</label>
                                <input 
                                    type="text" 
                                    maxLength={4}
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} // Numeric only
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e] transition-shadow text-center tracking-widest"
                                    placeholder="XXXX"
                                />
                            </div>
                        </div>

                        {/* 📅 Date & Time */}
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">วันและเวลาถ่ายโอน</label>
                            <div className="relative">
                                <DatePicker
                                    selected={transferDate}
                                    onChange={(date) => setTransferDate(date)}
                                    showTimeSelect
                                    locale="th"
                                    timeFormat="HH:mm"
                                    timeIntervals={1}
                                    dateFormat="dd MMMM yyyy, HH:mm"
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#1a4d2e] cursor-pointer transition-shadow"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">แนบหลักฐานการโอน</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[120px] bg-white hover:bg-green-50/30 transition-colors relative overflow-hidden group cursor-pointer">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {preview ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden group-hover:opacity-90 transition-opacity">
                                        <img src={preview} alt="Slip Preview" className="h-[100px] object-contain" />
                                        <button onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-white/90 p-1 rounded-full text-red-500 hover:bg-red-50 z-20 shadow-sm hover:scale-110 transition-transform"><X size={14}/></button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 bg-green-50 rounded-full mb-2 group-hover:scale-110 group-hover:bg-green-100 transition-all">
                                            <ImageIcon className="text-[#1a4d2e]" size={24} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 group-hover:text-[#1a4d2e] transition-colors">แตะเพื่อแนบสลิป</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                             <button 
                                onClick={onClose}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-xl font-bold text-sm transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={handleUpload}
                                disabled={loading}
                                className="flex-[2] bg-[#1a4d2e] hover:bg-[#143d24] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none hover:shadow-xl hover:-translate-y-1 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><Check size={20} /> ยืนยันการชำระเงิน</>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
