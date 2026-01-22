import React from 'react';
import { LayoutList, Calendar, FolderKanban } from 'lucide-react';

/**
 * 🔄 ViewToggle Component
 * 
 * สลับระหว่างมุมมองต่าง ๆ:
 * - List: รายการแบบเดิม (ตาราง)
 * - Timeline: แถบเวลา 24 ชม.
 * - Campaigns: กลุ่มแคมเปญ
 */
const ViewToggle = ({ activeView, onViewChange }) => {
    const views = [
        { 
            id: 'list', 
            label: 'รายการ', 
            icon: LayoutList,
            color: 'blue'
        },
        { 
            id: 'calendar', 
            label: 'ปฏิทิน (Calendar)', 
            icon: Calendar,
            color: 'orange'
        },
        { 
            id: 'campaigns', 
            label: 'Campaigns', 
            icon: FolderKanban,
            color: 'purple'
        }
    ];

    return (
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl w-fit">
            {views.map(({ id, label, icon: Icon, color }) => {
                const isActive = activeView === id;
                
                return (
                    <button
                        key={id}
                        onClick={() => onViewChange(id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm
                            transition-all duration-300
                            ${isActive 
                                ? `bg-${color}-600 text-white shadow-lg shadow-${color}-200` 
                                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Icon size={18} strokeWidth={2.5} />
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ViewToggle;
