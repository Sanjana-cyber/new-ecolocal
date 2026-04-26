import { createContext, useContext, useState, useEffect, useRef } from 'react';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      // 🚀 Initialize from localStorage immediately to prevent "emptying" on refresh
      const saved = localStorage.getItem('ecolocal_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading wishlist from local storage', err);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const initialFetchDone = useRef(false);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  // Sync from DB on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/wishlist', {
          headers: getHeaders()
        });
        const data = await res.json();
        if (data.success) {
          setWishlist(data.data);
          localStorage.setItem('ecolocal_wishlist', JSON.stringify(data.data));
        }
      } catch (err) {
        console.error('Failed to sync wishlist with DB:', err);
      } finally {
        setLoading(false);
        initialFetchDone.current = true;
      }
    };

    fetchWishlist();
  }, []);

  // Persist to localStorage whenever wishlist changes, BUT skipping initial empty state if we haven't fetched yet
  useEffect(() => {
    if (initialFetchDone.current || wishlist.length > 0) {
      localStorage.setItem('ecolocal_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const isWishlisted = (productId) => wishlist.some(p => p._id === productId);

  const addToWishlist = async (product) => {
    if (isWishlisted(product._id)) return;

    // Optimistic Update
    const updatedWishlist = [...wishlist, product];
    setWishlist(updatedWishlist);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('http://localhost:5000/api/wishlist', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ productId: product._id })
        });
        const data = await res.json();
        if (!data.success) {
          setWishlist(prev => prev.filter(p => p._id !== product._id));
        }
      } catch (err) {
        console.error('Backend Error adding item:', err);
        setWishlist(prev => prev.filter(p => p._id !== product._id));
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlist(prev => prev.filter(p => p._id !== productId));

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (err) {
        console.error('Backend Error removing item:', err);
      }
    }
  };

  const toggleWishlist = (product) => {
    if (isWishlisted(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, addToWishlist, removeFromWishlist, isWishlisted, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
