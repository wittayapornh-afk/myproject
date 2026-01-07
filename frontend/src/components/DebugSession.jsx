import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DebugSession = () => {
    const { user, loading } = useAuth();
    const [storageToken, setStorageToken] = useState('');
    const [storageUser, setStorageUser] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setStorageToken(localStorage.getItem('token') || 'NULL');
            setStorageUser(localStorage.getItem('user') || 'NULL');
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (process.env.NODE_ENV === 'production') return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.85)',
            color: '#0f0',
            padding: '15px',
            borderRadius: '10px',
            zIndex: 9999,
            fontSize: '12px',
            fontFamily: 'monospace',
            maxWidth: '300px',
            pointerEvents: 'none'
        }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '5px' }}>🕵️ Debug Session</h3>
            <div><strong>Loading:</strong> {loading ? 'TRUE' : 'FALSE'}</div>
            <div><strong>Auth User:</strong> {user ? user.username : 'NULL'}</div>
            <div style={{ marginTop: '5px', color: '#ff0' }}><strong>LS Token:</strong> {storageToken.substring(0, 10)}...</div>
            <div style={{ color: '#ff0' }}><strong>LS User:</strong> {storageUser === 'NULL' ? 'NULL' : 'PRESENT'}</div>
        </div>
    );
};

export default DebugSession;
