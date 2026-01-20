import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // ✅ Init user from localStorage if available (Persist Login)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    // ✅ Init token from localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    
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

        const currentToken = tokenOverride || token || localStorage.getItem('token');

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
                localStorage.setItem('user', JSON.stringify(userData)); // ✅ Save up-to-date user
            } else {
                // ✅ Immune/Immortal Session: Even if 401, keep the local user.
                // Only logout if explicit "LogOut" action is taken.
                // This allows offline usage or seamless browsing if token expired but data is there.
                console.warn(`Profile sync failed (${response.status}). Keepin' session alive.`);
                if (!user) {
                     // Try to recover from localStorage again just in case
                     const saved = localStorage.getItem('user');
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
        localStorage.setItem('token', newToken);

        if (userData) {
            const userRole = userData.role_code || userData.role;
            if (userRole) userData.role = userRole.toLowerCase();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData)); // ✅ Cache user
        } else {
            fetchUser(newToken);
        }
    };

    // ✅ Rule: Clear ข้อมูลให้เกลี้ยงตอน Logout
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // ✅ Clear cached user
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, token, lastApiStatus }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);