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

// Draggable Marker Component
const DraggableMarker = ({ position, setPosition, onDragEnd }) => {
    const markerRef = React.useRef(null);
    
    const eventHandlers = React.useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    if (onDragEnd) {
                        onDragEnd(newPos);
                    }
                }
            },
        }),
        [setPosition, onDragEnd]
    );
    
    // Also handle map clicks
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            if (onDragEnd) {
                onDragEnd(e.latlng);
            }
        },
    });
    
    if (!position) return null;
    
    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
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
        is_default: false,
        accuracy: '',
        verified: false
    });
    
    // Map & GPS State
    const [showMap, setShowMap] = useState(false);
    const [mapPosition, setMapPosition] = useState(null); 
    const [resolvingAddress, setResolvingAddress] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    
    // Address Verification State
    const [addressAccuracy, setAddressAccuracy] = useState(null); // building, road, city, etc.

    // --- Fetch & Process Thai Address Data ---
    // (Logic moved to ThaiAddressPicker) 

    useEffect(() => {
        if (addressToEdit) {
            setFormData({
                receiver_name: addressToEdit.receiver_name || '',
                phone: addressToEdit.phone || '',
                address_detail: addressToEdit.address_detail || '',
                sub_district: addressToEdit.sub_district || '',
                district: addressToEdit.district || '',
                province: addressToEdit.province || '',
                zipcode: addressToEdit.zipcode || '',
                label: addressToEdit.label || 'Home',
                is_default: addressToEdit.is_default || false,
                accuracy: addressToEdit.accuracy || '',
                verified: addressToEdit.verified || false
            });
            if (addressToEdit.latitude && addressToEdit.longitude) {
                setMapPosition({
                    lat: parseFloat(addressToEdit.latitude),
                    lng: parseFloat(addressToEdit.longitude)
                });
            }
        } else {
             // Reset form for new address
             setFormData({
                receiver_name: '',
                phone: '',
                address_detail: '',
                sub_district: '',
                district: '',
                province: '',
                zipcode: '',
                label: 'Home',
                is_default: false,
                accuracy: '',
                verified: false
            });
            setMapPosition(null);
        }
    }, [addressToEdit, isOpen]);

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
                const village = addr.village || '';
                const amenity = addr.amenity || '';
                const shop = addr.shop || '';
                const building = addr.building || '';
                
                // ตรวจสอบว่าเป็นกรุงเทพฯ หรือไม่
                const isBangkok = addr.city === 'กรุงเทพมหานคร' || addr.state === 'กรุงเทพมหานคร';
                
                let rawProvince, rawDistrict, rawSubDistrict;
                
                if (isBangkok) {
                    // กรุงเทพฯ: city=จังหวัด, suburb=เขต, quarter=แขวง
                    rawProvince = addr.city || addr.state || "";
                    rawDistrict = addr.suburb || "";  // เขต
                    rawSubDistrict = addr.quarter || addr.neighbourhood || "";  // แขวง
                } else {
                    // ต่างจังหวัด: province=จังหวัด, county=อำเภอ, suburb=ตำบล
                    rawProvince = addr.province || addr.state || "";
                    rawDistrict = addr.county || "";
                    // ใช้เฉพาะ suburb/subdistrict ที่เชื่อถือได้ - ไม่ใช้ municipality
                    rawSubDistrict = addr.suburb || addr.subdistrict || addr.neighbourhood || addr.quarter || "";
                }
                
                // ลบ prefix ที่ไม่จำเป็น
                const cleanProvince = rawProvince.replace(/^(จังหวัด|จ\.)/, '').trim();
                const cleanDistrict = rawDistrict.replace(/^(อำเภอ|เขต|อ\.)/, '').trim();
                let cleanSubDistrict = rawSubDistrict.replace(/^(ตำบล|แขวง|ต\.)/, '').trim();
                
                // 🔄 Cross-Reference: ถ้าไม่มี subdistrict → หาจาก ThaiAddressPicker database
                if (!cleanSubDistrict && cleanProvince && cleanDistrict && !isBangkok) {
                    console.log('🔍 Nominatim ไม่มีตำบล → ใช้ Cross-Reference');
                    
                    // ดึงข้อมูลจาก Thailand Address Database (เดียวกับที่ ThaiAddressPicker ใช้)
                    try {
                        const dbResponse = await fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json');
                        const rawData = await dbResponse.json();
                        
                        // กรองเฉพาะตำบลในอำเภอที่กำลังมอง
                        const subdistrictsInDistrict = rawData.filter(item => 
                            item.province === cleanProvince && 
                            item.amphoe === cleanDistrict
                        );
                        
                        if (subdistrictsInDistrict.length > 0) {
                            // ถ้ามีตำบลเดียว → ใช้เลย
                            if (subdistrictsInDistrict.length === 1) {
                                cleanSubDistrict = subdistrictsInDistrict[0].district;
                                console.log('✅ Found single subdistrict:', cleanSubDistrict);
                            } else {
                                // ถ้ามีหลายตำบล → เลือกตำบลแรก (fallback)
                                // TODO: ในอนาคตอาจใช้ distance calculation หาตำบลที่ใกล้ที่สุด
                                cleanSubDistrict = subdistrictsInDistrict[0].district;
                                console.log(`⚠️ Found ${subdistrictsInDistrict.length} subdistricts, using first:`, cleanSubDistrict);
                            }
                        }
                    } catch (error) {
                        console.error('❌ Cross-reference failed:', error);
                    }
                }
                
                // ตรวจสอบว่า sub_district ควรแสดงใน address_detail หรือไม่
                const shouldShowSubDistrict = cleanSubDistrict && 
                    cleanSubDistrict !== cleanProvince && 
                    cleanSubDistrict !== cleanDistrict;
                
                // สร้าง address_detail แบบไทยมาตรฐาน
                let detailParts = [];
                
                // 1. สถานที่/อาคาร (ถ้ามี)
                if (amenity) detailParts.push(amenity);
                if (shop) detailParts.push(shop);
                if (building && building !== 'yes') detailParts.push(building);
                
                // 2. เลขที่
                if (houseNumber) detailParts.push(houseNumber);
                
                // 3. หมู่บ้าน
                if (village) detailParts.push(village);
                
                // 4. ถนน/ซอย
                if (road) {
                    // ตรวจสอบว่ามี "ถนน" หรือ "ซอย" อยู่แล้วหรือไม่
                    const roadText = (road.startsWith('ถนน') || road.startsWith('ซอย')) ? road : `ถนน${road}`;
                    detailParts.push(roadText);
                }
                
                // 5. ตำบล/แขวง (ถ้ามีและไม่ซ้ำกับจังหวัด/อำเภอ)
                if (shouldShowSubDistrict) {
                    const prefix = isBangkok ? 'แขวง' : 'ตำบล';
                    detailParts.push(`${prefix}${cleanSubDistrict}`);
                }
                
                // 6. อำเภอ/เขต
                if (cleanDistrict) {
                    const prefix = isBangkok ? 'เขต' : 'อำเภอ';
                    detailParts.push(`${prefix}${cleanDistrict}`);
                }
                
                // 7. จังหวัด
                if (cleanProvince) detailParts.push(cleanProvince);
                
                // 8. รหัสไปรษณีย์
                if (addr.postcode) detailParts.push(addr.postcode);
                
                const addressDetail = detailParts.length > 0 
                    ? detailParts.join(' ') 
                    : data.display_name.split(',')[0] || '';
                
                // Extract accuracy level from Nominatim
                const accuracy = data.addresstype || data.type || 'unknown';
                setAddressAccuracy(accuracy);
                
                const changes = {
                    province: cleanProvince,
                    district: cleanDistrict,
                    sub_district: cleanSubDistrict,
                    zipcode: addr.postcode || "",
                    address_detail: addressDetail,
                    accuracy: accuracy
                };
                
                console.log('🏙️ Is Bangkok:', isBangkok);
                console.log('📍 Accuracy:', accuracy);
                console.log('✅ Extracted Address Components:', changes);
                setFormData(prev => ({ ...prev, ...changes }));
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
        if (!formData.receiver_name || !formData.phone || !formData.province || !formData.district || !formData.sub_district || !formData.zipcode) {
             Swal.fire({
                icon: 'warning',
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน',
                confirmButtonColor: '#1a4d2e'
            });
            return;
        }

        const payload = {
            ...formData,
            latitude: mapPosition ? mapPosition.lat : null,
            longitude: mapPosition ? mapPosition.lng : null
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
                         <button 
                            type="button" 
                            onClick={() => {
                                setShowMap(true);
                                if (!mapPosition) handleGetCurrentLocation();
                            }}
                            className="bg-white text-green-700 border border-green-200 px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-100 transition shadow-sm"
                        >
                            {mapPosition ? 'แก้ไขตำแหน่ง' : 'เลือกตำแหน่ง'}
                        </button>
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
                                        <DraggableMarker 
                                            position={mapPosition} 
                                            setPosition={setMapPosition}
                                            onDragEnd={(pos) => {
                                                // Auto-resolve address on drag
                                                resolveAddressFromCoordinates(pos.lat, pos.lng);
                                            }}
                                        />
                                    </MapContainer>
                                    
                                    {/* Map hint */}
                                    {mapPosition && (
                                      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md text-sm text-gray-700 z-[400]">
                                           💡 ลากหมุดเพื่อปรับตำแหน่ง
                                       </div>
                                    )}
                                    
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
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">รายละเอียดที่อยู่ (บ้านเลขที่, หมู่บ้าน, ซอย, ถนน)</label>
                            <textarea required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition min-h-[80px]" value={formData.address_detail} onChange={e => setFormData({...formData, address_detail: e.target.value})} placeholder="เช่น 123/45 หมู่ 1 ถนน..." />
                        </div>

                        {/* Accuracy Indicator */}
                        {addressAccuracy && mapPosition && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        {((acc) => {
                                            if (acc === 'building' || acc === 'house') 
                                                return <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>;
                                            if (acc === 'road' || acc === 'street' || acc === 'residential')
                                                return <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1"></div>;
                                            return <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>;
                                        })(addressAccuracy)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-sm text-gray-900 mb-1">
                                            ความแม่นยำของตำแหน่ง: {
                                                (() => {
                                                    if (addressAccuracy === 'building' || addressAccuracy === 'house') 
                                                        return <span className="text-green-700">สูงมาก ✓</span>;
                                                    if (addressAccuracy === 'road' || addressAccuracy === 'street' || addressAccuracy === 'residential')
                                                        return <span className="text-yellow-700">ปานกลาง ⚠</span>;
                                                    return <span className="text-red-700">ต่ำ ✗</span>;
                                                })()
                                            }
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {addressAccuracy === 'building' || addressAccuracy === 'house' 
                                                ? 'ตำแหน่งระบุได้ถึงระดับอาคาร/บ้าน - แม่นยำมาก'
                                                : addressAccuracy === 'road' || addressAccuracy === 'street' || addressAccuracy === 'residential'
                                                ? 'ตำแหน่งระบุได้ถึงระดับถนน - ควรปรับตำแหน่งให้แม่นยำขึ้น'
                                                : 'ตำแหน่งไม่แม่นยำ - กรุณาลากหมุดไปยังตำแหน่งที่ถูกต้อง'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Checkbox */}
                        {mapPosition && (
                            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox"
                                        checked={formData.verified}
                                        onChange={(e) => setFormData({...formData, verified: e.target.checked})}
                                        className="mt-1 w-5 h-5 text-orange-600 border-orange-300 rounded focus:ring-orange-500 cursor-pointer"
                                        required={mapPosition !== null}
                                    />
                                    <div className="flex-1">
                                        <span className="font-bold text-sm text-orange-900 group-hover:text-orange-700 transition">
                                            ✓ ยืนยันว่านี่คือตำแหน่งที่อยู่จริงของฉัน
                                        </span>
                                        <p className="text-xs text-orange-700 mt-1">
                                            กรุณาตรวจสอบว่าหมุดอยู่ตรงตำแหน่งที่ถูกต้องก่อนยืนยัน
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

                        {/* Label & Default */}
                        <div className="flex items-center gap-4 pt-2">
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ตั้งชื่อสถานที่</label>
                                <div className="flex gap-2">
                                    {['Home', 'Office', 'Other'].map(l => (
                                        <button 
                                            key={l} 
                                            type="button" 
                                            onClick={() => setFormData({...formData, label: l})}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition flex items-center gap-2 ${formData.label === l ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {l === 'Home' && <Home size={14} />}
                                            {l === 'Office' && <Briefcase size={14} />}
                                            {l}
                                        </button>
                                    ))}
                                </div>
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
