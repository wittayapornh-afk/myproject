import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูล User จาก Token
  const fetchUser = async (authToken) => {
    try {
        const res = await fetch('http://localhost:8000/api/profile/', {
            headers: { 'Authorization': `Token ${authToken}` }
        });
        if (res.ok) {
            const data = await res.json();
            setUser(data); 
        } else {
            // Token หมดอายุหรือผิด
            logout();
        }
    } catch (error) {
        logout();
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
        localStorage.setItem('token', token);
        fetchUser(token);
    } else {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
    }
  }, [token]);

  const login = (newToken) => setToken(newToken);
  
  const logout = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);