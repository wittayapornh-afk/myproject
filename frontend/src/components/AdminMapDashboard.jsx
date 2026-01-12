import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip as RechartsTooltip } from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { Tooltip } from 'react-tooltip';
import { TrendingUp, MapPin, Search, Grid, Map as MapIcon } from 'lucide-react';
import { THAI_PROVINCES } from '../data/ThaiProvinces';

// ==========================================
// 1. ค่าคงที่และข้อมูลช่วยเหลือ (Constants & Helpers)
// ==========================================

// ลิงก์ไฟล์แผนที่ประเทศไทย (TopoJSON) - ใช้ URL ที่ถูกต้อง
const GEO_URL = "https://raw.githubusercontent.com/cvibhagool/thailand-map/master/thailand-provinces.topojson";

// การจับคู่ชื่อจังหวัดภาษาอังกฤษ (จาก GeoJSON) เป็นภาษาไทย
const PROVINCE_MAPPING = {
  "Bangkok Metropolis": "กรุงเทพมหานคร",
  "Bangkok": "กรุงเทพมหานคร",
  "Samut Prakan": "สมุทรปราการ",
  "Nonthaburi": "นนทบุรี",
  "Pathum Thani": "ปทุมธานี",
  "Phra Nakhon Si Ayutthaya": "พระนครศรีอยุธยา",
  "Ang Thong": "อ่างทอง",
  "Lop Buri": "ลพบุรี",
  "Lopburi": "ลพบุรี",
  "Sing Buri": "สิงห์บุรี",
  "Chai Nat": "ชัยนาท",
  "Saraburi": "สระบุรี",
  "Chon Buri": "ชลบุรี",
  "Chonburi": "ชลบุรี",
  "Rayong": "ระยอง",
  "Chanthaburi": "จันทบุรี",
  "Trat": "ตราด",
  "Chachoengsao": "ฉะเชิงเทรา",
  "Prachin Buri": "ปราจีนบุรี",
  "Prachinburi": "ปราจีนบุรี",
  "Nakhon Nayok": "นครนายก",
  "Sa Kaeo": "สระแก้ว",
  "Nakhon Ratchasima": "นครราชสีมา",
  "Buri Ram": "บุรีรัมย์",
  "Buriram": "บุรีรัมย์",
  "Surin": "สุรินทร์",
  "Si Sa Ket": "ศรีสะเกษ",
  "Sisaket": "ศรีสะเกษ",
  "Ubon Ratchathani": "อุบลราชธานี",
  "Yasothon": "ยโสธร",
  "Chaiyaphum": "ชัยภูมิ",
  "Amnat Charoen": "อำนาจเจริญ",
  "Nong Bua Lam Phu": "หนองบัวลำภู",
  "Nong Bua Lamphu": "หนองบัวลำภู",
  "Khon Kaen": "ขอนแก่น",
  "Udon Thani": "อุดรธานี",
  "Loei": "เลย",
  "Nong Khai": "หนองคาย",
  "Maha Sarakham": "มหาสารคาม",
  "Roi Et": "ร้อยเอ็ด",
  "Kalasin": "กาฬสินธุ์",
  "Sakon Nakhon": "สกลนคร",
  "Nakhon Phanom": "นครพนม",
  "Mukdahan": "มุกดาหาร",
  "Chiang Mai": "เชียงใหม่",
  "Lamphun": "ลำพูน",
  "Lampang": "ลำปาง",
  "Uttaradit": "อุตรดิตถ์",
  "Phrae": "แพร่",
  "Nan": "น่าน",
  "Phayao": "พะเยา",
  "Chiang Rai": "เชียงราย",
  "Mae Hong Son": "แม่ฮ่องสอน",
  "Nakhon Sawan": "นครสวรรค์",
  "Uthai Thani": "อุทัยธานี",
  "Kamphaeng Phet": "กำแพงเพชร",
  "Tak": "ตาก",
  "Sukhothai": "สุโขทัย",
  "Phitsanulok": "พิษณุโลก",
  "Phichit": "พิจิตร",
  "Phetchabun": "เพชรบูรณ์",
  "Ratchaburi": "ราชบุรี",
  "Kanchanaburi": "กาญจนบุรี",
  "Suphan Buri": "สุพรรณบุรี",
  "Nakhon Pathom": "นครปฐม",
  "Samut Sakhon": "สมุทรสาคร",
  "Samut Songkhram": "สมุทรสงคราม",
  "Phetchaburi": "เพชรบุรี",
  "Prachuap Khiri Khan": "ประจวบคีรีขันธ์",
  "Nakhon Si Thammarat": "นครศรีธรรมราช",
  "Krabi": "กระบี่",
  "Phangnga": "พังงา",
  "Phang Nga": "พังงา",
  "Phuket": "ภูเก็ต",
  "Surat Thani": "สุราษฎร์ธานี",
  "Ranong": "ระนอง",
  "Chumphon": "ชุมพร",
  "Songkhla": "สงขลา",
  "Satun": "สตูล",
  "Trang": "ตรัง",
  "Phatthalung": "พัทลุง",
  "Pattani": "ปัตตานี",
  "Yala": "ยะลา",
  "Narathiwat": "นราธิวาส",
  "Bueng Kan": "บึงกาฬ"
};

// ฟังก์ชันกำหนดสีตามยอดขาย (Color Scale) - ใช้สีเขียวที่ดูสะอาดตา
const determineColor = (value, maxVal) => {
    if (!value) return '#ECEFF1'; // สีเทาอ่อนถ้าไม่มีข้อมูล
    const intensity = value / maxVal;
    
    // ไล่เฉดสีเขียวจากอ่อนไปเข้ม (Modern Green Palette)
    if (intensity > 0.8) return '#145A32'; // เข้มมาก
    if (intensity > 0.6) return '#1E8449';
    if (intensity > 0.4) return '#27AE60';
    if (intensity > 0.2) return '#58D68D';
    return '#A9DFBF'; // อ่อนสุด
};

// Component สำหรับแสดงเนื้อหาใน Treemap (กราฟกล่อง)
const CustomizedTreemapContent = (props) => {
    const { depth, x, y, width, height, index, payload, colors, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? colors[index % colors.length] : 'rgba(255,255,255,0)',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 && width > 50 && height > 30 ? (
                <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold">
                    {name}
                </text>
            ) : null}
        </g>
    );
};

// ==========================================
// 2. Component หลัก: แดชบอร์ดแผนที่ผู้ดูแลระบบ
// ==========================================
const AdminMapDashboard = ({ salesData, provinceData }) => {
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [provinceDetail, setProvinceDetail] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('map'); // 'map' (แผนที่) หรือ 'chart' (กราฟ)

    // --- เตรียมข้อมูล (Prepare Data) ---
    
    // รวมข้อมูลจังหวัดทั้งหมดเข้ากับข้อมูลยอดขาย
    const fullProvinceData = useMemo(() => {
        return THAI_PROVINCES.map(p => {
            const found = provinceData.find(d => d.name === p);
            return found || { name: p, value: 0, top_product: '-' };
        });
    }, [provinceData]);

    // กรองข้อมูลตามคำค้นหา
    const filteredProvinces = useMemo(() => {
        if (!searchTerm) return fullProvinceData;
        return fullProvinceData.filter(p => p.name.includes(searchTerm));
    }, [fullProvinceData, searchTerm]);

    // เตรียมข้อมูลสำหรับ Treemap
    const treemapData = useMemo(() => {
        const activeData = filteredProvinces.filter(p => p.value > 0).map(p => ({
            name: p.name,
            size: p.value,
            value: p.value 
        }));
        return [{ name: 'ประเทศไทย', children: activeData }];
    }, [filteredProvinces]);

    // คำนวณค่ายอดขายสูงสุดเพื่อทำระดับสี
    const maxVal = Math.max(...fullProvinceData.map(d => d.value), 1);
    const TREEMAP_COLORS = ['#1a4d2e', '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'];

    // --- การจัดการ Event (Handlers) ---
    
    const handleProvinceClick = (provinceName) => {
        const data = fullProvinceData.find(d => d.name === provinceName);
        if (data) {
            setSelectedProvince(provinceName);
            setProvinceDetail(data);
        }
    };

    return (
        <div className="space-y-6">
            
            {/* --- 1. ส่วนหัวและตัวควบคุม (Header & Controls) --- */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 gap-4">
                <div>
                    <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                        🗺️ แผนที่ยอดขายรายจังหวัด
                        <span className="text-xs bg-green-100 text-[#1a4d2e] px-2 py-1 rounded-lg animate-pulse">ข้อมูลอัปเดตล่าสุด</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">แสดงข้อมูลยอดขายจริงแยกตามพื้นที่ภูมิศาสตร์</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* ปุ่มสลับมุมมอง (View Switcher) */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode('map')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow text-[#1a4d2e]' : 'text-gray-400'}`}
                            title="มุมมองแผนที่"
                        >
                            <MapIcon size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('chart')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'chart' ? 'bg-white shadow text-[#1a4d2e]' : 'text-gray-400'}`}
                            title="มุมมองกราฟกล่อง"
                        >
                            <TrendingUp size={18} />
                        </button>
                    </div>

                    {/* ช่องค้นหา (Search) */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="ค้นหาจังหวัด..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-[#1a4d2e] rounded-xl outline-none transition-all text-sm font-bold text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- 2. พื้นที่แสดงผลแผนที่หรือกราฟ (Visualization Area) --- */}
                <div className="lg:col-span-2 space-y-6 h-[600px] bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 overflow-hidden relative z-0">
                    {viewMode === 'map' ? (
                        /* ✅ Render React Simple Maps (SVG Map) */
                        <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-white relative">
                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{
                                    scale: 3000, // ปรับขนาดแผนที่ให้พอดี
                                    center: [100.5, 13.8] // จุดศูนย์กลางประเทศไทย
                                }}
                                style={{ width: "100%", height: "100%" }}
                            >
                                <ZoomableGroup zoom={1}>
                                    <Geographies geography={GEO_URL}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => {
                                                const engName = geo.properties.NAME_1 || geo.properties.name;
                                                const thaiName = PROVINCE_MAPPING[engName] || engName;
                                                const data = fullProvinceData.find(d => d.name === thaiName);
                                                const val = data ? data.value : 0;
                                                
                                                return (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        data-tooltip-id="my-tooltip"
                                                        data-tooltip-content={`${thaiName} - ฿${val.toLocaleString()}`}
                                                        data-tooltip-place="top"
                                                        onClick={() => handleProvinceClick(thaiName)}
                                                        style={{
                                                            default: {
                                                                fill: determineColor(val, maxVal),
                                                                stroke: "#FFF",
                                                                strokeWidth: 0.5,
                                                                outline: "none",
                                                                transition: "all 0.3s ease"
                                                            },
                                                            hover: {
                                                                fill: "#F1C40F", // สีเหลืองทองเมื่อชี้
                                                                stroke: "#FFF",
                                                                strokeWidth: 1,
                                                                outline: "none",
                                                                filter: "drop-shadow(0 0 5px rgba(0,0,0,0.2))",
                                                                cursor: "pointer"
                                                            },
                                                            pressed: {
                                                                fill: "#D4AC0D",
                                                                stroke: "#FFF",
                                                                outline: "none"
                                                            }
                                                        }}
                                                    />
                                                );
                                            })
                                        }
                                    </Geographies>
                                </ZoomableGroup>
                            </ComposableMap>
                            {/* Tooltip สำหรับแผนที่ */}
                            <Tooltip id="my-tooltip" style={{ borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }} />
                        </div>
                    ) : (
                        /* ✅ Render Treemap */
                        <div className="h-full w-full p-4">
                            <h4 className="font-bold text-gray-700 mb-4 ml-2">สัดส่วนยอดขายตามพื้นที่</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <Treemap
                                    data={treemapData}
                                    dataKey="size"
                                    aspectRatio={4 / 3}
                                    stroke="#fff"
                                    fill="#8884d8"
                                    onClick={(data) => data.payload && handleProvinceClick(data.payload.name)}
                                    content={<CustomizedTreemapContent colors={TREEMAP_COLORS} />}
                                >
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                        formatter={(val) => `฿${val.toLocaleString()}`}
                                    />
                                </Treemap>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* --- 3. แถบรายละเอียด (Detail Sidebar) --- */}
                <div className="space-y-4">
                    <h3 className="font-black text-xl text-gray-800 pl-2 border-l-4 border-[#1a4d2e]">📊 รายละเอียดพื้นที่</h3>

                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative ${selectedProvince ? 'bg-white border-gray-100 shadow-2xl scale-100 opacity-100' : 'bg-gray-50 border-dashed border-gray-300 flex items-center justify-center h-[400px] opacity-70'}`}>

                        {selectedProvince && provinceDetail ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* ส่วนหัวของจังหวัด */}
                                <div className="text-center relative">
                                    <div className="absolute top-0 right-0 p-2 bg-green-50 rounded-full text-[#1a4d2e]">
                                        <MapPin size={16} />
                                    </div>
                                    <span className="inline-block p-4 bg-green-50 rounded-2xl mb-4 text-3xl shadow-sm border border-green-100">
                                        📍
                                    </span>
                                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">{provinceDetail.name}</h2>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">ยอดขายสะสม</p>
                                    <div className="text-4xl lg:text-5xl font-black text-[#1a4d2e] mt-2 drop-shadow-sm">
                                        ฿{provinceDetail.value.toLocaleString()}
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* ข้อมูลสินค้าขายดี */}
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-3xl border border-orange-200 relative overflow-hidden group hover:shadow-lg transition-all">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-200 rounded-full opacity-20 group-hover:scale-150 transition-all"></div>
                                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                            <span className="text-lg">🏆</span> สินค้าขายดี
                                        </p>
                                        <p className="font-black text-gray-800 text-xl leading-tight line-clamp-2">
                                            {provinceDetail.top_product}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-300 py-12">
                                <MapIcon size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="font-black text-gray-400 text-lg">โปรดเลือกจังหวัด</p>
                                <p className="text-xs mt-1">คลิกบนแผนที่เพื่อดูข้อมูลเชิงลึก</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMapDashboard;
