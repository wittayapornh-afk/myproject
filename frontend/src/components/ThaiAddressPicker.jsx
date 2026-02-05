import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const HARDCODED_PROVINCES = [
    "กระบี่", "กรุงเทพมหานคร", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
];

// Helper to normalize text for comparison (remove prefixes)
const normalize = (str) => {
    if (!str) return '';
    return str.replace(/^(จังหวัด|อำเภอ|เขต|ตำบล|แขวง)/, '').trim();
};

export const formatAddressDisplay = (address) => {
    if (!address.province) return "เลือกที่อยู่...";

    const isBKK = address.province.includes('กรุงเทพ');
    
    let p = address.province;
    let d = address.district || '';
    let s = address.sub_district || '';
    let z = address.zipcode || '';

    // Build display with only filled values
    let parts = [];
    
    // Province (always show if exists)
    if (p) {
        parts.push(p.startsWith('จังหวัด') || isBKK ? p : p);
    }
    
    // District
    if (d) {
        parts.push(d);
    }
    
    // Sub-district  
    if (s) {
        parts.push(s);
    }
    
    // Zipcode
    if (z) {
        parts.push(z);
    }

    return parts.length > 0 ? parts.join(' > ') : 'เลือกที่อยู่...';
};

const ThaiAddressPicker = ({ currentAddress, onSelect }) => {
    const [activeTab, setActiveTab] = useState('province'); // province, district, subdistrict, zipcode
    const [pickerSearch, setPickerSearch] = useState('');
    const deferredSearch = useDeferredValue(pickerSearch);
    const [showAddressPicker, setShowAddressPicker] = useState(false);
    
    // Refs for Data
    const hierarchicalDataRef = useRef([]);
    const isFetched = useRef(false);
    const [loadingData, setLoadingData] = useState(false);

    // Fetch Data
    useEffect(() => {
        if (isFetched.current) return;
        isFetched.current = true;
        setLoadingData(true);

        console.log('🔄 Loading Thailand address data...');

        // ใช้ข้อมูลจาก jquery.Thailand.js ที่มีข้อมูลครบถ้วน
        fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json')
            .then(res => {
                console.log('📦 Address data response:', res.status);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(rawData => {
                console.log('✅ Raw data loaded, processing...');
                
                // แปลง flat data เป็น hierarchical structure
                const provinces = {};
                
                rawData.forEach(item => {
                    const province = item.province || item.จังหวัด;
                    const district = item.amphoe || item.อำเภอ;
                    const subdistrict = item.district || item.ตำบล;
                    const zipcode = item.zipcode || item.รหัสไปรษณีย์;
                    
                    if (!province) return;
                    
                    // สร้างโครงสร้างจังหวัด
                    if (!provinces[province]) {
                        provinces[province] = {
                            name_th: province,
                            amphure: {}
                        };
                    }
                    
                    // สร้างโครงสร้างอำเภอ
                    if (district && !provinces[province].amphure[district]) {
                        provinces[province].amphure[district] = {
                            name_th: district,
                            tambon: []
                        };
                    }
                    
                    // เพิ่มตำบล
                    if (district && subdistrict) {
                        const exists = provinces[province].amphure[district].tambon.find(
                            t => t.name_th === subdistrict
                        );
                        if (!exists) {
                            provinces[province].amphure[district].tambon.push({
                                name_th: subdistrict,
                                zip_code: zipcode
                            });
                        }
                    }
                });
                
                // แปลงเป็น array
                const hierarchicalData = Object.values(provinces).map(prov => ({
                    ...prov,
                    amphure: Object.values(prov.amphure)
                }));
                
                hierarchicalDataRef.current = hierarchicalData;
                console.log('✅ Provinces loaded:', hierarchicalData.length);
                console.log('✅ First province:', hierarchicalData[0]?.name_th);
                console.log('✅ Sample amphure:', hierarchicalData[0]?.amphure?.[0]?.name_th);
                console.log('✅ Sample tambon:', hierarchicalData[0]?.amphure?.[0]?.tambon?.[0]?.name_th);
                setLoadingData(false);
            })
            .catch(err => {
                console.error("❌ Address DB Fetch Error:", err);
                console.log('⚠️ Falling back to hardcoded provinces...');
                // Fallback: ใช้ข้อมูลจังหวัดที่ hardcode ไว้
                hierarchicalDataRef.current = HARDCODED_PROVINCES.map(name => ({
                    name_th: name,
                    amphure: []
                }));
                setLoadingData(false);
            });
    }, []);

    const filteredList = useMemo(() => {
        const searchText = deferredSearch.trim().toLowerCase();
        let list = [];

        console.log('🔍 Filtering:', { 
            activeTab, 
            dataLoaded: hierarchicalDataRef.current.length,
            searchText,
            currentAddress 
        });

        try {
            if (activeTab === 'province') {
                list = hierarchicalDataRef.current.map(p => ({ name: p.name_th, data: p }));
                console.log('📍 Province list:', list.length);
            } else if (activeTab === 'district') {
                const provName = normalize(currentAddress.province);
                const prov = hierarchicalDataRef.current.find(p => normalize(p.name_th) === provName);
                console.log('📍 Finding districts for:', provName, 'Found:', !!prov);
                if (prov) {
                    list = (prov.amphure || prov.districts || []).map(d => ({ 
                        name: d.name_th || d.name_en || '', 
                        data: d 
                    }));
                }
            } else if (activeTab === 'subdistrict') {
                const provName = normalize(currentAddress.province);
                const prov = hierarchicalDataRef.current.find(p => normalize(p.name_th) === provName);
                
                const distName = normalize(currentAddress.district);
                const dist = (prov?.amphure || prov?.districts || []).find(d => normalize(d.name_th) === distName);
                
                if (dist) {
                    list = (dist.tambon || dist.subdistricts || []).map(s => ({ 
                        name: s.name_th || s.name_en || '', 
                        data: s 
                    }));
                }
            } else if (activeTab === 'zipcode') {
                const provName = normalize(currentAddress.province);
                const prov = hierarchicalDataRef.current.find(p => normalize(p.name_th) === provName);
                
                const distName = normalize(currentAddress.district);
                const dist = (prov?.amphure || prov?.districts || []).find(d => normalize(d.name_th) === distName);
                
                const subName = normalize(currentAddress.sub_district);
                const sub = (dist?.tambon || dist?.subdistricts || []).find(s => normalize(s.name_th) === subName);
                
                if (sub && sub.zip_code) {
                    list = [{ name: String(sub.zip_code), data: sub }];
                }
            }
        } catch (e) {
            console.error('Address filtering error:', e);
        }

        // Smart filtering: รองรับทั้งข้อความเต็มและคำย่อ
        if (searchText) {
            return list.filter(item => {
                if (!item || !item.name) return false;
                const itemName = item.name.toLowerCase();
                const normalizedItem = normalize(item.name.toLowerCase());
                
                // ค้นหาในทั้งชื่อเต็มและชื่อที่เอา prefix ออกแล้ว
                return itemName.includes(searchText) || normalizedItem.includes(searchText);
            });
        }
        
        return list.filter(item => item && item.name); // Filter out empty items
    }, [deferredSearch, activeTab, currentAddress.province, currentAddress.district, currentAddress.sub_district]);

    const handleSelectFromPicker = (item) => {
        if (activeTab === 'province') {
            onSelect({ ...currentAddress, province: item.name || '', district: '', sub_district: '', zipcode: '' });
            setActiveTab('district');
            setPickerSearch('');
        } else if (activeTab === 'district') {
            onSelect({ ...currentAddress, district: item.name || '', sub_district: '', zipcode: '' });
            setActiveTab('subdistrict');
            setPickerSearch('');
        } else if (activeTab === 'subdistrict') {
            onSelect({ ...currentAddress, sub_district: item.name || '', zipcode: String(item.data.zip_code || '') });
            setShowAddressPicker(false);
            setPickerSearch('');
        } else if (activeTab === 'zipcode') {
             onSelect({ ...currentAddress, zipcode: item.name });
             setShowAddressPicker(false);
        }
    };

    return (
        <div className="relative z-20">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">เลือกที่อยู่ (จังหวัด / อำเภอ / ตำบล / รหัสไปรษณีย์)</label>
            
            {/* Main Input Trigger */}
            <div 
                className="relative cursor-pointer group"
                onClick={() => setShowAddressPicker(!showAddressPicker)}
            >
                <div className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 flex items-center justify-between group-hover:bg-blue-50 transition selection-ring">
                    <span className={!currentAddress.province ? "text-gray-400" : "text-[#1a4d2e] truncate"}>
                        {formatAddressDisplay(currentAddress)}
                    </span>
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-blue-500 transition flex-shrink-0 ml-2" />
                </div>
            </div>

            {/* Popup Selector */}
            {showAddressPicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 origin-top">
                    {/* Tabs Header */}
                    <div className="flex bg-gray-50 border-b border-gray-200">
                        {['province', 'district', 'subdistrict', 'zipcode'].map((tab, idx) => {
                            const labels = { province: 'จังหวัด', district: 'เขต/อำเภอ', subdistrict: 'แขวง/ตำบล', zipcode: 'รหัสไปรษณีย์' };
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    disabled={idx > (['province', 'district', 'subdistrict', 'zipcode'].indexOf(activeTab))} 
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-[10px] md:text-xs font-bold text-center transition px-1 ${isActive ? 'bg-white text-[#1a4d2e] border-b-2 border-[#1a4d2e]' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {labels[tab]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search In Picker */}
                    <div className="p-3 border-b border-gray-100 bg-white">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input 
                                autoFocus
                                className="w-full bg-gray-100 border-none rounded-lg pl-9 pr-4 py-2 text-sm font-medium focus:ring-0 text-gray-700 placeholder-gray-400"
                                placeholder={`ค้นหา${activeTab}...`}
                                value={pickerSearch}
                                onChange={e => setPickerSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                        {loadingData ? (
                            <div className="p-8 text-center text-gray-400 text-xs">กำลังโหลดข้อมูล...</div>
                        ) : filteredList.length > 0 ? (
                            <>
                                <div className="px-4 py-2 text-[10px] text-gray-400 bg-gray-50 border-b border-gray-100">
                                    พบ {filteredList.length} รายการ
                                </div>
                                <ul className="divide-y divide-gray-50">
                                    {filteredList.map((item, idx) => (
                                        <li key={item.name || idx}>
                                            <button
                                                type="button"
                                                className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-green-50 hover:text-green-700 transition flex items-center justify-between group"
                                                onClick={() => handleSelectFromPicker(item)}
                                            >
                                                <span>{item.name}</span>
                                                <Check size={16} className="opacity-0 group-hover:opacity-100 text-green-600" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-400 text-xs">ไม่พบข้อมูล</p>
                                {activeTab !== 'province' && (
                                    <p className="text-gray-500 text-[10px] mt-1">กรุณาเลือก{activeTab === 'district' ? 'จังหวัด' : activeTab === 'subdistrict' ? 'อำเภอ' : 'ตำบล'}ก่อน</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThaiAddressPicker;
