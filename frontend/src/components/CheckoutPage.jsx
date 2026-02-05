import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Truck, CreditCard, ChevronLeft, ArrowRight, ShieldCheck, Mail, Phone, User, Upload, Check, X, Image as ImageIcon, Tag, Zap, ArrowLeft, QrCode, Landmark, Package, Home, Briefcase } from 'lucide-react';
import AddressModal from './AddressModal';
import Swal from 'sweetalert2';
import axios from 'axios';
import QRCode from 'react-qr-code';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng]);
    return null;
};

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

    // 🔒 Security: Prevent Admin/Seller from Checkout
    useEffect(() => {
        if (user && ['admin', 'super_admin', 'seller'].includes(user.role?.toLowerCase())) {
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถทำรายการได้',
                text: 'ผู้ดูแลระบบและผู้ขายไม่สามารถทำการสั่งซื้อได้',
                background: '#fff',
                confirmButtonColor: '#1a4d2e'
            });
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    // ✅ Initialize state from LocalStorage to prevent "No Items" flash on refresh
    const [checkoutItems, setCheckoutItems] = useState(() => {
        // 1. Priority: Direct Buy (from Product Detail)
        if (location.state?.directBuyItem) {
            console.log('📦 Direct Buy Item:', location.state.directBuyItem);
            return [{ ...location.state.directBuyItem, quantity: location.state.quantity || 1 }];
        }
        // 2. Fallback: Load from LocalStorage
        const saved = localStorage.getItem('checkout_items_persist');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                console.log('✅ Restored checkout items from localStorage:', parsed);
                return parsed.length > 0 ? parsed : [];
            } catch (e) {
                console.error('❌ Error parsing saved checkout items:', e);
                localStorage.removeItem('checkout_items_persist'); // Clear corrupted data
            }
        }
        console.warn('⚠️ No checkout items found in localStorage');
        return [];
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

        let newValue = value;

        if (name === 'first_name' || name === 'last_name') {
            // Allow Thai and English only (No Spaces)
            newValue = value.replace(/[^a-zA-Z\u0E00-\u0E7F]/g, '');
        } else if (name === 'email') {
            // Allow only a-z, 0-9, ., @
            newValue = value.toLowerCase().replace(/[^a-z0-9.@]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Real-time validation for some fields
        if (['phone', 'zip_code'].includes(name)) {
            validateField(name, newValue);
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
    const [mapPosition, setMapPosition] = useState(() => {
        const saved = localStorage.getItem('checkout_map_position');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing map position", e);
            }
        }
        return null;
    });

    // Save Map Position
    useEffect(() => {
        if (mapPosition) {
            localStorage.setItem('checkout_map_position', JSON.stringify(mapPosition));
        }
    }, [mapPosition]);
    const [qrPayload, setQrPayload] = useState('');
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);


    // ✅ Debug Logging
    useEffect(() => {
        console.log("Checkout items loaded:", checkoutItems);
        const saved = localStorage.getItem('checkout_items_persist');
        console.log("Persist storage check:", saved ? "Found Data" : "Empty");
    }, []);


    useEffect(() => {
        // 🔄 Sync Logged-in User Profile to Form
        if (user) {
            // Only update if current data is effectively empty OR user just logged in/profile changed
            setFormData(prev => ({
                first_name: user.first_name || prev.first_name || '',
                last_name: user.last_name || prev.last_name || '',
                email: user.email || prev.email || '',
                phone: user.phone || user.phone_number || prev.phone || '',
                address: user.address || prev.address || '',
                zip_code: user.zipcode || prev.zip_code || '' 
            }));

            // Sync Province (Handle potential English->Thai mapping if backend is English)
            if (user.province) {
                const prov = PROVINCE_MAPPING[user.province] || user.province;
                if (THAI_PROVINCES.includes(prov)) {
                    setProvince(prov);
                }
            }

            if (user.latitude && user.longitude) {
                const lat = parseFloat(user.latitude);
                const lng = parseFloat(user.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setMapPosition({ lat, lng });
                }
            }
        }
    }, [user]);

    // 🆕 Address System Components
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);

    // Fetch Addresses
    const fetchAddresses = async () => {
         if (!token) return;
         try {
             const res = await axios.get('http://localhost:8000/api/addresses/', {
                 headers: { Authorization: `Token ${token}` }
             });
             setAddresses(res.data);
             
             // Auto-select default
             const defaultAddr = res.data.find(a => a.is_default);
             if (defaultAddr && !selectedAddressId) {
                 handleSelectAddress(defaultAddr);
             }
         } catch (err) {
             console.error("Error fetching addresses:", err);
         }
    };

    useEffect(() => {
        if (token) fetchAddresses();
    }, [token]);

    const handleSelectAddress = (addr) => {
        setSelectedAddressId(addr.id);
        setFormData(prev => ({
            ...prev,
            first_name: addr.receiver_name.split(' ')[0] || '',
            last_name: addr.receiver_name.split(' ').slice(1).join(' ') || '',
            phone: addr.phone,
            address: addr.address_detail + ' ' + (addr.sub_district || '') + ' ' + (addr.district || ''),
            zip_code: addr.zipcode
        }));
        setProvince(addr.province);
        
        if (addr.latitude && addr.longitude) {
            setMapPosition({ lat: parseFloat(addr.latitude), lng: parseFloat(addr.longitude) });
        }
    };

    const handleEditAddress = (addr, e) => {
        e.stopPropagation();
        setAddressToEdit(addr);
        setShowAddressModal(true);
    };

    const handleAddNewAddress = () => {
        setAddressToEdit(null);
        setShowAddressModal(true);
    };

    const handleAddressSaved = (newAddr) => {
        fetchAddresses();
        handleSelectAddress(newAddr); // Auto select the new/updated one
    };

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

    // ✅ Refactored Calculation for Clarity
    const BASE_SHIPPING_COST = 50;
    const isFreeShipping = couponData?.discount_type === 'free_shipping'; // Restored for UI logic

    // Fixed: Do not zero out shipping, let discount offset it.
    const shippingCost = BASE_SHIPPING_COST;

    // 1. Calculate Base Subtotal (Full Price)
    const baseSubtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // 2. Calculate Flash Savings
    const flashSavings = checkoutItems.reduce((total, item) => {
        if (flashSaleItems[item.id]) {
            const savingsPerUnit = item.price - parseFloat(flashSaleItems[item.id]);
            return total + (savingsPerUnit * item.quantity);
        }
        return total;
    }, 0);

    // 3. Final Total
    // Base - Flash - Discount + Shipping
    // Note: If Free Shipping, shippingCost is 0. If regular discount, discount > 0.
    // 🛡️ Safety Clamp: Discount cannot exceed (Base - Flash)
    const maxAllowedDiscount = Math.max(0, baseSubtotal - flashSavings);
    const effectiveDiscount = Math.min(discount, maxAllowedDiscount);

    const finalTotal = Math.max(0, baseSubtotal - flashSavings - effectiveDiscount + shippingCost);
    const hasFlashSaleItem = checkoutItems.some(item => flashSaleItems[String(item.id)]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token') || (user && user.token);
        if (storedToken) {
            axios.get('http://localhost:8000/api/coupons-public/', { headers: { Authorization: `Token ${storedToken}` } })
                .then(res => setAvailableCoupons(res.data))
                .catch(err => console.error("Error fetching coupons", err));
        }
    }, [user]);


    const handleSelectCoupon = (coupon) => {
        if (baseSubtotal < coupon.min_spend) {
            Swal.fire({
                icon: 'warning',
                title: 'ยอดซื้อไม่ถึงเกณฑ์',
                text: `คูปองนี้ต้องมียอดซื้อขั้นต่ำ ${formatPrice(coupon.min_spend)}`,
                confirmButtonColor: '#1a4d2e'
            });
            return;
        }
        removeCoupon(); // Clear previous
        setCouponCode(coupon.code);
        setShowCouponModal(false);
        // Delay to allow state update then apply
        setTimeout(() => handleApplyCoupon(coupon.code), 200);

    };

    const handleApplyCoupon = async (codeToUse) => {
        const code = codeToUse || couponCode;
        if (!code) return;

        // ⏳ Loading State (User Friendly)
        Swal.fire({
            title: 'กำลังตรวจสอบคูปอง...',
            didOpen: () => { Swal.showLoading(); },
            allowOutsideClick: false,
            background: 'transparent',
            color: 'white',
            backdrop: 'rgba(0,0,0,0.5)',
            timer: 0 // Prevent auto close
        });

        try {
            const storedToken = token || localStorage.getItem('token') || (user && user.token);

            const payload = {
                code: code,
                total_amount: baseSubtotal,
                items: checkoutItems.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const res = await axios.post('http://localhost:8000/api/coupons/validate/', payload, {
                headers: { Authorization: `Token ${storedToken}` }
            });

            if (res.data.valid) {
                // Close Loading
                Swal.close();

                setDiscount(res.data.discount_amount);
                setCouponData(res.data);

                // Show Success
                Swal.fire({
                    icon: 'success',
                    title: 'ลดราคาเรียบร้อย!',
                    text: `ประหยัดไปอีก ฿${Number(res.data.discount_amount).toLocaleString()}`,
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top',
                    background: '#ecfdf5',
                    color: '#065f46',
                    iconColor: '#10b981'
                });
            }
        } catch (error) {
            Swal.close(); // Close Loading first

            setDiscount(0);
            setCouponData(null);
            setCouponCode('');

            // ✅ Handle Strict Backend Errors (Friendly Display)
            const errorMsg = error.response?.data?.error || 'คูปองไม่ถูกต้อง หรือหมดอายุแล้ว';

            Swal.fire({
                icon: 'error',
                title: 'ขออภัย',
                text: errorMsg,
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#333'
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
            const storedToken = token || localStorage.getItem('token') || (user && user.token);
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
            let storedToken = token || localStorage.getItem('token');
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
                    province: province,
                    zip_code: formData.zip_code, // ✅ Send Zip Explicitly
                    latitude: mapPosition?.lat || null, // ✅ Send Coordinates
                    longitude: mapPosition?.lng || null 
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
            localStorage.removeItem('checkout_map_position'); // ✅ Clear Map
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
        { id: 'kbank', name: 'กสิกรไทย (KBANK)', color: '#138f2d', initials: 'KBANK', iconUrl: '/bank-icons/kbank.svg' },
        { id: 'scb', name: 'ไทยพาณิชย์ (SCB)', color: '#4e2a84', initials: 'SCB', iconUrl: '/bank-icons/scb.svg' },
        { id: 'bbl', name: 'กรุงเทพ (BBL)', color: '#1e3a8a', initials: 'BBL', iconUrl: '/bank-icons/bbl.svg' },
        { id: 'ktb', name: 'กรุงไทย (KTB)', color: '#0ea5e9', initials: 'KTB', iconUrl: '/bank-icons/ktb.svg' },
        { id: 'bay', name: 'กรุงศรี (BAY)', color: '#f5ce00', initials: 'BAY', textColor: '#4e3801', iconUrl: '/bank-icons/bay.svg' },
        { id: 'ttb', name: 'ทหารไทยธนชาต (ttb)', color: '#0056b3', initials: 'TTB', iconUrl: '/bank-icons/ttb.svg', isColored: true },
        { id: 'gsb', name: 'ออมสิน (GSB)', color: '#eb198d', initials: 'GSB', iconUrl: '/bank-icons/gsb.svg' },
        // { id: 'tisco', name: 'ทิสโก้ (TISCO)', color: '#1a4d2e', initials: 'TISCO', iconUrl: '/bank-icons/tisco.svg' },
        // { id: 'kkp', name: 'เกียรตินาคิน (KKP)', color: '#199cc5', initials: 'KKP', iconUrl: '/bank-icons/kkp.svg' },
        // { id: 'cimb', name: 'ซีไอเอ็มบี (CIMB)', color: '#7e2f36', initials: 'CIMB', iconUrl: '/bank-icons/cimb.svg' },
        // { id: 'uob', name: 'ยูโอบี (UOB)', color: '#0b3979', initials: 'UOB', iconUrl: '/bank-icons/uob.svg' },
        // { id: 'lh', name: 'แลนด์ แอนด์ เฮ้าส์ (LH)', color: '#6d6e71', initials: 'LH', iconUrl: '/bank-icons/lhb.svg' },
        // { id: 'baac', name: 'ธ.ก.ส. (BAAC)', color: '#4b9b1d', initials: 'BAAC', iconUrl: '/bank-icons/baac.svg' },
        // { id: 'ghb', name: 'อาคารสงเคราะห์ (GHB)', color: '#ff6700', initials: 'GHB', iconUrl: '/bank-icons/ghb.svg' },
        // { id: 'icbc', name: 'ไอซีบีซี (ICBC)', color: '#c50f1f', initials: 'ICBC', iconUrl: '/bank-icons/icbc.svg' },
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
                    ดูเหมือนว่ารายการสินค้าจะว่างเปล่า<br />กรุณากลับไปเลือกสินค้าในตะกร้าใหม่อีกครั้งครับ
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

                                {/* 🆕 Address Selection UI (Correct Placement) */}
                                {user && (
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">เลือกที่อยู่จัดส่ง</h3>
                                            <button 
                                                type="button"
                                                onClick={handleAddNewAddress}
                                                className="text-xs font-bold text-[#1a4d2e] bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition flex items-center gap-1 border border-green-100"
                                            >
                                                <Check size={12} /> เพิ่มที่อยู่ใหม่
                                            </button>
                                        </div>
                                        
                                        {addresses.length === 0 ? (
                                            <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:bg-gray-100 transition cursor-pointer group" onClick={handleAddNewAddress}>
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-400 mx-auto mb-3 shadow-sm group-hover:scale-110 transition">
                                                    <MapPin size={24} />
                                                </div>
                                                <p className="text-gray-500 font-bold text-sm">คุณยังไม่มีที่อยู่ที่บันทึกไว้</p>
                                                <p className="text-gray-400 text-xs mt-1">คลิกเพื่อเพิ่มที่อยู่จัดส่ง</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3">
                                                {addresses.map(addr => (
                                                    <div 
                                                        key={addr.id}
                                                        onClick={() => handleSelectAddress(addr)}
                                                        className={`relative p-4 rounded-2xl border-2 transition cursor-pointer group hover:shadow-md ${
                                                            selectedAddressId === addr.id 
                                                            ? 'border-[#1a4d2e] bg-[#f0fdf4]' 
                                                            : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                                                        }`}
                                                    >
                                                        {/* Selection Indicator */}
                                                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${selectedAddressId === addr.id ? 'border-[#1a4d2e] bg-[#1a4d2e] scale-110' : 'border-gray-300 bg-white'}`}>
                                                            {selectedAddressId === addr.id && <Check size={14} className="text-white" />}
                                                        </div>

                                                        <div className="flex items-start gap-4">
                                                            {/* Icon based on Label */}
                                                            <div className={`p-3 rounded-2xl ${selectedAddressId === addr.id ? 'bg-[#1a4d2e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                                {addr.label === 'Home' && <Home size={20} />}
                                                                {addr.label === 'Work' && <Briefcase size={20} />}
                                                                {addr.label === 'Other' && <MapPin size={20} />}
                                                            </div>
                                                            
                                                            <div className="flex-1 pr-8">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-bold text-gray-800 text-lg">{addr.label === 'Home' ? 'บ้าน' : addr.label === 'Work' ? 'ที่ทำงาน' : 'อี่นๆ'}</span>
                                                                    {addr.is_default && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">⭐ ค่าเริ่มต้น</span>}
                                                                </div>
                                                                <p className="text-sm font-bold text-gray-700 mb-1">{addr.receiver_name} <span className="text-gray-400 font-normal">|</span> {addr.phone}</p>
                                                                <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                                                                    {addr.address_detail} {addr.sub_district} {addr.district} <br/>
                                                                    จ. {addr.province} {addr.zipcode}
                                                                </p>
                                                                
                                                                <div className="mt-3 flex gap-4 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                                                                    <button type="button" onClick={(e) => handleEditAddress(addr, e)} className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                                                                        แก้ไขที่อยู่
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Divider if user logged in */}
                                {user && <div className="h-px bg-gray-100 my-6"></div>}

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
                                                    setFormData({ ...formData, phone: val });
                                                    validateField('phone', val);
                                                }
                                            }}
                                            placeholder="0XXXXXXXXX"
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
                                    {['QR', 'Bank', 'COD'].map((method, idx) => (
                                        <label key={`${method}-${idx}`} className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === method ? 'border-[#1a4d2e] bg-green-50/50 text-[#1a4d2e]' : 'border-gray-100 hover:border-gray-300 text-gray-400'}`}>
                                            <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="hidden" />
                                            {method === 'QR' && <QrCode size={24} />}
                                            {method === 'Bank' && <Landmark size={24} />}
                                            {method === 'COD' && <Package size={24} />}
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
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-sm overflow-hidden p-2" style={{ backgroundColor: '#0ea5e9' }}>
                                                     <img
                                                        src="/bank-icons/ktb.svg"
                                                        className="w-full h-full object-contain"
                                                        alt="KTB"
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
                                                    <label className="text-xs font-bold text-gray-400 block mb-1">จำนวนเงิน (บาท)</label>
                                                    <input 
                                                        type="number" 
                                                        value={transferAmount} 
                                                        readOnly
                                                        disabled
                                                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none text-gray-500 cursor-not-allowed" 
                                                    />
                                                </div>

                                                {paymentMethod === 'Bank' && (
                                                    <div className="col-span-2 space-y-3 pt-2 border-t border-dashed border-gray-200 mt-2 animate-in fade-in">
                                                        <label className="text-xs font-bold text-gray-400 block mb-1">ธนาคารของคุณ (ที่ใช้โอน)</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {BANKS.map((bank, idx) => (
                                                                <div
                                                                    key={`${bank.id}-${idx}`}
                                                                    onClick={() => { setBankName(bank.name); setSelectedBank(bank); }}
                                                                    className={`w-14 h-14 rounded-2xl cursor-pointer flex items-center justify-center transition-all relative overflow-hidden shadow-sm p-1
                                                                        ${selectedBank.id === bank.id 
                                                                            ? 'ring-2 ring-offset-2 ring-blue-400 scale-105 z-10' 
                                                                            : 'opacity-90 hover:opacity-100 hover:scale-105 border border-gray-100'
                                                                        }
                                                                        `}
                                                                    style={{ backgroundColor: bank.isColored ? '#ffffff' : bank.color }}
                                                                >
                                                                    {/* 🏦 Actual Bank Logo Image */}
                                                                    <div 
                                                                        className="w-full h-full rounded-xl flex items-center justify-center overflow-hidden" 
                                                                    >
                                                                         <img
                                                                            src={bank.iconUrl}
                                                                            alt={bank.initials}
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="bg-white/50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-500">เลือก:</span>
                                                            <span className="text-xs font-bold px-2 py-0.5 rounded text-white shadow-sm" style={{ backgroundColor: selectedBank.color }}>{selectedBank.name}</span>
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
                        <div className="bg-gradient-to-br from-[#1a4d2e] to-[#143d24] p-8 rounded-[3rem] text-white shadow-xl shadow-green-900/30 sticky top-28">
                            <h2 className="text-xl font-black mb-6 border-b border-white/10 pb-4">สรุปคำสั่งซื้อ</h2>
                            <div className="space-y-4 mb-8 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                                {checkoutItems.map((item, idx) => {
                                    const prodId = String(item.id);
                                    const isFlashSale = !!flashSaleItems[prodId];
                                    const price = getEffectivePrice(item);

                                    return (
                                        <div key={`${item.id}-${idx}`} className={`flex gap-4 items-center p-3 rounded-2xl transition-all duration-300 ${isFlashSale ? 'bg-orange-500/10 border border-orange-500/40 shadow-sm shadow-orange-500/20 hover:scale-[1.02]' : 'bg-white/5 border border-white/5'}`}>
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex-shrink-0 p-1.5 relative border border-white/10 shadow-inner">
                                                <img src={getImageUrl(item.thumbnail)} className="w-full h-full object-contain mix-blend-lighten" />
                                                {isFlashSale && (
                                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[8px] px-2 py-1 rounded-lg animate-pulse shadow-lg font-black border border-white/20">
                                                        FLASH
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black truncate text-gray-100">{item.title}</p>
                                                    {isFlashSale && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 font-black animate-bounce shadow-sm"><Zap size={8} fill="currentColor" /> SALE</span>}
                                                </div>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight">จำนวน {item.quantity} รายการ</p>
                                            </div>
                                            <div className="text-right">
                                                {isFlashSale && (
                                                    <p className="text-[10px] text-white/30 line-through font-bold">{formatPrice(item.price * item.quantity)}</p>
                                                )}
                                                <p className={`font-black text-base tracking-tighter ${isFlashSale ? 'text-orange-400 drop-shadow-[0_2px_4px_rgba(251,146,60,0.4)] scale-110 origin-right' : 'text-white'}`}>
                                                    {formatPrice(price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] font-bold text-white/60 mb-2 block uppercase tracking-widest flex justify-between">
                                    โค้ดส่วนลด
                                    <button type="button" onClick={() => setShowCouponModal(true)} className="text-white/80 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"><Tag size={10} /> เลือกคูปอง ({availableCoupons.length})</button>
                                </label>
                                <div className="flex bg-white/10 rounded-xl p-1 border border-white/10 focus-within:border-white/50 transition-colors">
                                    <div className="pl-3 flex items-center text-white/50"><Tag size={16} /></div>
                                    <input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!couponData}
                                        placeholder="กรอกโค้ด"
                                        className="bg-transparent w-full p-2 text-sm font-bold text-white placeholder-white/30 outline-none disabled:opacity-50"
                                    />
                                    {couponData ? (
                                        <button type="button" onClick={removeCoupon} className="bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">ลบ</button>
                                    ) : (
                                        <button type="button" onClick={() => handleApplyCoupon(couponCode)} className="bg-white text-[#1a4d2e] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-50 transition disabled:bg-gray-400 disabled:text-gray-200">ใช้</button>
                                    )}
                                </div>
                                {couponData && <p className="text-[10px] text-indigo-300 mt-2 flex items-center gap-1"><Check size={10} /> ลด {formatPrice(discount)}</p>}
                            </div>

                            <div className="border-t border-white/10 pt-4 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-white/60"><span>ยอดรวม</span><span>{formatPrice(baseSubtotal)}</span></div>
                                <div className="flex justify-between text-xs font-bold text-white/60">
                                    <span>ค่าจัดส่ง</span>
                                    <div className="flex gap-2">
                                        {isFreeShipping && <span className="line-through opacity-50">{formatPrice(BASE_SHIPPING_COST)}</span>}
                                        <span className={isFreeShipping ? 'text-green-300' : ''}>{isFreeShipping ? 'ฟรี' : formatPrice(shippingCost)}</span>
                                    </div>
                                </div>
                                {effectiveDiscount > 0 && <div className="flex justify-between text-xs font-bold text-green-300"><span>ส่วนลด</span><span>- {formatPrice(effectiveDiscount)}</span></div>}
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
                        <div className="p-4 bg-[#1a4d2e] text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2"><Tag size={20} /> เลือกคูปองส่วนลด</h3>
                            <button onClick={() => setShowCouponModal(false)} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                            {availableCoupons.length === 0 ? (
                                <div className="text-center py-8">
                                    <Tag size={40} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-gray-500 font-bold">ไม่มีคูปองที่ใช้ได้ในขณะนี้</p>
                                </div>
                            ) :
                                availableCoupons.map((coupon, idx) => (
                                    <div key={`${coupon.id}-${idx}`} onClick={() => handleSelectCoupon(coupon)} className="border border-indigo-100 rounded-xl p-4 hover:bg-indigo-50 cursor-pointer transition relative group overflow-hidden bg-white shadow-sm hover:shadow-md">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                                                {coupon.code}
                                            </span>
                                            {coupon.max_discount_amount && coupon.discount_type === 'percent' && (
                                                <span className="text-[9px] text-gray-400 font-bold border border-gray-100 px-1.5 py-0.5 rounded-md bg-gray-50">
                                                    Max ฿{Number(coupon.max_discount_amount).toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        <p className="font-black text-indigo-950 text-lg mb-1">
                                            {coupon.discount_type === 'percent' ? `${Number(coupon.discount_value)}% OFF` :
                                                coupon.discount_type === 'free_shipping' ? 'ส่งฟรี (Free Shipping)' :
                                                    `ส่วนลด ฿${Number(coupon.discount_value)}`}
                                        </p>

                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                ขั้นต่ำ ฿{Number(coupon.min_spend).toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                หมดเขต {new Date(coupon.end_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Address Modal */}
            <AddressModal 
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSave={handleAddressSaved}
                token={token}
                addressToEdit={addressToEdit}
            />

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
                                {mapPosition && <RecenterAutomatically lat={mapPosition.lat} lng={mapPosition.lng} />}
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