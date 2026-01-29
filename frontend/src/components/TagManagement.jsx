import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TagManagement.css';

/**
 * 🏷️ TagManagement Component
 * 
 * หน้าจัดการ Tags สำหรับ Admin
 * 
 * ฟีเจอร์:
 * - แสดงรายการ Tags ทั้งหมด
 * - สร้าง Tag ใหม่
 * - ลบ Tag ที่ไม่ใช้แล้ว
 * - แสดงจำนวนสินค้าที่ใช้แต่ละ Tag
 */
function TagManagement() {
  // ==========================================
  // 📊 State Management
  // ==========================================
  const [tags, setTags] = useState([]);  // รายการ Tags ทั้งหมด
  const [newTagName, setNewTagName] = useState('');  // ชื่อ Tag ใหม่ที่กำลังจะสร้าง
  const [loading, setLoading] = useState(false);  // สถานะการโหลดข้อมูล
  const [error, setError] = useState('');  // ข้อความ Error

  // ==========================================
  // 🔄 Fetch Tags - ดึงรายการ Tags จาก API
  // ==========================================
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/tags/');
      setTags(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('ไม่สามารถโหลดรายการ Tags ได้');
    } finally {
      setLoading(false);
    }
  };

  // ⚡ โหลด Tags เมื่อ Component ถูก mount
  useEffect(() => {
    fetchTags();
  }, []);

  // ==========================================
  // ➕ Create Tag - สร้าง Tag ใหม่
  // ==========================================
  const handleCreateTag = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่ากรอกชื่อหรือยัง
    if (!newTagName.trim()) {
      setError('กรุณาระบุชื่อ Tag');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // เรียก API สร้าง Tag
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/tags/',
        { name: newTagName.trim() },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      // ✅ สร้างสำเร็จ
      setNewTagName('');  // ล้างฟอร์ม
      fetchTags();  // โหลด Tags ใหม่
      alert(`สร้าง Tag "${newTagName}" สำเร็จ!`);
    } catch (err) {
      console.error('Error creating tag:', err);
      setError(err.response?.data?.error || 'ไม่สามารถสร้าง Tag ได้');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🗑️ Delete Tag - ลบ Tag
  // ==========================================
  const handleDeleteTag = async (tag) => {
    // ยืนยันก่อนลบ
    if (!window.confirm(`ต้องการลบ Tag "${tag.name}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // เรียก API ลบ Tag
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/api/tags/${tag.id}/`,
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      // ✅ ลบสำเร็จ
      fetchTags();  // โหลด Tags ใหม่
      alert(`ลบ Tag "${tag.name}" สำเร็จ!`);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError(err.response?.data?.error || 'ไม่สามารถลบ Tag ได้');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 🎨 Render UI
  // ==========================================
  return (
    <div className="tag-management-container">
      {/* Header */}
      <div className="tag-header">
        <h1>🏷️ จัดการ Tags</h1>
        <p className="subtitle">สร้างและจัดการ Tags สำหรับจัดหมวดหมู่สินค้า</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Create Tag Form */}
      <div className="create-tag-section">
        <h2>สร้าง Tag ใหม่</h2>
        <form onSubmit={handleCreateTag} className="tag-form">
          <input
            type="text"
            placeholder="ชื่อ Tag (เช่น Hot, Sale, NewArrival)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="tag-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="btn-create-tag"
            disabled={loading || !newTagName.trim()}
          >
            {loading ? '⏳ กำลังสร้าง...' : '➕ เพิ่ม Tag'}
          </button>
        </form>
      </div>

      {/* Tags List */}
      <div className="tags-list-section">
        <h2>รายการ Tags ({tags.length})</h2>
        
{loading && tags.length === 0 ? (
          <div className="loading-state">⏳ กำลังโหลด...</div>
        ) : tags.length === 0 ? (
          <div className="empty-state">
            📦 ยังไม่มี Tags<br />
            <small>เริ่มต้นด้วยการสร้าง Tag แรกของคุณ</small>
          </div>
        ) : (
          <div className="tags-grid">
            {tags.map((tag) => (
              <div key={tag.id} className="tag-card">
                <div className="tag-info">
                  <span className="tag-badge">#{tag.name}</span>
                  <span className="tag-count">
                    {tag.product_count} สินค้า
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTag(tag)}
                  className="btn-delete-tag"
                  disabled={loading}
                  title="ลบ Tag"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <div className="usage-guide">
        <h3>💡 คำแนะนำการใช้งาน</h3>
        <ul>
          <li><strong>Tag ที่แนะนำ:</strong> Hot, Sale, NewArrival, BestSeller, FreeShipping</li>
          <li><strong>Tag ตามแบรนด์:</strong> Apple, Samsung, Sony, Nike, Adidas</li>
          <li><strong>Tag สำหรับแคมเปญ:</strong> ValentineSale, BlackFriday, Clearance</li>
        </ul>
      </div>
    </div>
  );
}

export default TagManagement;
