import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { MapPin, X, Check, Home, Briefcase, Map as MapIcon, Loader2, Navigation, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import Swal from 'sweetalert2';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import ThaiAddressPicker from './ThaiAddressPicker';

// Fix Leaflet Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
});

const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng]);
    return null;
};

const LocationMarker = ({ setPosition, onLocationClick }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            // Trigger reverse geocoding immediately when pin is placed
            if (onLocationClick) {
                onLocationClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
};

const AddressModal = ({ isOpen, onClose, addressToEdit = null, onSave, token }) => {
    const [formData, setFormData] = useState({
        receiver_name: '',
        phone: '',
        address_detail: '',
        sub_district: '',
        district: '',
        province: '',
        zipcode: '',
        label: 'Home',
        is_default: false
    });
    const [customLabel, setCustomLabel] = useState(''); // For "Other" custom name
    // Map & GPS State
    const [showMap, setShowMap] = useState(false);
    const [mapPosition, setMapPosition] = useState(null); 
    const [resolvingAddress, setResolvingAddress] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    // --- Fetch & Process Thai Address Data ---
    // (Logic moved to ThaiAddressPicker) 

    useEffect(() => {
        if (isOpen) {
            if (addressToEdit) {
                setFormData(addressToEdit);
                if (addressToEdit.latitude && addressToEdit.longitude) {
                    setMapPosition({
                        lat: parseFloat(addressToEdit.latitude),
                        lng: parseFloat(addressToEdit.longitude)
                    });
                }
            } else {
                setFormData({
                    receiver_name: '',
                    phone: '',
                    province: '',
                    district: '',
                    sub_district: '',
                    zipcode: '',
                    address_detail: '',
                    label: 'Home',
                    is_default: false
                });
                setMapPosition(null);
            }
        }
    }, [isOpen, addressToEdit]);

    // 🐛 DEBUG: Monitor formData changes
    useEffect(() => {
        console.log('🔍 AddressModal formData changed:', {
            province: formData.province,
            district: formData.district,
            sub_district: formData.sub_district,
            zipcode: formData.zipcode,
            address_detail: formData.address_detail
        });
    }, [formData]);

    const handleAddressSelect = (newAddress) => {
        setFormData(prev => ({
            ...prev,
            province: newAddress.province,
            district: newAddress.district,
            sub_district: newAddress.sub_district,
            zipcode: newAddress.zipcode
        }));
    };

    // ... (Map logic remains same)
    
    // Helper to Get Current Location
    const handleGetCurrentLocation = () => {
        setGettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapPosition({ lat: latitude, lng: longitude });
                    setGettingLocation(false);
                    // Auto-resolve address when getting current location
                    resolveAddressFromCoordinates(latitude, longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setGettingLocation(false);
                    Swal.fire('Error', 'ไม่สามารถระบุตำแหน่งจีพีเอสได้', 'error');
                }
            );
        } else {
            setGettingLocation(false);
            Swal.fire('Error', 'Browser นี้ไม่รองรับ Geolocation', 'error');
        }
    };

    // Helper: Normalize OSM address data to match ThaiAddressPicker database
    const normalizeThaiAddress = (osmData) => {
        const { province, district, subDistrict } = osmData;
        
        // Province normalization map
        const provinceMap = {
            'กรุงเทพ': 'กรุงเทพมหานคร',
            'กทม': 'กรุงเทพมหานคร',
            'กทม.': 'กรุงเทพมหานคร',
            'Bangkok': 'กรุงเทพมหานคร',
            // Add more common variations as needed
        };
        
        // Try exact match first
        let normalizedProvince = provinceMap[province] || province;
        
        // Bangkok special handling - if contains 'กรุงเทพ' anywhere
        if (!provinceMap[province] && province && province.includes('กรุงเทพ')) {
            normalizedProvince = 'กรุงเทพมหานคร';
        }
        
        return {
            province: normalizedProvince,
            district: district,
            subDistrict: subDistrict
        };
    };

    const resolveAddressFromCoordinates = async (lat, lng) => {
        setResolvingAddress(true);
         try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`);
            const data = await response.json();

            console.log('🗺️ Reverse Geocoding Full Result:', data);
            console.log('📍 Address details:', data.address);

            if (data && data.display_name) {
                const addr = data.address || {};
                
                // ดึงข้อมูลทุกฟิลด์ที่เป็นไปได้
                const houseNumber = addr.house_number || '';
                const road = addr.road || '';
                const village = addr.village || addr.hamlet || ''; // เพิ่ม hamlet
                const amenity = addr.amenity || '';
                const shop = addr.shop || '';
                const building = addr.building || '';
                
                // Extract province, district, sub_district และตัด prefix ออก
                const rawProvince = addr.province || addr.state || addr.state_district || "";
                const rawDistrict = addr.county || "";
                
                // สำหรับ sub_district - ไม่ใช้ municipality เพราะมันไม่ใช่ตำบล
                const rawSubDistrict = addr.suburb || addr.subdistrict || addr.neighbourhood || addr.quarter || "";
                
                // แต่ถ้าไม่มีตำบลเลย ให้ลองดู municipality สำหรับนำไปแสดงผล (แต่ไม่ใส่ในช่องตำบลเพื่อให้เลือกเองได้)
                const municipality = addr.municipality || addr.city || "";
                
                // 🆕 Bangkok Special Handling
                // OSM ส่งข้อมูลกรุงเทพฯ ในรูปแบบพิเศษ: เขตอยู่ใน suburb, ไม่มี province/county
                const isBangkok = rawSubDistrict.includes('เขต') || municipality.includes('เขต') || 
                                  addr.city === 'กรุงเทพมหานคร' || addr.state === 'กรุงเทพมหานคร';
                
                let finalProvince = rawProvince;
                let finalDistrict = rawDistrict;
                let finalSubDistrict = rawSubDistrict;
                
                if (isBangkok) {
                    console.log('🏙️ Bangkok address detected!');
                    finalProvince = 'กรุงเทพมหานคร';
                    
                    // ใน Bangkok: เขต = District, แขวง = Sub-district
                    // OSM มักส่ง "เขต" มาใน suburb หรือ city_district
                    if (rawSubDistrict.includes('เขต')) {
                        finalDistrict = rawSubDistrict; // เช่น "เขตปทุมวัน"
                        finalSubDistrict = addr.neighbourhood || addr.quarter || ""; // แขวง
                    } else if (municipality.includes('เขต')) {
                        finalDistrict = municipality;
                        finalSubDistrict = rawSubDistrict; // ถ้า suburb ไม่ใช่เขต ก็คือแขวง
                    } else if (addr.city_district) {
                        finalDistrict = addr.city_district;
                        finalSubDistrict = rawSubDistrict;
                    }
                }
                
                // ลบ prefix ที่ไม่จำเป็น
                const cleanProvince = finalProvince.replace(/^(จังหวัด|จ\.)/, '').trim();
                const cleanDistrict = finalDistrict.replace(/^(อำเภอ|เขต|อ\.)/, '').trim();
                const cleanSubDistrict = finalSubDistrict.replace(/^(ตำบล|แขวง|ต\.)/, '').trim();
                const cleanMunicipality = municipality.replace(/^(เทศบาล|เทศบาลเมือง|เทศบาลตำบล|เทศบาลนคร)/, '').trim();

                // สร้าง address_detail แบบไทยมาตรฐาน: เลขที่ ถนน ตำบล อำเภอ จังหวัด รหัส
                let detailParts = [];
                
                // 1. สถานที่/อาคาร (ถ้ามี)
                if (amenity) detailParts.push(amenity);
                if (shop) detailParts.push(shop);
                if (building && building !== 'yes') detailParts.push(building);
                
                // 2. เลขที่
                if (houseNumber) detailParts.push(houseNumber); // ไม่ใส่คำว่า "เลขที่" นำหน้าแล้ว เพื่อความกระชับหรือตาม format ที่userขอ (33/64 ...)
                
                // 3. หมู่บ้าน
                if (village) detailParts.push(village);
                
                // 4. ถนน
                if (road) {
                    // ตรวจสอบว่ามีคำว่า "ถนน" อยู่แล้วหรือไม่
                    const roadText = road.startsWith('ถนน') ? road : `ถนน ${road}`;
                    detailParts.push(roadText);
                }
                
                // 5. ตำบล (ถ้ามี) - ถ้าไม่มี ลองใช้ municipality มาแสดงเพื่อให้รู้ตำแหน่งคร่าวๆ ใน text
                if (cleanSubDistrict) {
                    detailParts.push(`ตำบล${cleanSubDistrict}`);
                } else if (municipality) {
                    // แสดงเทศบาลถ้าไม่มีตำบล ใส่ชื่อเต็มไปเลยเพื่อให้ได้รายละเอียดมากที่สุด
                    detailParts.push(municipality);
                }
                
                // 6. อำเภอ (ถ้ามี)
                if (cleanDistrict) detailParts.push(`อำเภอ${cleanDistrict}`);
                
                // 7. จังหวัด (ถ้ามี)
                if (cleanProvince) detailParts.push(cleanProvince);
                
                // 8. รหัสไปรษณีย์ (ถ้ามี)
                if (addr.postcode) detailParts.push(addr.postcode);
                
                const addressDetail = detailParts.length > 0 
                    ? detailParts.join(' ') 
                    : data.display_name.split(',')[0] || '';
                
                // ✅ Use municipality as fallback for sub_district if not set (non-Bangkok only)
                if (!isBangkok && !finalSubDistrict) {
                    finalSubDistrict = cleanMunicipality || "";
                }

                // ✅ NEW: Normalize OSM data to match ThaiAddressPicker
                const normalized = normalizeThaiAddress({
                    province: cleanProvince,
                    district: cleanDistrict,
                    subDistrict: finalSubDistrict
                });

                const changes = {
                    province: normalized.province,      // ✅ Normalized province
                    district: normalized.district,
                    sub_district: normalized.subDistrict,
                    zipcode: addr.postcode || "",
                    address_detail: addressDetail
                };
                
                console.log('✅ Extracted Address Components (Raw):', {
                    province: cleanProvince,
                    district: cleanDistrict,
                    sub_district: finalSubDistrict
                });
                console.log('✅ Normalized Address Components:', changes);
                setFormData(prev => ({ ...prev, ...changes }));
                
                // ✅ NEW: Show success notification
                if (changes.province || changes.district) {
                    const addressParts = [
                        changes.province,
                        changes.district,
                        changes.sub_district
                    ].filter(Boolean);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'ดึงข้อมูลที่อยู่สำเร็จ',
                        text: addressParts.join(' > '),
                        timer: 2500,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top',
                        background: '#ecfdf5',
                        color: '#065f46',
                        iconColor: '#10b981'
                    });
                }
            }
        } catch (error) {
            console.error('❌ GPS Resolve Error:', error);
        } finally {
            setResolvingAddress(false);
        }
    };
    
    // GPS Confirm
    const handleConfirmLocation = () => {
        if (!mapPosition) return;
        resolveAddressFromCoordinates(mapPosition.lat, mapPosition.lng);
        setShowMap(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
    // Final validations
    const missingFields = [];
    if (!formData.receiver_name) missingFields.push('ชื่อผู้รับ');
    if (!formData.phone) missingFields.push('เบอร์โทรศัพท์');
    if (!formData.province) missingFields.push('จังหวัด');
    if (!formData.district) missingFields.push('อำเภอ/เขต');
    if (!formData.sub_district) missingFields.push('ตำบล/แขวง');
    if (!formData.zipcode) missingFields.push('รหัสไปรษณีย์');

    if (missingFields.length > 0) {
            Swal.fire({
            icon: 'warning',
            title: 'ข้อมูลไม่ครบถ้วน',
            text: `กรุณากรอกข้อมูลให้ครบ: ${missingFields.join(', ')}`,
            confirmButtonColor: '#1a4d2e'
        });
        return;
    }

        const payload = {
            ...formData,
            latitude: mapPosition ? parseFloat(mapPosition.lat.toFixed(6)) : null,
            longitude: mapPosition ? parseFloat(mapPosition.lng.toFixed(6)) : null,
            // Include custom label name if "Other" is selected
            custom_label_name: formData.label === 'Other' ? customLabel : null
        };
        
        onSave(payload);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 bg-[#1a4d2e] text-white flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        {addressToEdit ? <MapPin /> : <MapIcon />} 
                        {addressToEdit ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition"><X size={20} /></button>
                </div>
                
                <div className="p-6 space-y-6">
                     {/* Map Trigger */}
                     <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="bg-green-500/20 p-3 rounded-full text-green-700">
                                <MapIcon size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-green-900">ตำแหน่งบนแผนที่</h4>
                                <p className="text-xs text-green-700">{mapPosition ? 'ปักหมุดตำแหน่งแล้ว' : 'ยังไม่ได้ระบุตำแหน่ง'}</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={handleGetCurrentLocation}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-sm flex items-center gap-2"
                            >
                                <Navigation size={16} className={gettingLocation ? 'animate-spin' : ''} />
                                {gettingLocation ? 'กำลังระบุ...' : 'ใช้ตำแหน่งปัจจุบัน'}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setShowMap(true)}
                                className="bg-white text-green-700 border border-green-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-100 transition shadow-sm flex items-center gap-2"
                            >
                                <MapIcon size={16} />
                                {mapPosition ? 'ดูแผนที่' : 'เปิดแผนที่'}
                            </button>
                         </div>
                    </div>

                    {/* Show Map Modal */}
                    {showMap && (
                         <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                                {/* Map Header */}
                                <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center z-10">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2"><MapIcon size={18} className="text-green-600"/> ปักหมุดตำแหน่งจัดส่ง</h3>
                                    <button onClick={() => setShowMap(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                                </div>
                                
                                {/* Map Content */}
                                <div className="flex-1 relative z-0">
                                    <MapContainer center={mapPosition || [13.7563, 100.5018]} zoom={13} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <RecenterAutomatically lat={mapPosition?.lat} lng={mapPosition?.lng} />
                                        <LocationMarker setPosition={setMapPosition} onLocationClick={resolveAddressFromCoordinates} />
                                        {mapPosition && <Marker position={mapPosition} />}
                                    </MapContainer>
                                    
                                    {/* Map Controls */}
                                    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[400]">
                                        <button 
                                            onClick={handleGetCurrentLocation} 
                                            className="bg-white text-blue-600 p-3 rounded-xl shadow-lg hover:bg-blue-50 transition border border-gray-200"
                                            title="ตำแหน่งปัจจุบัน"
                                        >
                                            <Navigation size={20} className={gettingLocation ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                </div>

                                {/* Map Footer */}
                                <div className="p-4 bg-white border-t border-gray-100 flex gap-3 z-10 shadow-[-1px_-5px_20px_rgba(0,0,0,0.05)]">
                                     <button 
                                        type="button"
                                        onClick={() => setShowMap(false)} 
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                                     >
                                         ยกเลิก
                                     </button>
                                     <button 
                                        type="button"
                                        onClick={() => handleConfirmLocation()} 
                                        className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                     >
                                         {resolvingAddress ? 'กำลังดึงที่อยู่...' : 'ยืนยันตำแหน่งนี้'}
                                     </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ชื่อผู้รับ</label>
                                <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition" value={formData.receiver_name} onChange={e => setFormData({...formData, receiver_name: e.target.value})} placeholder="ชื่อ-นามสกุล" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">เบอร์โทรศัพท์</label>
                                <input required type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})} placeholder="0xxxxxxxxx" maxLength={10} />
                            </div>
                        </div>

                        {/* --- USE NEW COMPONENT --- */}
                        <ThaiAddressPicker currentAddress={formData} onSelect={handleAddressSelect} />

                        {/* Address Detail */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">รายละเอียดที่อยู่ (บ้านเลขที่ / หมู่บ้าน / ซอย / ถนน)</label>
                            <textarea 
                                required 
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition min-h-[80px]" 
                                value={formData.address_detail} 
                                onChange={e => setFormData({...formData, address_detail: e.target.value})} 
                                placeholder="เช่น 123/45 หมู่ 1 ถนน..." 
                            />
                        </div>

                        {/* Label & Default */}
                        <div className="flex items-center gap-4 pt-2">
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ประเภทที่อยู่</label>
                                <div className="flex gap-2 mb-2">
                                    {[
                                        { value: 'Home', label: 'บ้าน', icon: <Home size={14} /> },
                                        { value: 'Work', label: 'ที่ทำงาน', icon: <Briefcase size={14} /> },
                                        { value: 'Other', label: 'อื่นๆ', icon: <MapPin size={14} /> }
                                    ].map(item => (
                                        <button 
                                            key={item.value} 
                                            type="button" 
                                            onClick={() => setFormData({...formData, label: item.value})}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition flex items-center gap-2 ${formData.label === item.value ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Custom label input for "Other" */}
                                {formData.label === 'Other' && (
                                    <input 
                                        type="text"
                                        value={customLabel}
                                        onChange={e => setCustomLabel(e.target.value)}
                                        placeholder="ระบุชื่อสถานที่ เช่น ร้านค้า, คอนโด, โรงเรียน..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition"
                                    />
                                )}
                             </div>
                             <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_default" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300" />
                                <label htmlFor="is_default" className="text-sm font-bold text-gray-700 cursor-pointer select-none">ตั้งเป็นที่อยู่หลัก</label>
                             </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-4 border-t border-gray-100 flex gap-3">
                             <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">ยกเลิก</button>
                             <button type="submit" className="flex-[2] bg-[#1a4d2e] text-white py-3 rounded-xl font-bold hover:bg-[#143d24] transition shadow-lg shadow-green-900/20">บันทึกข้อมูล</button>
                        </div>
                    </form>
                </div>
             </div>
        </div>
    );
};


export default AddressModal;
