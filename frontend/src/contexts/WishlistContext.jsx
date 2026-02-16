import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    // Fetch wishlist from backend
    const fetchWishlist = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/wishlist/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setWishlist(response.data.wishlist || []);
            setWishlistCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add to wishlist
    const addToWishlist = async (productId) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            return { success: false, requiresLogin: true };
        }

        try {
            // Optimistic update
            setWishlistCount(prev => prev + 1);

            const response = await axios.post(
                `${API_BASE_URL}/api/wishlist/add/`,
                { product_id: productId },
                { headers: { Authorization: `Token ${token}` } }
            );

            if (response.data.already_exists) {
                // Revert optimistic update if already exists
                setWishlistCount(prev => prev - 1);
                return { success: true, message: response.data.message, alreadyExists: true };
            }

            // Immediately fetch to ensure sync
            await fetchWishlist();
            return { success: true, message: response.data.message };
        } catch (error) {
            // Revert optimistic update on error
            setWishlistCount(prev => prev - 1);
            console.error('Error adding to wishlist:', error);
            return { success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' };
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (productId) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return false;

        try {
            // Optimistic update
            const backup = wishlist;
            setWishlist(prev => prev.filter(item => item.product_id !== productId));
            setWishlistCount(prev => Math.max(0, prev - 1));

            await axios.delete(`${API_BASE_URL}/api/wishlist/remove/${productId}/`, {
                headers: { Authorization: `Token ${token}` }
            });

            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            // Revert on error
            fetchWishlist();
            return false;
        }
    };

    // Check if product is in wishlist
    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product_id === productId);
    };

    // Load wishlist on mount
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            fetchWishlist();
        }
    }, []);

    // Memoize functions to prevent unnecessary re-renders
    const addToWishlistCallback = React.useCallback(addToWishlist, [wishlist]);
    const removeFromWishlistCallback = React.useCallback(removeFromWishlist, [wishlist]);
    const isInWishlistCallback = React.useCallback(isInWishlist, [wishlist]);
    const fetchWishlistCallback = React.useCallback(fetchWishlist, []);

    const value = React.useMemo(() => ({
        wishlist,
        wishlistCount,
        loading,
        addToWishlist: addToWishlistCallback,
        removeFromWishlist: removeFromWishlistCallback,
        isInWishlist: isInWishlistCallback,
        fetchWishlist: fetchWishlistCallback
    }), [wishlist, wishlistCount, loading, addToWishlistCallback, removeFromWishlistCallback, isInWishlistCallback, fetchWishlistCallback]);

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
