import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  // Sync from DB on mount if logged in
  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Guest mode - load from localStorage
        const local = JSON.parse(localStorage.getItem('ecolocal_cart')) || [];
        setCart(local);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/cart', {
          headers: getHeaders()
        });
        const data = await res.json();
        // The backend returns { items: [...], totalPrice: ... }
        if (data && data.items) {
          const formatted = data.items.map(item => ({
            productId: item.product._id || item.product,
            name: item.name,
            image: item.image,
            selectedVariant: { color: item.color, size: item.size, price: item.price },
            variantKey: item.variantKey,
            quantity: item.quantity,
            price: item.price
          }));
          setCart(formatted);
          localStorage.setItem('ecolocal_cart', JSON.stringify(formatted));
        }
      } catch (err) {
        console.error('Failed to sync cart:', err);
        // Fallback to local
        const local = JSON.parse(localStorage.getItem('ecolocal_cart')) || [];
        setCart(local);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Persist to localStorage whenever cart changes (to handle refresh/guest logout)
  useEffect(() => {
    localStorage.setItem('ecolocal_cart', JSON.stringify(cart));
  }, [cart]);

  /** Add item or increase qty if already exists with same variant */
  const addToCart = async (product, selectedVariant, quantity = 1) => {
    const price = selectedVariant?.price || product.price;
    const variantKey = selectedVariant
      ? `${selectedVariant.size}-${selectedVariant.color}`
      : 'default';

    const newItem = {
      productId: product._id,
      name: product.name,
      image: selectedVariant?.image || product.mainImage || '',
      selectedVariant,
      variantKey,
      quantity,
      price,
      brand: product.brand,
    };

    // 1. Update UI state immediately (Optimistic UI)
    setCart(prev => {
      const existing = prev.find(
        i => i.productId === product._id && i.variantKey === variantKey
      );
      if (existing) {
        return prev.map(i =>
          i.productId === product._id && i.variantKey === variantKey
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, newItem];
    });

    // 2. Sync to Backend if logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            productId: product._id,
            quantity,
            name: product.name,
            price,
            image: newItem.image,
            color: selectedVariant?.color,
            size: selectedVariant?.size,
            variantKey
          })
        });
      } catch (err) {
        console.error("Backend Error adding to cart:", err);
      }
    }
  };

  const removeFromCart = async (productId, variantKey) => {
    setCart(prev =>
      prev.filter(i => !(i.productId === productId && i.variantKey === variantKey))
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`http://localhost:5000/api/cart/${productId}?variantKey=${variantKey || 'default'}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (err) {
        console.error("Backend Error removing:", err);
      }
    }
  };

  const updateQuantity = async (productId, variantKey, quantity) => {
    if (quantity < 1) return removeFromCart(productId, variantKey);

    setCart(prev =>
      prev.map(i =>
        i.productId === productId && i.variantKey === variantKey
          ? { ...i, quantity }
          : i
      )
    );

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/cart', {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ productId, variantKey, quantity })
        });
      } catch (err) {
        console.error("Backend Error updating qty:", err);
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('ecolocal_cart');
  };

  const totalItems = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  const totalPrice = cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
