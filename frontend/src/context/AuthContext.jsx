import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

// 🔒 Hybrid Storage Strategy
// User ทั่วไป → sessionStorage (ปลอดภัย, ปิดแท็บ = logout)
// Admin/Seller → localStorage (สะดวก, ข้ามแท็บได้)
const getStorage = (user = null) => {
    // ถ้ายังไม่มี user ให้ลองดูทั้ง 2 ที่
    if (!user) {
        // Check localStorage first (for admin persistence)
        const localUser = localStorage.getItem('user');
        if (localUser) {
            try {
                const userData = JSON.parse(localUser);
                const role = (userData.role || userData.role_code || '').toLowerCase();
                if (['admin', 'super_admin', 'seller'].includes(role)) {
                    return localStorage;
                }
            } catch (e) {}
        }
        // Check sessionStorage (for regular users)
        return sessionStorage.getItem('token') ? sessionStorage : localStorage;
    }
    
    // ถ้ามี user แล้ว เช็ค role
    const role = (user.role || user.role_code || '').toLowerCase();
    return ['admin', 'super_admin', 'seller'].includes(role) 
        ? localStorage 
        : sessionStorage;
};

export const AuthProvider = ({ children }) => {
    // ✅ Init user from storage (ลองทั้ง localStorage และ sessionStorage)
    const [user, setUser] = useState(() => {
        const localUser = localStorage.getItem('user');
        const sessionUser = sessionStorage.getItem('user');
        const savedUser = localUser || sessionUser;
        return savedUser ? JSON.parse(savedUser) : null;
    });
    // ✅ Init token from storage
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    });
    
    // ✅ Optimistic Loading: If we have a cached user, don't block UI (loading=false)
    // Only block if we have a token but NO user (first load after clear cache or weird state)
    const [loading, setLoading] = useState(() => {
        const hasToken = !!localStorage.getItem('token');
        const hasUser = !!localStorage.getItem('user');
        return hasToken && !hasUser; 
    });

    const [lastApiStatus, setLastApiStatus] = useState(null); // 🔍 Debug

    // ✅ Rule: Backend Port 8000
    // const API_BASE_URL = "http://localhost:8000"; // Moved to config.js

    // const getToken = () => localStorage.getItem('token'); // ❌ Deprecated

    const fetchUser = async (tokenOverride) => {

        const currentToken = tokenOverride || token || 
            localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!currentToken) {
            // ✅ Fix: Don't auto-clear session here.
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile/?_=${new Date().getTime()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${currentToken}`,
                    'Content-Type': 'application/json',
                },
            });

            setLastApiStatus(response.status); // 🔍 Save status

            if (response.ok) {
                const userData = await response.json();

                // ✅ Rule: Backend may return role (display) and role_code (value)
                const userRole = userData.role_code || userData.role;
                if (userRole) userData.role = userRole.toLowerCase();

                setUser(userData);
                // ✅ Save to appropriate storage
                const storage = getStorage(userData);
                storage.setItem('user', JSON.stringify(userData));
            } else {
                // ✅ Immune/Immortal Session: Even if 401, keep the local user.
                // Only logout if explicit "LogOut" action is taken.
                // This allows offline usage or seamless browsing if token expired but data is there.
                console.warn(`Profile sync failed (${response.status}). Keepin' session alive.`);
                if (!user) {
                     // Try to recover from both storages
                     const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
                     if (saved) setUser(JSON.parse(saved));
                }
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setLastApiStatus("Network Error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = (newToken, userData) => {
        setToken(newToken);
        
        if (userData) {
            const userRole = userData.role_code || userData.role;
            if (userRole) userData.role = userRole.toLowerCase();
            setUser(userData);
            
            // 🔒 เลือก storage ตาม role
            const storage = getStorage(userData);
            storage.setItem('token', newToken);
            storage.setItem('user', JSON.stringify(userData));
            
            // 📢 แจ้ง user ว่าใช้ storage แบบไหน
            const storageType = storage === sessionStorage ? 'Session (ปิดแท็บ = logout)' : 'Persistent (ข้ามแท็บได้)';
            console.log(`🔐 Storage Mode: ${storageType}`);
        } else {
            // ถ้าไม่มี userData ให้เก็บใน localStorage ก่อน แล้วค่อย fetch
            localStorage.setItem('token', newToken);
            fetchUser(newToken);
        }
    };

    // ✅ Rule: Clear ข้อมูลให้เกลี้ยงตอน Logout (ทั้ง 2 storage)
    const logout = () => {
        setToken(null);
        setUser(null);
        
        // ลบจากทั้ง localStorage และ sessionStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, token, lastApiStatus }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);