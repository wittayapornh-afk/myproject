import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // ✅ Init user from localStorage if available (Persist Login)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [lastApiStatus, setLastApiStatus] = useState(null); // 🔍 Debug

    // ✅ Rule: Backend Port 8000
    const API_BASE_URL = "http://localhost:8000";

    const getToken = () => localStorage.getItem('token');

    const fetchUser = async (tokenOverride) => {
        const token = tokenOverride || getToken();

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile/?_=${new Date().getTime()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
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
                // ✅ Rule: Only logout if token is explicitly invalid (401)
                if (response.status === 401) {
                    console.error("Session expired (401). Logging out.");
                    logout(); 
                } else {
                    console.warn(`Failed to fetch profile (Status: ${response.status}). Keeping session.`);
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
        // If we already have user (from localStorage), loading can be false initially?
        // Better to still fetch to validate token, but we are not "loading" in the sense of "unknown state"
        // But for safety, keep loading true until first fetch check is done, OR rely on staled data.
        // User wants "Stay logged in", so reusing localStorage is best.
        fetchUser();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        if (userData) {
            const userRole = userData.role_code || userData.role;
            if (userRole) userData.role = userRole.toLowerCase();
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData)); // ✅ Cache user
        } else {
            fetchUser(token);
        }
    };

    // ✅ Rule: Clear ข้อมูลให้เกลี้ยงตอน Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // ✅ Clear cached user
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, token: getToken(), lastApiStatus }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);