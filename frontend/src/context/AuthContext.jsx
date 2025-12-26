import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

            if (response.ok) {
                const userData = await response.json();

                // ✅ Rule: Backend may return role (display) and role_code (value)
                // We should use role_code for logic if available
                const userRole = userData.role_code || userData.role;
                if (userRole) userData.role = userRole.toLowerCase();

                setUser(userData);
            } else {
                // ✅ Rule: เจอ 401 (Token หมดอายุ) ให้ Logout ทันที
                console.error("Session expired");
                logout();
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        if (userData) {
            const userRole = userData.role_code || userData.role;
            if (userRole) userData.role = userRole.toLowerCase();
            setUser(userData);
        } else {
            fetchUser(token);
        }
    };

    // ✅ Rule: Clear ข้อมูลให้เกลี้ยงตอน Logout
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, token: getToken() }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);