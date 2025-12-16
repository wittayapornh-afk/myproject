import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // ใช้ localStorage อย่างระมัดระวัง
  const [token, setToken] = useState(() => localStorage.getItem('token')); 
  const [loading, setLoading] = useState(true);

  const fetchUser = async (authToken) => {
    try {
        const res = await fetch('/api/profile/', {
            headers: { 
                'Authorization': `Token ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            setUser(data); 
        } else {
            // Token หมดอายุหรือ Invalid -> เคลียร์ทิ้ง
            console.error("Token invalid, logging out...");
            logout();
        }
    } catch (error) {
        console.error("Failed to fetch user:", error);
        // กรณี Network Error อาจจะไม่ Logout ทันที แต่แจ้งเตือน
        // แต่เพื่อความปลอดภัยในเคสนี้ ให้ Logout ไปก่อน
        logout();
    } finally {
        setLoading(false); // ✅ จบการโหลดเสมอ ไม่ว่าจะสำเร็จหรือไม่
    }
  };

  useEffect(() => {
    if (token) {
        fetchUser(token);
    } else {
        setLoading(false); // ถ้าไม่มี Token ก็ไม่ต้องโหลดอะไร
    }
  }, [token]);

  const login = (newToken) => {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      // fetchUser จะทำงานเองผ่าน useEffect เมื่อ token เปลี่ยน
  };
  
  const logout = () => {
      // เรียก API Logout ฝั่ง Server ด้วย (Optional แต่แนะนำ)
      fetch('/api/logout/', {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}` }
      }).catch(err => console.warn("Logout server error", err));

      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children} {/* ✅ ป้องกันการ render App ก่อนเช็ค User เสร็จ */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);