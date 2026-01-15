import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import { MapPin } from 'lucide-react';

// ==========================================
// Dashboard Map Widget (React Simple Maps)
// แผนที่ประเทศไทยแสดงยอดขายรายจังหวัด (SVG)
// ==========================================

const GEO_URL = "https://raw.githubusercontent.com/cvibhagool/thailand-map/master/thailand-provinces.topojson";

// การจับคู่ชื่อจังหวัดภาษาอังกฤษ -> ไทย
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

const determineColor = (value, maxVal) => {
    if (!value) return '#ECEFF1'; 
    const intensity = value / maxVal;
    if (intensity > 0.8) return '#145A32'; 
    if (intensity > 0.6) return '#1E8449';
    if (intensity > 0.4) return '#27AE60';
    if (intensity > 0.2) return '#58D68D';
    return '#A9DFBF'; 
};

const DashboardMapWidget = ({ provinceData, onProvinceSelect }) => {
    
    // เตรียมข้อมูลและคำนวณ Max Value
    const processedData = useMemo(() => {
        if (!provinceData) return [];
        return provinceData;
    }, [provinceData]);

    const maxVal = Math.max(...(processedData.map(d => d.value) || [0]), 1);

    return (
        <div className="w-full h-[400px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 3500, // Zoom in more
                    center: [100.5, 13.8] 
                }}
                style={{ width: "100%", height: "100%", backgroundColor: "#ffffff" }}
            >
                <ZoomableGroup zoom={1} minZoom={1} maxZoom={5} translateExtent={[[95, 5], [108, 22]]}>
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const engName = geo.properties.NAME_1 || geo.properties.name;
                                const thaiName = PROVINCE_MAPPING[engName] || engName;
                                const data = processedData.find(d => d.name === thaiName || d.name.includes(thaiName));
                                const val = data ? data.value : 0;
                                
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        data-tooltip-id="widget-tooltip"
                                        data-tooltip-content={`${thaiName} ${val > 0 ? `฿${val.toLocaleString()}` : ''}`}
                                        onClick={() => onProvinceSelect && onProvinceSelect(data || { name: thaiName, value: 0 })}
                                        style={{
                                            default: {
                                                fill: determineColor(val, maxVal),
                                                stroke: "#808080", // Darker stroke
                                                strokeWidth: 0.8,
                                                outline: "none",
                                                transition: "all 0.3s ease",
                                                filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.1))" // Add shadow
                                            },
                                            hover: {
                                                fill: "#FCD34D", // Brighter hover
                                                stroke: "#000",
                                                strokeWidth: 1.5,
                                                outline: "none",
                                                cursor: "pointer",
                                                filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.2))"
                                            },
                                            pressed: {
                                                fill: "#D97706",
                                                stroke: "#000",
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
            
            {/* Tooltip */}
            <Tooltip 
                id="widget-tooltip" 
                style={{ 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(0,0,0,0.8)' 
                }} 
            />

            {/* Title / Badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2">
                <div className="bg-green-100 p-1 rounded-md text-[#1a4d2e]">
                    <MapPin size={14} />
                </div>
                <span className="text-xs font-bold text-gray-700">แผนที่ยอดขาย</span>
            </div>
        </div>
    );
};

export default DashboardMapWidget;
