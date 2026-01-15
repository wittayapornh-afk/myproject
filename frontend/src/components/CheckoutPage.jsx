import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { MapPin, Truck, CreditCard, ChevronLeft, ArrowRight, ShieldCheck, Mail, Phone, User, Upload, Check, X, Image as ImageIcon, Tag, Zap, ArrowLeft, QrCode, Landmark, Package } from 'lucide-react';
import QRCode from 'react-qr-code';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DatePickerStyles = () => (
    <style>{`
        .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 2rem;
            border: none;
            box-shadow: 0 25px 50px -12px rgba(22, 101, 52, 0.2);
            background: white;
            overflow: hidden;
            border: 1px solid rgba(22, 101, 52, 0.1);
        }
        .react-datepicker__header {
            background: linear-gradient(135deg, #1a4d2e 0%, #143d24 100%);
            border-bottom: none;
            padding: 1rem 0;
        }
        .react-datepicker__current-month, .react-datepicker__day-name {
            color: white;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 0.75rem;
        }
        .react-datepicker__day {
            color: #374151;
            font-weight: 600;
            transition: all 0.2s;
        }
        .react-datepicker__day:hover {
            background-color: #f0fdf4 !important;
            color: #166534 !important;
            border-radius: 0.5rem;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
            background: #1a4d2e !important;
            color: white !important;
            border-radius: 0.5rem;
        }
        .react-datepicker__time-container {
            border-left: 1px solid #f0fdf4 !important;
        }
        .react-datepicker__time-header {
            color: #1a4d2e !important;
            font-weight: 800 !important;
        }
        .react-datepicker__time-list-item--selected {
            background: #1a4d2e !important;
        }
        .react-datepicker__input-container input:focus {
            box-shadow: 0 0 0 4px rgba(26, 77, 46, 0.1);
            border-color: #1a4d2e !important;
        }
    `}</style>
);

const ErrorMessage = ({ message }) => (
    message ? <div className="text-red-500 text-[10px] font-bold mt-1 flex items-center gap-1 animate-in slide-in-from-top-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{message}</div> : null
);

function CheckoutPage() {
    const { cartItems, getTotalPrice, clearCart, selectedItems } = useCart();
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // ✅ Hook for State

    // ✅ Initialize state from LocalStorage to prevent "No Items" flash on refresh
    const [checkoutItems, setCheckoutItems] = useState(() => {
        // 1. Priority: Direct Buy (from Product Detail)
        if (location.state?.directBuyItem) {
             return [{ ...location.state.directBuyItem, quantity: location.state.quantity || 1 }];
        }
        // 2. Fallback: Load from LocalStorage
        const saved = localStorage.getItem('checkout_items_persist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        let items = checkoutItems;

        // Update if new selection from Cart (only if not a direct buy and we have selected items)
        if (!location.state?.directBuyItem && selectedItems.length > 0 && cartItems.length > 0) {
             items = cartItems.filter(item => selectedItems.includes(item.id));
             setCheckoutItems(items);
        }
        
        // Save to LocalStorage for persistence
        if (items.length > 0) {
            localStorage.setItem('checkout_items_persist', JSON.stringify(items));
        }
    }, [location.state, cartItems, selectedItems]);

    // Multi-Step State
    const [step, setStep] = useState(1); // 1: Shipping/Review, 2: Payment

    // Form State
    // Form State - Try to load from LocalStorage first
    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem('checkout_form_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing saved form data", e);
            }
        }
        return { first_name: '', last_name: '', address: '', phone: '', email: '', zip_code: '' };
    });

    const [province, setProvince] = useState(() => localStorage.getItem('checkout_province') || 'กรุงเทพมหานคร');
    const [paymentMethod, setPaymentMethod] = useState('QR');
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({}); // ✅ Invalid Fields State

    // Save to LocalStorage on Change
    useEffect(() => {
        localStorage.setItem('checkout_form_data', JSON.stringify(formData));
        localStorage.setItem('checkout_province', province);
    }, [formData, province]);

    const validateField = (name, value) => {
        let error = "";
        if (name === 'phone') {
            if (!value) error = "กรุณากรอกเบอร์โทรศัพท์";
            else if (!/^0\d{9}$/.test(value)) error = "เบอร์โทรต้องมี 10 หลักและขึ้นต้นด้วย 0";
        }
        if (name === 'zip_code') {
            if (value && value.length > 5) error = "รหัสไปรษณีย์ไม่ถูกต้อง";
        }
        // Save Error
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Real-time validation for some fields
        if (['phone', 'zip_code'].includes(name)) {
            validateField(name, value);
        } else {
             // Clear error if exists when typing
             if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    const [transferAmount, setTransferAmount] = useState(0);
    const [bankName, setBankName] = useState(''); 
    const [accountNumber, setAccountNumber] = useState(''); 
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [mapPosition, setMapPosition] = useState(null); 
    const [qrPayload, setQrPayload] = useState('');
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);


    // ✅ Debug Logging
    useEffect(() => {
        console.log("Checkout items loaded:", checkoutItems);
        const saved = localStorage.getItem('checkout_items_persist');
        console.log("Persist storage check:", saved ? "Found Data" : "Empty");
    }, []);


    useEffect(() => {
        // Only autofill from USER if LocalStorage is empty OR has effectively empty data
        const saved = localStorage.getItem('checkout_form_data');
        let shouldAutofill = true;

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // If user has typed anything significant, don't overwrite
                if (parsed.first_name || parsed.phone || parsed.address) {
                    shouldAutofill = false;
                }
            } catch (e) {
                console.error("Error parsing saved form", e);
            }
        }

        if (user && shouldAutofill) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone_number || '',
                address: user.address || '',
                zip_code: '' 
            });
        }
    }, [user]);

    const THAI_PROVINCES = [
        "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
    ];

    // Comprehensive Mapping for English -> Thai
    const PROVINCE_MAPPING = {
        "Bangkok": "กรุงเทพมหานคร", "Krabi": "กระบี่", "Kanchanaburi": "กาญจนบุรี", "Kalasin": "กาฬสินธุ์", "Kamphaeng Phet": "กำแพงเพชร", "Khon Kaen": "ขอนแก่น",
        "Chanthaburi": "จันทบุรี", "Chachoengsao": "ฉะเชิงเทรา", "Chon Buri": "ชลบุรี", "Chai Nat": "ชัยนาท", "Chaiyaphum": "ชัยภูมิ", "Chumphon": "ชุมพร",
        "Chiang Rai": "เชียงราย", "Chiang Mai": "เชียงใหม่", "Trang": "ตรัง", "Trat": "ตราด", "Tak": "ตาก", "Nakhon Nayok": "นครนายก", "Nakhon Pathom": "นครปฐม",
        "Nakhon Phanom": "นครพนม", "Nakhon Ratchasima": "นครราชสีมา", "Nakhon Si Thammarat": "นครศรีธรรมราช", "Nakhon Sawan": "นครสวรรค์", "Nonthaburi": "นนทบุรี",
        "Narathiwat": "นราธิวาส", "Nan": "น่าน", "Bueng Kan": "บึงกาฬ", "Buriram": "บุรีรัมย์", "Pathum Thani": "ปทุมธานี", "Prachuap Khiri Khan": "ประจวบคีรีขันธ์",
        "Prachin Buri": "ปราจีนบุรี", "Pattani": "ปัตตานี", "Phra Nakhon Si Ayutthaya": "พระนครศรีอยุธยา", "Phayao": "พะเยา", "Phang Nga": "พังงา", "Phatthalung": "พัทลุง",
        "Phichit": "พิจิตร", "Phitsanulok": "พิษณุโลก", "Phetchaburi": "เพชรบุรี", "Phetchabun": "เพชรบูรณ์", "Phrae": "แพร่", "Phuket": "ภูเก็ต", "Maha Sarakham": "มหาสารคาม",
        "Mukdahan": "มุกดาหาร", "Mae Hong Son": "แม่ฮ่องสอน", "Yasothon": "ยโสธร", "Yala": "ยะลา", "Roi Et": "ร้อยเอ็ด", "Ranong": "ระนอง", "Rayong": "ระยอง",
        "Ratchaburi": "ราชบุรี", "Lopburi": "ลพบุรี", "Lampang": "ลำปาง", "Lamphun": "ลำพูน", "Loei": "เลย", "Si Sa Ket": "ศรีสะเกษ", "Sakon Nakhon": "สกลนคร",
        "Songkhla": "สงขลา", "Satun": "สตูล", "Samut Prakan": "สมุทรปราการ", "Samut Songkhram": "สมุทรสงคราม", "Samut Sakhon": "สมุทรสาคร", "Sa Kaeo": "สระแก้ว",
        "Saraburi": "สระบุรี", "Sing Buri": "สิงห์บุรี", "Sukhothai": "สุโขทัย", "Suphan Buri": "สุพรรณบุรี", "Surat Thani": "สุราษฎร์ธานี", "Surin": "สุรินทร์",
        "Nong Khai": "หนองคาย", "Nong Bua Lam Phu": "หนองบัวลำภู", "Ang Thong": "อ่างทอง", "Amnat Charoen": "อำนาจเจริญ", "Udon Thani": "อุดรธานี", "Uttaradit": "อุตรดิตถ์",
        "Uthai Thani": "อุทัยธานี", "Ubon Ratchathani": "อุบลราชธานี"
    };

    const mapStateToThai = (stateName) => {
        if (!stateName) return 'กรุงเทพมหานคร';
        // 1. Direct match in mapping
        if (PROVINCE_MAPPING[stateName]) return PROVINCE_MAPPING[stateName];
        
        // 2. Fuzzy match
        for (const [eng, thai] of Object.entries(PROVINCE_MAPPING)) {
            if (stateName.includes(eng)) return thai;
        }

        // 3. Fallback to existing logic
        const match = THAI_PROVINCES.find(p => stateName.includes(p));
        return match || 'กรุงเทพมหานคร';
    };

    const LocationMarker = () => {
         const map = useMapEvents({
            click(e) { 
                setMapPosition(e.latlng); 
                map.flyTo(e.latlng, map.getZoom()); 
            },
         });
         return mapPosition === null ? null : <Marker position={mapPosition}></Marker>;
    };


    const handleConfirmLocation = async () => {
        if (!mapPosition) {
            setShowMap(false);
            return;
        }
        
        setIsResolvingAddress(true);
        try {
            // ✅ Change to 'th' for Thai Address
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition.lat}&lon=${mapPosition.lng}&accept-language=th`); 
            if (res.data && res.data.display_name) {
                setFormData(prev => {
                    const newFormData = { ...prev, address: res.data.display_name };
                    
                    // Improved ZipCode Extraction
                    if (res.data.address) {
                        const zip = res.data.address.postcode || res.data.address.zip;
                        if (zip) {
                            newFormData.zip_code = zip;
                            // Trigger validation for zipcode if needed
                            validateField('zip_code', zip); 
                        }
                    }
                    return newFormData;
                });

                if (res.data.address) {
                    const { state, province, city } = res.data.address;
                    const locationName = state || province || city || '';
                    
                    // 1. Try Direct Thai Match
                    let thaiMatch = THAI_PROVINCES.find(p => locationName.includes(p));
                    
                    // 2. Fallback: Try English Mapping
                    if (!thaiMatch) {
                        for (const [eng, thai] of Object.entries(PROVINCE_MAPPING)) {
                            if (locationName.toLowerCase().includes(eng.toLowerCase())) {
                                thaiMatch = thai;
                                break;
                            }
                        }
                    }

                    // 3. Last Resort: Bangkok
                    if (locationName.includes('Bangkok') || locationName.includes('กรุงเทพ')) {
                        thaiMatch = 'กรุงเทพมหานคร';
                    }

                    if (thaiMatch) {
                        setProvince(thaiMatch);
                    }
                }
            } 
        } catch (error) {
            console.error("Reverse geocode failed", error);
        } finally {
            setIsResolvingAddress(false);
            setShowMap(false);
        }
    };

    const handleMapOpen = () => {
        setShowMap(true);
        if (!mapPosition) setMapPosition({ lat: 13.7563, lng: 100.5018 }); 
    };

    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponData, setCouponData] = useState(null);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [flashSaleItems, setFlashSaleItems] = useState({}); 

    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/flash-sales/active/');
                const sales = res.data;
                const saleMap = {};
                sales.forEach(sale => {
                    sale.products.forEach(p => {
                        saleMap[p.product] = p.sale_price; 
                    });
                });
                setFlashSaleItems(saleMap);
            } catch (err) { console.error(err); }
        };
        fetchFlashSales();
    }, []);

    const getEffectivePrice = (item) => {
        if (flashSaleItems[item.id]) {
            return parseFloat(flashSaleItems[item.id]);
        }
        return item.price;
    };

    const subtotal = checkoutItems.reduce((total, item) => total + (getEffectivePrice(item) * item.quantity), 0);
    const finalTotal = subtotal - discount;
    const hasFlashSaleItem = checkoutItems.some(item => flashSaleItems[item.id]);

    useEffect(() => {
        if (!hasFlashSaleItem) {
             const storedToken = localStorage.getItem('token') || (user && user.token);
             if (storedToken) {
                 axios.get('http://localhost:8000/api/coupons-public/', { headers: { Authorization: `Token ${storedToken}` } })
                     .then(res => setAvailableCoupons(res.data))
                     .catch(err => console.error("Error fetching coupons", err));
             }
        }
    }, [hasFlashSaleItem, user]);


    const handleSelectCoupon = (code) => {
        removeCoupon(); // Clear previous
        setCouponCode(code);
        setShowCouponModal(false);
        // Delay to allow state update then apply
        setTimeout(() => handleApplyCoupon(code), 200); 
    };

    const handleApplyCoupon = async (codeToUse) => {
        const code = codeToUse || couponCode;
        if (hasFlashSaleItem) {
             Swal.fire({ icon: 'warning', title: 'ใช้คูปองไม่ได้', text: 'สินค้า Flash Sale ไม่ร่วมรายการส่วนลด' });
             removeCoupon();
             return;
        }
        if (!code) return;
        try {
            const storedToken = localStorage.getItem('token') || (user && user.token);
            const res = await axios.post('http://localhost:8000/api/coupons/validate/', {
                code: code,
                total_amount: subtotal
            }, {
                headers: { Authorization: `Token ${storedToken}` }
            });

            if (res.data.valid) {
                setDiscount(res.data.discount_amount);
                setCouponData(res.data);
                Swal.fire({
                    icon: 'success', 
                    title: 'ใช้คูปองสำเร็จ', 
                    text: `ลดไป ฿${res.data.discount_amount}`,
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        } catch (error) {
            setDiscount(0);
            setCouponData(null);
            Swal.fire({
                icon: 'error',
                title: 'ใช้คูปองไม่ได้',
                text: error.response?.data?.error || 'คูปองไม่ถูกต้อง',
                confirmButtonColor: '#1a4d2e'
            });
        }
    };
    
    const removeCoupon = () => {
        setCouponCode('');
        setDiscount(0);
        setCouponData(null);
    };

    useEffect(() => {
        setTransferAmount(finalTotal);
        if (finalTotal > 0) {
            const storedToken = localStorage.getItem('token') || (user && user.token);
            if (storedToken) {
                axios.post('http://localhost:8000/api/payment/promptpay_payload/', { amount: finalTotal }, {
                    headers: { Authorization: `Token ${storedToken}` }
                })
                .then(res => setQrPayload(res.data.payload))
                .catch(err => console.error("QR Error", err));
            }
        }
    }, [finalTotal, user]);

    const handleNextStep = () => {
        // Validate Shipping Info
        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.address) {
            Swal.fire('ข้อมูลไม่ครบ', 'กรุณากรอกข้อมูลจัดส่งให้ครบถ้วน', 'warning');
            return;
        }
        
        // Validate Phone Format (Thai Mobile 10 digits, starts with 0)
        if (!/^0\d{9}$/.test(formData.phone)) {
            Swal.fire('เบอร์โทรศัพท์ไม่ถูกต้อง', 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก และขึ้นต้นด้วย 0', 'warning');
            return;
        }

        if (formData.zip_code && formData.zip_code.length > 5) {
             Swal.fire('รหัสไปรษณีย์ไม่ถูกต้อง', 'รหัสไปรษณีย์ต้องไม่เกิน 5 หลัก', 'warning');
             return;
        }
        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (['QR', 'Bank'].includes(paymentMethod)) {
             if (!file) {
                 Swal.fire('กรุณาแนบสลิป', 'โปรดอัพโหลดหลักฐานการโอนเงินเพื่อดำเนินการต่อ', 'warning');
                 return;
             }
             if (paymentMethod === 'Bank') {
                 if (accountNumber && accountNumber.length !== 10) {
                     Swal.fire('เลขบัญชีไม่ถูกต้อง', 'กรุณาระบุเลขบัญชีผู้โอนให้ครบ 10 หลัก', 'warning');
                     return;
                 }
                 if (!bankName) {
                      Swal.fire('กรุณาเลือกธนาคาร', 'โปรดเลือกธนาคารที่คุณใช้โอนเงิน', 'warning');
                      return;
                 }
             }
        }
        // CHECKOUT ITEMS VALIDATION
        if (checkoutItems.length === 0) {
            Swal.fire('ตะกร้าสินค้าว่างเปล่า', 'กรุณาเลือกสินค้าก่อนชำระเงิน', 'warning');
            return;
        }

        setLoading(true);
        try {
            let storedToken = localStorage.getItem('token');
            if (!storedToken && user?.token) storedToken = user.token;

            if (!storedToken) {
                Swal.fire('Error', 'Please login first', 'error');
                navigate('/login');
                return;
            }

            const payload = {
                items: checkoutItems.map(item => ({ id: item.id, quantity: item.quantity })),
                customer: {
                    ...formData,
                    name: `${formData.first_name} ${formData.last_name}`.trim(),
                    address: `${formData.address} ${formData.zip_code}`.trim(),
                    province: province 
                },
                paymentMethod: ['QR', 'Bank'].includes(paymentMethod) ? 'Transfer' : paymentMethod,
                couponCode: couponData ? couponData.code : null 
            };
            
            const res = await axios.post('http://localhost:8000/api/orders/create/', payload, {
                headers: { Authorization: `Token ${storedToken}` }
            });
            
            const orderId = res.data.order_id;

            if (['QR', 'Bank'].includes(paymentMethod) && file) {
               const slipFormData = new FormData();
                slipFormData.append('slip_image', file);
                slipFormData.append('transfer_amount', transferAmount);
                slipFormData.append('bank_name', bankName || 'Unknown'); 
                slipFormData.append('transfer_account_number', accountNumber || 'Unknown');

                await axios.post(`http://localhost:8000/api/upload_slip/${orderId}/`, slipFormData, {
                    headers: { 
                        Authorization: `Token ${storedToken}`, 
                        'Content-Type': 'multipart/form-data' 
                    }
                });
            }

            await Swal.fire({
                icon: 'success',
                title: 'สั่งซื้อสำเร็จ!', 
                text: 'ขอบคุณที่ใช้บริการครับ', 
                timer: 2000, 
                showConfirmButton: false 
            });

            // ✅ Clear Cart only if NOT Direct Buy
            if (!location.state?.directBuyItem) {
                 clearCart(); 
            }
            
            // ✅ Clear Saved Form Data
            localStorage.removeItem('checkout_form_data');
            localStorage.removeItem('checkout_province');
            localStorage.removeItem('checkout_items_persist'); // ✅ Clear Items

            navigate('/tracking');

        } catch (error) {
            console.error("Checkout Error:", error);
            // Show detailed error from backend if available
            let errorTitle = 'เกิดข้อผิดพลาด';
            let errorMsg = error.message;

            if (error.response?.data) {
                const data = error.response.data;
                
                // Case 1: Complex Validation Error (List of errors)
                if (data.errors && Array.isArray(data.errors)) {
                    errorTitle = data.message || 'ข้อมูลไม่ถูกต้อง';
                    // Combine all error messages
                    errorMsg = data.errors.map(e => `• ${e.message}`).join('\n');
                } 
                // Case 2: Simple Error Key
                else if (data.error) {
                    errorMsg = data.error;
                }
                // Case 3: DRF Standard Error (Key-Value)
                else if (typeof data === 'object') {
                    // Extract values from object
                    errorMsg = Object.values(data).flat().join('\n');
                }
                // Case 4: String
                else if (typeof data === 'string') {
                    errorMsg = data;
                }
            }
            
            Swal.fire({
                icon: 'error',
                title: errorTitle,
                text: errorMsg,
                confirmButtonColor: '#d33',
                confirmButtonText: 'ตกลง'
            });
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => {
        if (!path) return "/placeholder.png";
        if (path.startsWith("http")) return path;
        return `http://localhost:8000${path}`;
    };

    const formatPrice = (price) => {
        return '฿' + parseFloat(price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const BANKS = [
        { id: 'kbank', name: 'กสิกรไทย (KBANK)', color: '#138f2d', initials: 'KBANK', iconUrl: 'https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/kbank.svg' },
        { id: 'scb', name: 'ไทยพาณิชย์ (SCB)', color: '#4e2a84', initials: 'SCB', iconUrl: 'https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/scb.svg' },
        { id: 'bbl', name: 'กรุงเทพ (BBL)', color: '#1e3a8a', initials: 'BBL', iconUrl: 'https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/bbl.svg' },
        { id: 'ktb', name: 'กรุงไทย (KTB)', color: '#0ea5e9', initials: 'KTB', iconUrl: 'https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/ktb.svg' },
        { id: 'bay', name: 'กรุงศรี (BAY)', color: '#f5ce00', initials: 'BAY', textColor: '#4e3801', iconUrl: 'https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/bay.svg' },
        { id: 'ttb', name: 'ทหารไทยธนชาต (ttb)', color: '#0056b3', initials: 'TTB', iconUrl: 'https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/ttb.svg' },
        { id: 'gsb', name: 'ออมสิน (GSB)', color: '#eb198d', initials: 'GSB', iconUrl: 'https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/gsb.svg' },
    ];
    const [selectedBank, setSelectedBank] = useState(BANKS[0]);

    if (checkoutItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F2F5] p-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-sm border border-red-100">
                    <Package size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black text-[#1a4d2e] mb-2 tracking-tight">ไม่พบสินค้าที่จะชำระเงิน</h2>
                <p className="text-gray-500 mb-8 max-w-md font-medium leading-relaxed">
                    ดูเหมือนว่ารายการสินค้าจะว่างเปล่า<br/>กรุณากลับไปเลือกสินค้าในตะกร้าใหม่อีกครั้งครับ
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/cart')}
                        className="px-8 py-3 bg-[#1a4d2e] text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-900/10 flex items-center gap-2"
                    >
                         <ChevronLeft size={20} /> กลับไปตะกร้า
                    </button>
                    <button 
                        onClick={() => navigate('/shop')}
                        className="px-8 py-3 bg-white text-[#1a4d2e] border border-[#1a4d2e]/20 rounded-xl font-bold hover:bg-green-50 transition-all shadow-sm"
                    >
                        เลือกซื้อสินค้าต่อ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1a4d2e] pb-20">
            <DatePickerStyles />
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <button onClick={() => step === 1 ? navigate('/cart') : setStep(1)} className="flex items-center gap-2 text-gray-500 hover:text-[#1a4d2e] font-bold transition-colors">
                        <ArrowLeft size={20} /> {step === 1 ? 'กลับไปตะกร้า' : 'แก้ไขที่อยู่'}
                    </button>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#1a4d2e]' : 'text-gray-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= 1 ? 'bg-[#1a4d2e] text-white' : 'bg-gray-100'}`}>1</div>
                            <span className="text-xs font-bold uppercase hidden md:inline">Shipping</span>
                        </div>
                        <div className="w-8 h-px bg-gray-200"></div>
                        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#1a4d2e]' : 'text-gray-300'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${step >= 2 ? 'bg-[#1a4d2e] text-white' : 'bg-gray-100'}`}>2</div>
                            <span className="text-xs font-bold uppercase hidden md:inline">Payment</span>
                        </div>
                    </div>
                    <div className="w-20"></div> 
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* ✅ Step 1: Shipping Info */}
                    {step === 1 && (
                        <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-left-4">
                            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                                <h2 className="text-xl font-black flex items-center gap-3 mb-6 text-[#263A33]">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#1a4d2e]"><User size={20} /></div>
                                    ข้อมูลจัดส่ง
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">ชื่อ</label>
                                        <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#263A33] focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">นามสกุล</label>
                                        <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#263A33] focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 ml-1">ที่อยู่</label>
                                        <div className="relative">
                                             <input required name="address" value={formData.address} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#263A33] focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 outline-none transition-all pr-12" placeholder={isResolvingAddress ? "กำลังค้นหาตำแหน่ง..." : ""} />
                                             <button type="button" onClick={handleMapOpen} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                                                 <MapPin size={20} />
                                             </button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 ml-1">* คลิกหมุดเพื่อเลือกตำแหน่งจากแผนที่ และอัปเดตจังหวัดอัตโนมัติ</p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">จังหวัด</label>
                                        <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#263A33] focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 outline-none transition-all cursor-pointer appearence-none">
                                            {THAI_PROVINCES.map((p) => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">รหัสไปรษณีย์</label>
                                        <input 
                                            required 
                                            name="zip_code" 
                                            value={formData.zip_code} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 5) {
                                                    setFormData({ ...formData, zip_code: val });
                                                    validateField('zip_code', val);
                                                }
                                            }}
                                            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 font-bold text-[#263A33] outline-none transition-all ${errors.zip_code ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-green-500/10'}`} 
                                        />
                                        <ErrorMessage message={errors.zip_code} />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">เบอร์โทรศัพท์ (10 หลัก)</label>
                                        <input 
                                            required 
                                            type="tel" 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) {
                                                    setFormData({...formData, phone: val});
                                                    validateField('phone', val);
                                                }
                                            }} 
                                            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 font-bold text-[#263A33] outline-none transition-all ${errors.phone ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-green-500/10'}`} 
                                        />
                                        <ErrorMessage message={errors.phone} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">อีเมล</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-[#263A33] focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✅ Step 2: Payment */}
                    {step === 2 && (
                        <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                                 <h2 className="text-xl font-black flex items-center gap-3 mb-6 text-[#263A33]">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#1a4d2e]"><CreditCard size={20} /></div>
                                    วิธีการชำระเงิน
                                </h2>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {['QR', 'Bank', 'COD'].map(method => (
                                        <label key={method} className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === method ? 'border-[#1a4d2e] bg-green-50/50 text-[#1a4d2e]' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}>
                                            <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="hidden" />
                                            {method === 'QR' && <QrCode size={24}/>}
                                            {method === 'Bank' && <Landmark size={24}/>}
                                            {method === 'COD' && <Package size={24}/>}
                                            <span className="font-bold text-sm">{method === 'QR' ? 'สแกนจ่าย' : method === 'Bank' ? 'โอนเงิน' : 'เก็บปลายทาง'}</span>
                                        </label>
                                    ))}
                                </div>

                                {(paymentMethod === 'QR' || paymentMethod === 'Bank') && (
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-in fade-in slide-in-from-top-4">
                                        {paymentMethod === 'QR' && qrPayload && (
                                            <div className="flex flex-col items-center mb-6">
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-2">
                                                    <QRCode value={qrPayload} size={150} />
                                                </div>
                                                <p className="font-bold text-[#1a4d2e] text-lg">สแกนเพื่อจ่าย ฿{formatPrice(transferAmount)}</p>
                                                <p className="text-sm text-gray-500 font-medium mt-1">ผู้ชำระเงิน: {formData.first_name || '-'} {formData.last_name || '-'}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mb-6">
                                            <h4 className="font-black text-sm text-gray-600 uppercase tracking-wide mb-3">โอนเงินเข้าบัญชี (ร้านค้า)</h4>
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm">
                                                <div className="w-12 h-12 rounded-full bg-[#0ea5e9] flex items-center justify-center text-white font-black text-xl shadow-sm overflow-hidden p-2">
                                                    <img 
                                                        src="https://raw.githubusercontent.com/guidea/thai-bank-icons/master/official/ktb.svg" 
                                                        className="w-full h-full object-contain" 
                                                        onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerHTML = 'KTB'}} 
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 font-bold">ธนาคารกรุงไทย (Krungthai Bank)</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-black text-[#1a4d2e]">987-6-54321-0</p>
                                                        <button type="button" onClick={() => navigator.clipboard.writeText('987-6-54321-0')} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600 font-bold">Copy</button>
                                                    </div>
                                                    <p className="text-xs text-gray-400">ชื่อบัญชี: บจก. มายโปรเจค</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-black text-sm text-gray-600 uppercase tracking-wide">แจ้งหลักฐานการโอน</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-xs font-bold text-gray-400 block mb-1">สลิปโอนเงิน <span className="text-red-500">*</span></label>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white hover:border-[#1a4d2e] transition-all relative group bg-white/50">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*" 
                                                            required
                                                            onChange={(e) => setFile(e.target.files[0])} 
                                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                                                        />
                                                        <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#1a4d2e] transition-colors">
                                                            {file ? (
                                                                <>
                                                                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
                                                                         <img src={URL.createObjectURL(file)} className="h-full object-contain" />
                                                                         <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">คลิกเพื่อเปลี่ยน</div>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-[#1a4d2e]">{file.name}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ImageIcon size={32} />
                                                                    <span className="text-xs font-bold">คลิกเพื่ออัพโหลดสลิป</span>
                                                                    <span className="text-[10px] text-gray-300">รองรับ JPG, PNG</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="text-xs font-bold text-gray-400 block mb-1">จำนวนเงิน</label>
                                                    <input type="number" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none text-[#263A33]" />
                                                </div>
                                                
                                                {paymentMethod === 'Bank' && (
                                                    <div className="col-span-2 space-y-3 pt-2 border-t border-dashed border-gray-200 mt-2 animate-in fade-in">
                                                        <label className="text-xs font-bold text-gray-400 block mb-1">ธนาคารของคุณ (ที่ใช้โอน)</label>
                                                        <div className="flex flex-wrap gap-3">
                                                             {BANKS.map(bank => (
                                                                 <div 
                                                                    key={bank.id} 
                                                                    onClick={() => { setBankName(bank.name); setSelectedBank(bank); }}
                                                                    style={{ borderColor: selectedBank.id === bank.id ? bank.color : '' }}
                                                                    className={`w-14 h-14 rounded-2xl cursor-pointer flex items-center justify-center transition-all relative overflow-hidden shadow-sm p-1 bg-white ${selectedBank.id === bank.id ? 'ring-4 ring-offset-1 scale-110 z-10 border-2' : 'hover:scale-105 opacity-80 hover:opacity-100 border border-gray-100'}`}
                                                                 >
                                                                     <div className="w-full h-full rounded-xl flex items-center justify-center text-[10px] font-black text-white" style={{backgroundColor: bank.color}}>
                                                                         <img 
                                                                             src={bank.iconUrl} 
                                                                             className="w-full h-full object-contain" 
                                                                             onError={(e) => {
                                                                                 e.target.style.display='none'; 
                                                                                 e.target.parentElement.innerHTML = bank.initials;
                                                                             }} 
                                                                         />
                                                                     </div>
                                                                     {selectedBank.id === bank.id && <div className="absolute inset-0 bg-white/20"></div>}
                                                                 </div>
                                                             ))}
                                                        </div>
                                                        <div className="bg-white/50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-500">เลือก:</span>
                                                            <span className="text-sm font-bold px-2 py-0.5 rounded text-white shadow-sm" style={{backgroundColor: selectedBank.color}}>{selectedBank.name}</span>
                                                        </div>


                                                        <div className="mt-2">
                                                             <label className="text-xs font-bold text-gray-400 block mb-1">เลขบัญชีของคุณ (10 หลัก)</label>
                                                             <div className="relative">
                                                                 <input 
                                                                    value={accountNumber} 
                                                                    name="source_account"
                                                                    onChange={e => {
                                                                        const val = e.target.value.replace(/\D/g, '');
                                                                        if (val.length <= 10) setAccountNumber(val);
                                                                    }} 
                                                                    placeholder="XXXXXXXXXX" 
                                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold outline-none text-[#263A33] tracking-widest text-center focus:border-[#1a4d2e] focus:ring-4 focus:ring-green-500/10 transition-all placeholder-gray-200" 
                                                                 />
                                                                 <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded-full ${accountNumber.length === 10 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                     {accountNumber.length}/10
                                                                 </div>
                                                             </div>
                                                             <p className="text-[10px] text-gray-400 mt-1 pl-1">* โปรดระบุให้ครบ 10 หลักเพื่อยืนยัน</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="lg:col-span-4 transition-all duration-500">
                            <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-xl sticky top-28">
                                <h2 className="text-xl font-black mb-6 border-b border-white/10 pb-4">สรุปคำสั่งซื้อ</h2>
                                <div className="space-y-4 mb-8 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {checkoutItems.map((item) => {
                                        const isFlashSale = !!flashSaleItems[item.id];
                                        const price = getEffectivePrice(item);
                                        return (
                                            <div key={item.id} className="flex gap-4 items-center">
                                                <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0 p-1 relative">
                                                    <img src={getImageUrl(item.thumbnail)} className="w-full h-full object-contain" />
                                                    {isFlashSale && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full animate-pulse"><Zap size={8} fill="currentColor" /></div>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate">{item.title}</p>
                                                    <p className="text-[10px] text-white/50">x{item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black text-sm ${isFlashSale ? 'text-orange-400' : ''}`}>{formatPrice(price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <div className={`mb-6 transition-opacity ${hasFlashSaleItem ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <label className="text-[10px] font-bold text-white/60 mb-2 block uppercase tracking-widest flex justify-between">
                                        โค้ดส่วนลด
                                        {hasFlashSaleItem ? 
                                            <span className="text-orange-400 flex items-center gap-1"><Zap size={10} /> Flash Sale</span> : 
                                            <button type="button" onClick={() => setShowCouponModal(true)} className="text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"><Tag size={10} /> เลือกคูปอง ({availableCoupons.length})</button>
                                        }
                                    </label>
                                    <div className="flex bg-white/10 rounded-xl p-1 border border-white/10 focus-within:border-white/50 transition-colors">
                                        <div className="pl-3 flex items-center text-white/50"><Tag size={16} /></div>
                                        <input 
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            disabled={!!couponData || hasFlashSaleItem}
                                            placeholder={hasFlashSaleItem ? "งดร่วมรายการ" : "กรอกโค้ด"}
                                            className="bg-transparent w-full p-2 text-sm font-bold text-white placeholder-white/30 outline-none disabled:opacity-50"
                                        />
                                        {couponData ? (
                                             <button type="button" onClick={removeCoupon} className="bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">ลบ</button>
                                        ) : (
                                             <button type="button" onClick={() => handleApplyCoupon(couponCode)} disabled={hasFlashSaleItem} className="bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 transition disabled:bg-gray-400 disabled:text-gray-200">ใช้</button>
                                        )}
                                    </div>
                                    {couponData && <p className="text-[10px] text-indigo-300 mt-2 flex items-center gap-1"><Check size={10} /> ลด {formatPrice(discount)}</p>}
                                </div>

                                <div className="border-t border-white/10 pt-4 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-white/60"><span>ยอดรวม</span><span>{formatPrice(subtotal)}</span></div>
                                    {discount > 0 && <div className="flex justify-between text-xs font-bold text-green-300"><span>ส่วนลด</span><span>- {formatPrice(discount)}</span></div>}
                                    <div className="flex justify-between items-end pt-2 border-t border-white/10 mt-2">
                                        <span className="text-2xl font-black">ยอดสุทธิ</span>
                                        <span className="text-3xl font-black">{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>
                                
                                {step === 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="w-full mt-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 bg-white text-[#1a4d2e] hover:shadow-xl hover:-translate-y-1 active:scale-95"
                                    >
                                        ดำเนินการชำระเงิน <ArrowRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full mt-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 
                                        ${loading ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-400 hover:shadow-xl hover:-translate-y-1 active:scale-95'}`}
                                    >
                                        {loading ? 'Processing...' : <>ยืนยันสั่งซื้อ <ShieldCheck size={20} /></>}
                                    </button>
                                )}
                            </div>
                    </div>
                </form>
            </main>
                
                {showCouponModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Tag size={20} /> เลือกคูปองส่วนลด</h3>
                                <button onClick={() => setShowCouponModal(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                                {availableCoupons.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Tag size={40} className="mx-auto text-gray-300 mb-2"/>
                                        <p className="text-gray-500 font-bold">ไม่มีคูปองที่ใช้ได้ในขณะนี้</p>
                                    </div>
                                ) : 
                                availableCoupons.map(coupon => (
                                    <div key={coupon.id} onClick={() => handleSelectCoupon(coupon.code)} className="border border-indigo-100 rounded-xl p-4 hover:bg-indigo-50 cursor-pointer transition relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg">CODE: {coupon.code}</div>
                                        <p className="font-black text-indigo-900">{coupon.description || `ส่วนลด ${coupon.discount_value}`}</p>
                                        <p className="text-xs text-indigo-400">ขั้นต่ำ {formatPrice(coupon.min_spend)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {showMap && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                           <div className="p-4 bg-[#1a4d2e] text-white flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center gap-2"><MapPin size={20} /> เลือกตำแหน่งที่อยู่</h3>
                                <button onClick={() => setShowMap(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
                            </div>
                            <div className="flex-1 relative">
                                <MapContainer center={mapPosition || { lat: 13.7563, lng: 100.5018 }} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker />
                                </MapContainer>
                            </div>
                            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                <button type="button" onClick={() => setShowMap(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200">ยกเลิก</button>
                                <button type="button" onClick={handleConfirmLocation} disabled={isResolvingAddress || !mapPosition} className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1a4d2e] hover:bg-[#143d24] flex items-center gap-2 disabled:bg-gray-300">
                                    {isResolvingAddress ? 'กำลังดึงที่อยู่...' : <><MapPin size={18} /> ยืนยันตำแหน่ง</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}

export default CheckoutPage;