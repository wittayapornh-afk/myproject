import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { THAI_PROVINCES } from '../data/ThaiProvinces';
import { TrendingUp, MapPin } from 'lucide-react';

// ส่วนประกอบแสดงแผนที่ในรูปแบบ Grid (Heatmap Grid)
// ในงานจริงอาจใช้ react-simple-maps หรือ SVG Path ของแผนที่ประเทศไทย
// แต่ในที่นี้เราใช้ Grid เพื่อความง่ายและรองรับการตอบสนอง (Responsive) ได้ดี
const ThaiMapSVG = ({ provinceData, onProvinceClick, selectedProvince }) => {
    
    // คำนวณค่าสูงสุดเพื่อใช้ทำ Color Scale (ความเข้มสี)
    const maxVal = Math.max(...provinceData.map(d => d.value), 1);
    
    // ฟังก์ชันคำนวณสีตามยอดขาย
    const getColor = (val) => {
        if (!val) return '#f3f4f6'; // สีเทาอ่อน (ไม่มีข้อมูล)
        const intensity = Math.min((val / maxVal) * 0.8 + 0.2, 1); // Opacity ต่ำสุด 0.2
        return `rgba(26, 77, 46, ${intensity})`; // สีเขียวหลักของแบรนด์ (#1a4d2e)
    };

    return (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            {THAI_PROVINCES.map(province => {
                // ค้นหาข้อมูลยอดขายของจังหวัดนั้นๆ
                const data = provinceData.find(d => d.name === province) || { value: 0 };
                const isSelected = selectedProvince === province;
                
                return (
                    <div 
                        key={province}
                        onClick={() => onProvinceClick(province)}
                        className={`
                            relative aspect-square flex items-center justify-center p-2 rounded-2xl text-center cursor-pointer transition-all duration-300
                            ${isSelected 
                                ? 'ring-4 ring-[#1a4d2e] ring-offset-2 scale-110 z-20 shadow-xl bg-[#1a4d2e] text-white' 
                                : 'hover:scale-105 hover:shadow-lg hover:z-10 bg-opacity-90'
                            }
                        `}
                        style={{ backgroundColor: isSelected ? undefined : getColor(data.value) }}
                    >
                        <div className="space-y-1 z-10 w-full">
                            <span className={`text-[10px] font-bold block truncate w-full px-1 ${isSelected || data.value > maxVal/2 ? 'text-white' : 'text-gray-700'}`}>
                                {province}
                            </span>
                            {/* แสดงตัวเลขยอดขายใน Grid เฉพาะที่มีค่า */}
                            {data.value > 0 && (
                                <div className={`text-[9px] font-black ${isSelected || data.value > maxVal/2 ? 'text-white/90' : 'text-[#1a4d2e]'}`}>
                                    ฿{(data.value/1000).toFixed(1)}k
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// กราฟแสดง 5 อันดับจังหวัดขายดี (Top 5 Provinces Chart)
const TopProvincesChart = ({ data }) => {
    // เรียงลำดับและตัดมาเฉพาะ 5 อันดับแรก
    const top5 = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                <span className="text-xl">🏆</span> 5 อันดับจังหวัดขายดีสูงสุด
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={top5} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            tick={{fontSize: 12, fontWeight: 'bold', fill: '#4b5563'}} 
                            width={100}
                        />
                        <Tooltip 
                            cursor={{fill: '#f9fafb'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            formatter={(val) => `฿${val.toLocaleString()}`}
                        />
                        <Bar dataKey="value" fill="#1a4d2e" radius={[0, 10, 10, 0]} barSize={24}>
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AdminMapDashboard = ({ salesData, provinceData }) => {
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [provinceDetail, setProvinceDetail] = useState(null);

    // รวมข้อมูลจาก Backend เข้ากับรายชื่อจังหวัดทั้งหมด เพื่อให้ครบทุกจังหวัด
    const fullProvinceData = THAI_PROVINCES.map(p => {
        const found = provinceData.find(d => d.name === p);
        return found || { name: p, value: 0, top_product: '-' };
    });

    // ฟังก์ชันเมื่อคลิกเลือกจังหวัด
    const handleProvinceClick = (provinceName) => {
        const data = fullProvinceData.find(d => d.name === provinceName);
        setSelectedProvince(provinceName);
        setProvinceDetail(data);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ซ้าย: ส่วนแสดงแผนที่ (Map Visualization) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                    <div>
                        <h3 className="font-black text-xl text-gray-800 flex items-center gap-2">
                            🗺️ แผนที่ยอดขายรายจังหวัด
                            <span className="text-xs bg-green-100 text-[#1a4d2e] px-2 py-1 rounded-lg animate-pulse">Real-time</span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">แสดงความหนาแน่นของยอดขายตามพื้นที่</p>
                    </div>
                    
                    {/* ตัวกรองจังหวัด (Filter) */}
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                        <span className="text-xl">🔍</span>
                        <select 
                            value={selectedProvince || ''} 
                            onChange={(e) => handleProvinceClick(e.target.value)}
                            className="bg-transparent border-0 text-sm font-bold text-gray-700 outline-none cursor-pointer w-32 md:w-48"
                        >
                            <option value="">เลือกจังหวัด...</option>
                            {THAI_PROVINCES.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                {/* Component แผนที่ Grid */}
                <ThaiMapSVG 
                    provinceData={fullProvinceData} 
                    onProvinceClick={handleProvinceClick}
                    selectedProvince={selectedProvince}
                />

                {/* ส่วนกราฟแสดงอันดับจังหวัด (เพิ่มใหม่ตามคำขอ) */}
                <TopProvincesChart data={fullProvinceData} />
            </div>

            {/* ขวา: รายละเอียดเจาะลึก (Detail Card) */}
            <div className="space-y-4">
                <h3 className="font-black text-xl text-gray-800 pl-2 border-l-4 border-[#1a4d2e]">📊 เจาะลึกข้อมูล</h3>
                
                <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative ${selectedProvince ? 'bg-white border-gray-100 shadow-2xl scale-100 opacity-100' : 'bg-gray-50 border-dashed border-gray-300 flex items-center justify-center h-[400px] opacity-70'}`}>
                    
                    {selectedProvince && provinceDetail ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* ส่วนหัวแสดงชื่อจังหวัดและความสำคัญ */}
                            <div className="text-center relative">
                                <div className="absolute top-0 right-0 p-2 bg-green-50 rounded-full text-[#1a4d2e]">
                                    <TrendingUp size={16} />
                                </div>
                                <span className="inline-block p-4 bg-green-50 rounded-2xl mb-4 text-3xl shadow-sm border border-green-100">📍</span>
                                <h2 className="text-3xl font-black text-gray-800 tracking-tight">{provinceDetail.name}</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">ยอดขายสะสมทั้งหมด</p>
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
                                        <span className="text-lg">🏆</span> Best Seller
                                    </p>
                                    <p className="font-black text-gray-800 text-xl leading-tight line-clamp-2">
                                        {provinceDetail.top_product}
                                    </p>
                                    <p className="text-xs text-orange-700/70 mt-2 font-bold">สินค้าที่มียอดขายสูงสุดในพื้นที่</p>
                                </div>

                                {/* กราฟจำลองแนวโน้ม (Simulation) */}
                                <div className="h-40 w-full bg-white p-4 rounded-3xl border border-gray-100">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-xs font-bold text-gray-400">Trend (Last 4 Weeks)</p>
                                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">+12%</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'W1', val: Math.max(provinceDetail.value * 0.2, 1000) },
                                            { name: 'W2', val: Math.max(provinceDetail.value * 0.35, 1500) },
                                            { name: 'W3', val: Math.max(provinceDetail.value * 0.15, 800) },
                                            { name: 'W4', val: Math.max(provinceDetail.value * 0.3, 1200) }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                            <Tooltip 
                                                cursor={{fill: '#f0fdf4'}}
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}}
                                                formatter={(val) => `฿${val.toLocaleString()}`}
                                            />
                                            <Bar dataKey="val" fill="#1a4d2e" radius={[6, 6, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-300 py-12">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <span className="text-4xl opacity-50">�</span>
                            </div>
                            <p className="font-black text-gray-400 text-lg">เลือกจังหวัด</p>
                            <p className="text-xs mt-1">เพื่อดูข้อมูลเชิงลึกรายพื้นที่</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMapDashboard;
