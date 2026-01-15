import React, { useState, useEffect, useMemo, useRef } from 'react';
import Highcharts from 'highcharts/highmaps'; 
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting'; 
import { MapPin } from 'lucide-react'; 
import thailandMap from '../data/thailandMap.json'; 

// ✅ Initialize Exporting
if (typeof HighchartsExporting === 'function') {
    HighchartsExporting(Highcharts);
}

// ✅ 1. Mapping ชื่อภาษาอังกฤษจาก Highcharts -> ภาษาไทย
const PROVINCE_MAPPING = {
  "Bangkok Metropolis": "กรุงเทพมหานคร",
  "Samut Prakan": "สมุทรปราการ",
  "Nonthaburi": "นนทบุรี",
  "Pathum Thani": "ปทุมธานี",
  "Phra Nakhon Si Ayutthaya": "พระนครศรีอยุธยา",
  "Ang Thong": "อ่างทอง",
  "Lop Buri": "ลพบุรี",
  "Sing Buri": "สิงห์บุรี",
  "Chai Nat": "ชัยนาท",
  "Saraburi": "สระบุรี",
  "Chon Buri": "ชลบุรี",
  "Rayong": "ระยอง",
  "Chanthaburi": "จันทบุรี",
  "Trat": "ตราด",
  "Chachoengsao": "ฉะเชิงเทรา",
  "Prachin Buri": "ปราจีนบุรี",
  "Nakhon Nayok": "นครนายก",
  "Sa Kaeo": "สระแก้ว",
  "Nakhon Ratchasima": "นครราชสีมา",
  "Buri Ram": "บุรีรัมย์",
  "Surin": "สุรินทร์",
  "Si Sa Ket": "ศรีสะเกษ",
  "Ubon Ratchathani": "อุบลราชธานี",
  "Yasothon": "ยโสธร",
  "Chaiyaphum": "ชัยภูมิ",
  "Amnat Charoen": "อำนาจเจริญ",
  "Nong Bua Lam Phu": "หนองบัวลำภู",
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
  "Chumphon": "ชุมพร",
  "Ranong": "ระนอง",
  "Surat Thani": "สุราษฎร์ธานี",
  "Phangnga": "พังงา",
  "Phuket": "ภูเก็ต",
  "Krabi": "กระบี่",
  "Nakhon Si Thammarat": "นครศรีธรรมราช",
  "Trang": "ตรัง",
  "Phatthalung": "พัทลุง",
  "Satun": "สตูล",
  "Songkhla": "สงขลา",
  "Pattani": "ปัตตานี",
  "Yala": "ยะลา",
  "Narathiwat": "นราธิวาส",
  "Bueng Kan": "บึงกาฬ"
};

// ✅ Move Region Logic Outside to be reusable
const PROVINCE_REGIONS = {
    'north': ['Chiang Rai', 'Nan', 'Phayao', 'Chiang Mai', 'Mae Hong Son', 'Phrae', 'Lampang', 'Lamphun', 'Uttaradit'],
    'central': ['Bangkok Metropolis', 'Phitsanulok', 'Sukhothai', 'Phetchabun', 'Phichit', 'Kamphaeng Phet', 'Nakhon Sawan', 'Lop Buri', 'Chai Nat', 'Uthai Thani', 'Sing Buri', 'Ang Thong', 'Saraburi', 'Phra Nakhon Si Ayutthaya', 'Suphan Buri', 'Nakhon Nayok', 'Pathum Thani', 'Nonthaburi', 'Nakhon Pathom', 'Samut Prakan', 'Samut Sakhon', 'Samut Songkhram'],
    'ne': ['Nong Khai', 'Nakhon Phanom', 'Sakon Nakhon', 'Udon Thani', 'Nong Bua Lam Phu', 'Loei', 'Mukdahan', 'Kalasin', 'Khon Kaen', 'Amnat Charoen', 'Yasothon', 'Roi Et', 'Maha Sarakham', 'Chaiyaphum', 'Nakhon Ratchasima', 'Buri Ram', 'Surin', 'Si Sa Ket', 'Ubon Ratchathani', 'Bueng Kan'],
    'east': ['Sa Kaeo', 'Prachin Buri', 'Chachoengsao', 'Chon Buri', 'Rayong', 'Chanthaburi', 'Trat'],
    'west': ['Tak', 'Kanchanaburi', 'Ratchaburi', 'Phetchaburi', 'Prachuap Khiri Khan'],
    'south': ['Chumphon', 'Ranong', 'Surat Thani', 'Nakhon Si Thammarat', 'Krabi', 'Phangnga', 'Phuket', 'Phatthalung', 'Trang', 'Pattani', 'Songkhla', 'Satun', 'Narathiwat', 'Yala']
};

const getRegion = (provinceName) => {
    for (const [region, provinces] of Object.entries(PROVINCE_REGIONS)) {
        if (provinces.includes(provinceName)) return region;
    }
    return 'central'; // Default
};

const AdminHighchartsMap = ({ provinceData, categories, onCategoryChange }) => {
    // const [topology, setTopology] = useState(null); // Removed
    const [metric, setMetric] = useState('sales'); 
    const [selectedProvinceData, setSelectedProvinceData] = useState(null); // ✅ Modal State
    const chartRef = useRef(null);

    // ✅ Calculate Best & Worst Provinces (Moved to top)
    const provinceStats = useMemo(() => {
        if (!provinceData || provinceData.length === 0) return { best: null, worst: null };

        const sorted = [...provinceData].sort((a, b) => {
            const valA = metric === 'sales' ? (a.value || 0) : (a.order_count || 0);
            const valB = metric === 'sales' ? (b.value || 0) : (b.order_count || 0);
            return valB - valA;
        });

        // Lowest non-zero if available, else zero.
        const nonZeroSorted = sorted.filter(p => (metric === 'sales' ? p.value : p.order_count) > 0);
        
        return {
            best: sorted[0],
            worst: nonZeroSorted.length > 0 ? nonZeroSorted[nonZeroSorted.length - 1] : sorted[sorted.length - 1]
        };
    }, [provinceData, metric]);

    // ✅ Prepare Highcharts Options
    const mapOptions = useMemo(() => {
        // if (!topology) return null; // Removed check

        const data = provinceData.map(item => {
            const provinceName = item.name || item.shipping_province;
            const engName = Object.keys(PROVINCE_MAPPING).find(key => PROVINCE_MAPPING[key] === provinceName);
            const region = getRegion(engName || provinceName);
            
            return {
                name: engName || provinceName, 
                thaiName: provinceName,        
                value: metric === 'sales' ? item.value : item.order_count, 
                displayValue: metric === 'sales' ? `฿${item.value.toLocaleString()}` : `${item.order_count} ออเดอร์`,
                topProduct: item.top_product,
                topProductsList: item.top_products_list || [], 
                region: region 
            };
        });

        return {
            chart: {
                map: thailandMap,
                backgroundColor: '#ffffff', 
                style: { fontFamily: 'Inter, sans-serif' },
                spacing: [10, 10, 10, 10]
            },
            title: { text: '' },
            credits: { enabled: false },
            mapNavigation: {
                enabled: true,
                buttonOptions: { 
                    verticalAlign: 'bottom',
                    align: 'right',
                    theme: {
                        fill: 'white',
                        states: { hover: { fill: '#f1f5f9' }, select: { fill: '#e2e8f0' } }
                    }
                }
            },
            // ✅ Categories Color Axis (โชว์สีตามช่วง)
            colorAxis: {
                dataClasses: [
                    { to: 0, color: '#e5e7eb', name: 'ไม่มียอดขาย' }, // Gray-200
                    { from: 1, to: 10000, color: '#86efac', name: 'น้อย (น้อยกว่า 10k)' }, // Light Green
                    { from: 10000, to: 50000, color: '#22c55e', name: 'ปานกลาง (10k-50k)' }, // Green
                    { from: 50000, to: 100000, color: '#0ea5e9', name: 'สูง (50k-100k)' }, // Sky Blue for contrast
                    { from: 100000, color: '#ef4444', name: 'สูงมาก (มากกว่า100k)' } // Red for Top Tier
                ]
            },
            legend: {
                enabled: true,
                title: { text: 'ระดับยอดขาย' },
                align: 'left',
                verticalAlign: 'bottom',
                layout: 'vertical',
                floating: true,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 8,
                itemStyle: { fontWeight: 'bold', color: '#4b5563' }
            },
            plotOptions: {
                series: {
                    point: {
                        events: {
                            click: function () {
                                setSelectedProvinceData(this.options); 
                            }
                        }
                    }
                }
            },
            tooltip: {
                 backgroundColor: 'rgba(255, 255, 255, 0.95)',
                 borderColor: '#e2e8f0',
                 borderWidth: 1,
                 borderRadius: 16,
                 padding: 0,
                 useHTML: true,
                 shadow: { offsetX: 0, offsetY: 10, width: 30, color: 'rgba(0,0,0,0.15)' },
                 formatter: function () {
                     // 1. Data Mapping (Handle Null Points)
                     const engName = this.point.name;
                     const thaiName = this.point.thaiName || PROVINCE_MAPPING[engName] || engName;
                     
                     // Data might be undefined for empty regions
                     const value = this.point.value || 0;
                     const displayValue = this.point.displayValue || (metric === 'sales' ? '฿0' : '0 ออเดอร์');
                     const topProduct = this.point.topProduct;

                     // 2. Determine Status & Color
                     let status = 'ยังไม่มียอดขาย';
                     let statusColor = '#9ca3af'; // Gray-400
                     let bgBadge = '#f3f4f6'; // Gray-100

                     if (metric === 'sales') {
                        if (value === 0) { 
                            status = 'ยังไม่มียอดขาย'; 
                            statusColor = '#6b7280'; 
                            bgBadge = '#f3f4f6'; 
                        }
                        else if (value < 10000) { status = 'ยอดขายน้อย'; statusColor = '#15803d'; bgBadge = '#dcfce7'; }
                        else if (value < 50000) { status = 'ยอดขายปานกลาง'; statusColor = '#15803d'; bgBadge = '#bbf7d0'; }
                        else if (value < 100000) { status = 'ยอดขายสูง'; statusColor = '#047857'; bgBadge = '#86efac'; }
                        else { status = 'ยอดขายสูงมาก (Top Tier)'; statusColor = '#ffffff'; bgBadge = '#16a34a'; }
                     } else {
                        // Order Logic
                        status = value === 0 ? 'ยังไม่มีออเดอร์' : `${value} ออเดอร์`;
                     }

                     const badgeStyle =  value >= 100000 && metric === 'sales'
                        ? `background: linear-gradient(135deg, #16a34a 0%, #14532d 100%); color: white;`
                        : `background: ${bgBadge}; color: ${statusColor};`;

                     return `
                         <div style="font-family: 'Inter', sans-serif; min-width: 240px; overflow: hidden; border-radius: 16px;">
                             <div style="background: #1a4d2e; padding: 16px; position: relative; overflow: hidden;">
                                 <div style="position: absolute; top: -10px; right: -10px; opacity: 0.1;">
                                     <svg width="60" height="60" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                                 </div>
                                 <h4 style="margin: 0; color: white; font-size: 18px; font-weight: 800;">${thaiName}</h4>
                                 <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.8); font-size: 11px;">${this.point.region ? 'ภาค' + this.point.region : ''}</p>
                             </div>
                             
                             <div style="padding: 20px; background: white;">
                                 
                                 <div style="text-align: center; margin-bottom: 20px;">
                                     <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 8px; ${badgeStyle}">
                                         ${status}
                                     </div>
                                     <div style="font-size: 28px; font-weight: 900; color: #1a4d2e; letter-spacing: -0.5px;">
                                         ${displayValue}
                                     </div>
                                 </div>

                                 ${topProduct ? `
                                     <div style="background: #f8fafc; border-radius: 12px; padding: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px;">
                                         <div style="width: 40px; height: 40px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                                             🏆
                                         </div>
                                         <div style="flex: 1;">
                                             <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">สินค้าขายดี</div>
                                             <div style="font-size: 12px; font-weight: 700; color: #334155; line-height: 1.4;">${topProduct.name || topProduct}</div>
                                         </div>
                                     </div>
                                 ` : `
                                     <div style="text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
                                         ไม่มีข้อมูลสินค้าขายดี
                                     </div>
                                 `}
                             </div>
                             
                             <div style="background: #f1f5f9; padding: 10px; text-align: center; font-size: 10px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0;">
                                 คลิกเพื่อดูรายละเอียดเพิ่มเติม
                             </div>
                         </div>
                     `;
                 }
            },
            series: [{
                data: data,
                mapData: thailandMap, 
                joinBy: ['name', 'name'], 
                name: metric === 'sales' ? 'ยอดขายรวม' : 'จำนวนออเดอร์รวม',
                states: { 
                    hover: { 
                        brightness: 0.1, 
                        borderColor: '#1a4d2e', 
                        borderWidth: 2
                    },
                    normal: {
                        animation: true
                    }
                },
                dataLabels: {
                    enabled: false, // ✅ Hide labels as requested (show on hover only)
                },
                borderColor: '#cbd5e1', // Stronger border
                borderWidth: 1,
                nullColor: '#f8fafc', 
                nullInteraction: true, 
                allAreas: true
            }]
        };
    }, [provinceData, metric]); 

    const [zoomedProvince, setZoomedProvince] = useState(null);

    // ✅ Zoom logic with Toggle
    const handleZoomToProvince = (provinceName) => {
        const chart = chartRef.current?.chart;
        if (!chart || !provinceName) return;

        // Toggle Off
        if (zoomedProvince === provinceName) {
            chart.mapZoom(); // Reset Zoom
            setZoomedProvince(null);
            return;
        }

        // Toggle On
        const point = chart.series[0].points.find(p => p.name === provinceName || p.thaiName === provinceName);
        if (point) {
            point.zoomTo();
            setZoomedProvince(provinceName);
        }
    };

    // Loading check removed


    return (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 h-full flex flex-col relative">
            {/* Header ... -> Keep same */} 
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
                <div>
                     <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                        <MapPin className="text-[#1a4d2e]" size={24} />
                        แผนที่{metric === 'sales' ? 'ยอดขาย' : 'ออเดอร์'}รายจังหวัด
                        <span className="text-[10px] bg-green-100 text-[#1a4d2e] px-2 py-1 rounded-lg">Highcharts</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">แสดงข้อมูล{metric === 'sales' ? 'ยอดขาย (บาท)' : 'จำนวนออเดอร์ (ครั้ง)'} แยกตามพื้นที่</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl items-center gap-1">
                    {/* ✅ Category Filter */}
                    <div className="relative group">
                        <select 
                            className="appearance-none bg-white text-[10px] font-black text-gray-700 py-1.5 pl-3 pr-8 rounded-xl border-none outline-none focus:ring-0 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                            onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
                            defaultValue="all"
                        >
                            <option value="all">ทุกหมวดหมู่</option>
                            {categories && categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                           <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                    
                    <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                    
                    <div className="w-[1px] h-8 bg-gray-200 mx-2"></div>
                    
                    <div className="flex bg-gray-100/50 p-1 rounded-xl gap-2">
                        <button 
                            onClick={() => setMetric('sales')} 
                            className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all border ${metric === 'sales' ? 'bg-white border-green-100 shadow-sm text-[#1a4d2e]' : 'border-transparent text-gray-400 hover:bg-white/50'}`}
                        >
                            <span className="text-sm font-black mb-0.5">฿</span>
                            <span className="text-[9px] font-bold uppercase">ยอดขาย</span>
                        </button>
                        <button 
                            onClick={() => setMetric('orders')} 
                            className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all border ${metric === 'orders' ? 'bg-white border-green-100 shadow-sm text-[#1a4d2e]' : 'border-transparent text-gray-400 hover:bg-white/50'}`}
                        >
                            <span className="text-sm font-black mb-0.5">📦</span>
                            <span className="text-[9px] font-bold uppercase">ออเดอร์</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-6">
                {/* Map Area */}
                <div className="flex-1 min-h-[400px] lg:min-h-[500px] rounded-2xl overflow-hidden relative z-0 border border-gray-100">
                    <HighchartsReact
                        highcharts={Highcharts}
                        constructorType={'mapChart'}
                        options={{
                            ...mapOptions,
                            exporting: { 
                                enabled: true,
                                // Localize Menu Items
                                menuItemDefinitions: {
                                    downloadPNG: { text: 'ดาวน์โหลด PNG' },
                                    downloadJPEG: { text: 'ดาวน์โหลด JPEG' },
                                    downloadSVG: { text: 'ดาวน์โหลด SVG' },
                                    printChart: { text: 'พิมพ์แผนภูมิ' },
                                    viewFullscreen: { text: 'ดูเต็มหน้าจอ' }
                                },
                                buttons: {
                                    contextButton: {
                                        menuItems: [
                                            'viewFullscreen',
                                            'printChart',
                                            'separator',
                                            'downloadPNG',
                                            'downloadJPEG'
                                        ]
                                    }
                                }
                            }
                        }}
                        ref={chartRef}
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                         {/* Hints if needed */}
                    </div>
                </div>

                 {/* Top/Worst Panel - Keep same */}
                 <div className="w-full lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-4 flex flex-col gap-4">
                     <div 
                        onClick={() => provinceStats.best && handleZoomToProvince(provinceStats.best.name)}
                        className="bg-green-50 rounded-2xl p-4 border border-green-100 cursor-pointer transition-transform hover:scale-105 hover:shadow-md group"
                     >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🏆</span>
                            <h4 className="font-bold text-[#1a4d2e] text-[10px] uppercase tracking-wide group-hover:underline">มากที่สุด</h4>
                        </div>
                        {provinceStats.best ? (
                            <div>
                                <h5 className="font-black text-gray-800 text-sm truncate">{provinceStats.best.name}</h5>
                                <p className="text-[10px] text-gray-500 truncate mb-1">{provinceStats.best.top_product}</p>
                                <span className="block font-black text-[#1a4d2e] text-lg">
                                    {metric === 'sales' ? `฿${(provinceStats.best.value || 0).toLocaleString()}` : provinceStats.best.order_count || 0}
                                </span>
                            </div>
                        ) : <p className="text-xs text-gray-400">ไม่มีข้อมูล</p>}
                     </div>

                     <div 
                        onClick={() => provinceStats.worst && handleZoomToProvince(provinceStats.worst.name)}
                        className="bg-red-50 rounded-2xl p-4 border border-red-100 cursor-pointer transition-transform hover:scale-105 hover:shadow-md group"
                     >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">📉</span>
                            <h4 className="font-bold text-red-800 text-[10px] uppercase tracking-wide group-hover:underline">น้อยที่สุด</h4>
                        </div>
                        {provinceStats.worst ? (
                            <div>
                                <h5 className="font-black text-gray-800 text-sm truncate">{provinceStats.worst.name}</h5>
                                <p className="text-[10px] text-gray-500 truncate mb-1">{provinceStats.worst.top_product || '-'}</p>
                                <span className="block font-black text-red-600 text-lg">
                                    {metric === 'sales' ? `฿${(provinceStats.worst.value || 0).toLocaleString()}` : provinceStats.worst.order_count || 0}
                                </span>
                            </div>
                        ) : <p className="text-xs text-gray-400">ไม่มีข้อมูล</p>}
                     </div>
                </div>
            </div>

            {/* ✅ Product Breakdown Modal */}
            {selectedProvinceData && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-[2.5rem]">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 w-[320px] animate-fade-in-up border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">จังหวัด</span>
                                <h3 className="text-xl font-black text-gray-800">{selectedProvinceData.thaiName}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedProvinceData(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-4">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500">🏆 5 สินค้าขายดี</span>
                             </div>
                             <div className="space-y-2">
                                {selectedProvinceData.topProductsList && selectedProvinceData.topProductsList.length > 0 ? (
                                    selectedProvinceData.topProductsList.map((prod, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${idx === 0 ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                                                    {idx + 1}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 truncate">{prod.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                                {prod.qty} ชิ้น
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-xs text-gray-400">ไม่มีข้อมูลสินค้า</div>
                                )}
                             </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500">ยอดรวมทั้งหมด</span>
                            <span className="text-lg font-black text-[#1a4d2e]">{selectedProvinceData.displayValue}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHighchartsMap;
