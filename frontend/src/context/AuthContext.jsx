import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // ✅ Init user from localStorage if available (Persist Login)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    // ✅ Init token from localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));
<<<<<<< HEAD
    
=======

>>>>>>> origin/main
    // If token exists, start loading. If not, no need to load.
    const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));
    const [lastApiStatus, setLastApiStatus] = useState(null); // 🔍 Debug

    // ✅ Rule: Backend Port 8000
    const API_BASE_URL = "http://localhost:8000";

    // const getToken = () => localStorage.getItem('token'); // ❌ Deprecated

    const fetchUser = async (tokenOverride) => {
<<<<<<< HEAD
        const currentToken = tokenOverride || token || localStorage.getItem('token'); 
=======
        const currentToken = tokenOverride || token || localStorage.getItem('token');
>>>>>>> origin/main

        if (!currentToken) {
            // ✅ Fix: Don't auto-clear session here.
            setLoading(false);
            return;
        }

        try {
<<<<<<< HEAD
            const response = await fetch(`${API_BASE_URL}/api/user/profile/?_=${new Date().getTime()}`, {
=======
            const response = await fetch(`${API_BASE_URL}/api/profile/?_=${new Date().getTime()}`, {
>>>>>>> origin/main
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
                // ✅ Rule: Only logout if token is explicitly invalid (401)
                if (response.status === 401) {
                    console.error("Session expired (401). Keeping token for retry.");
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
        fetchUser();
    }, []);

    const login = (newToken, userData) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
<<<<<<< HEAD
        
        if (userData) {
            const userRole = userData.role_code || userData.role;
            if (userRole) userData.role = userRole.toLowerCase();
            
=======

        if (userData) {
            const userRole = userData.role_code || userData.role;
            if (userRole) userData.role = userRole.toLowerCase();

>>>>>>> origin/main
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