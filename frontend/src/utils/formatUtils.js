// ✅ จัดการรูปแบบเงินไทย (Rule 22, 59)
export const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0
    }).format(price || 0);
};

// ✅ วันที่ไทยแบบอ่านง่าย (Rule 9, 58)
export const formatDate = (dateString) => {
    if (!dateString) return 'ไม่ระบุวันที่';
    return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export const getImageUrl = (path) => {
    const API_BASE_URL = "http://localhost:8000";
    // เปลี่ยนจาก via.placeholder.com เป็น placehold.co
    if (!path) return "https://placehold.co/500x500?text=No+Image"; 
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
};