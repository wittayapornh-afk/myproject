import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, AlertTriangle, DollarSign, Activity, PieChart } from 'lucide-react';
import { formatPrice } from '../utils/formatUtils';

const ImpactSimulator = ({ couponData }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    // Debounce simulation to avoid too many requests
    useEffect(() => {
        const timer = setTimeout(() => {
            if (couponData.discount_value > 0 || couponData.discount_type === 'free_shipping') {
                fetchSimulation();
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [couponData]);

    const fetchSimulation = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            // Ensure payload matches backend expectations
            const payload = {
                discount_type: couponData.discount_type,
                discount_value: couponData.discount_value,
                usage_limit: couponData.usage_limit,
                min_spend: couponData.min_spend,
                max_discount_amount: couponData.max_discount_amount
            };
            
            const res = await axios.post('http://localhost:8000/api/admin/coupons/simulate/', payload, {
                headers: { Authorization: `Token ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error("Simulation failed:", err);
            setError("ไม่สามารถจำลองข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    if (!stats && !loading) return null;

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Activity size={18} />
                </div>
                <h3 className="font-bold text-gray-800">Financial Impact Simulation</h3>
                {loading && <span className="text-xs text-gray-400 animate-pulse ml-2">Calculating...</span>}
            </div>

            {error ? (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={16} /> {error}
                </div>
            ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Max Liability */}
                    <div className={`p-4 rounded-xl border ${stats.max_liability > 10000 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                             <AlertTriangle size={12} /> Max Budget Liability
                        </div>
                        <div className={`text-xl font-black ${stats.max_liability > 10000 ? 'text-red-600' : 'text-gray-800'}`}>
                            {formatPrice(stats.max_liability)}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">งบประมาณสูงสุดที่ต้องจ่าย</div>
                    </div>

                    {/* 2. Potential Reach */}
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                             <Users size={12} /> Potential Reach
                        </div>
                        <div className="text-xl font-black text-blue-700">
                            {stats.potential_reach.toLocaleString()} <span className="text-sm font-medium">Users</span>
                        </div>
                        <div className="text-[10px] text-blue-400 mt-1">ลูกค้าที่อาจได้รับสิทธิ์</div>
                    </div>

                    {/* 3. Estimated Revenue */}
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                        <div className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                             <DollarSign size={12} /> Est. Min Revenue
                        </div>
                        <div className="text-xl font-black text-green-700">
                            {formatPrice(stats.est_revenue)}
                        </div>
                        <div className="text-[10px] text-green-500 mt-1">รายรับขั้นต่ำที่คาดการณ์</div>
                    </div>

                    {/* 4. Breakeven / ROI */}
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                             <TrendingUp size={12} /> Est. ROAS
                        </div>
                        <div className="text-xl font-black text-purple-700">
                            {stats.break_even_roas}x
                        </div>
                        <div className="text-[10px] text-purple-500 mt-1">ผลตอบแทนต่อค่าใช้จ่าย</div>
                    </div>
                </div>
            ) : null}
            
            <div className="mt-4 text-[10px] text-gray-300 text-right">
                *ตัวเลขเป็นการประมาณการณ์จากข้อมูลในอดีต (Past Order Data)
            </div>
        </div>
    );
};

export default ImpactSimulator;
