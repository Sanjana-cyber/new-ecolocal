import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import BottomNav from '../components/BottomNav';
import '../styles/user.css';

const IMAGE_BASE = 'http://localhost:5000/uploads/';
const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${IMAGE_BASE}${img}`;
};

const PAYMENT_METHODS = [
  { value: 'cod',    label: 'Cash on Delivery', icon: '💵' },
  { value: 'upi',    label: 'UPI / PhonePe / GPay', icon: '📱' },
  { value: 'card',   label: 'Credit / Debit Card', icon: '💳' },
  { value: 'netbank',label: 'Net Banking', icon: '🏦' },
];

const CheckoutPage = () => {
  const navigate  = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();

  const shipping   = totalPrice > 500 ? 0 : 49;
  const grandTotal = totalPrice + shipping;

  const [address, setAddress] = useState({
    fullName: '', phone: '', pincode: '',
    street: '', city: '', state: '',
  });
  const [payment, setPayment]   = useState('cod');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleInput = (field) => (e) =>
    setAddress(prev => ({ ...prev, [field]: e.target.value }));

  const isValid = () =>
    address.fullName && address.phone && address.pincode &&
    address.street    && address.city  && address.state;

  const handlePlaceOrder = async () => {
    if (!isValid()) {
      showToast('Please fill all address fields', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        shippingAddress: address,
        paymentMethod: payment,
      });
      clearCart();
      showToast('Order placed successfully! 🎉');
      setTimeout(() => navigate('/my-orders'), 2000);
    } catch (err) {
      // If not logged in, show friendly message
      if (err.message?.includes('Not authorized') || err.message?.includes('no token')) {
        showToast('Please log in to place an order', 'error');
      } else {
        showToast(err.message || 'Failed to place order', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <div className="up-page up-checkout-page">
          <div className="up-page-header">
            <button className="up-page-back" onClick={() => navigate(-1)}>←</button>
            <h1>Checkout</h1>
          </div>
          <div className="up-empty" style={{ paddingTop: 80 }}>
            <div className="up-empty-icon">🛒</div>
            <p className="up-empty-title">Cart is empty</p>
            <button
              onClick={() => navigate('/shop')}
              style={{ marginTop: 16, padding: '10px 28px', border: 'none', borderRadius: '100px', background: 'var(--shop-primary)', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}
            >
              Shop Now
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      {toast && <div className={`up-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="up-page up-checkout-page">
        <div className="up-page-header">
          <button className="up-page-back" onClick={() => navigate(-1)}>←</button>
          <h1>Checkout</h1>
        </div>

        {/* Order Summary */}
        <div className="up-checkout-section">
          <h3>🛍️ Order Summary</h3>
          {cart.map(item => {
            const imgUrl = getImageUrl(item.image);
            return (
              <div key={`${item.productId}-${item.variantKey}`}
                style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                {imgUrl ? (
                  <img src={imgUrl} alt={item.name}
                    style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover', background: '#f0f0f0' }} />
                ) : (
                  <div style={{ width: 50, height: 50, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📦</div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>{item.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--shop-text-muted)' }}>
                    Qty: {item.quantity}
                    {item.selectedVariant ? ` • ${item.selectedVariant.size || ''} ${item.selectedVariant.color || ''}`.trim() : ''}
                  </p>
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            );
          })}

          <div style={{ borderTop: '1px dashed var(--shop-border)', paddingTop: 10, marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--shop-text-muted)', marginBottom: 4 }}>
              <span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--shop-text-muted)', marginBottom: 4 }}>
              <span>Delivery</span>
              <span style={{ color: shipping === 0 ? '#1a7340' : 'inherit' }}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginTop: 8 }}>
              <span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="up-checkout-section">
          <h3>📍 Delivery Address</h3>

          <div className="up-form-group">
            <label className="up-form-label">Full Name</label>
            <input className="up-form-input" placeholder="Enter full name" value={address.fullName} onChange={handleInput('fullName')} id="addr-name" />
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Phone Number</label>
            <input className="up-form-input" placeholder="10-digit mobile number" type="tel" value={address.phone} onChange={handleInput('phone')} id="addr-phone" />
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Street Address</label>
            <input className="up-form-input" placeholder="House no., street, area" value={address.street} onChange={handleInput('street')} id="addr-street" />
          </div>

          <div className="up-form-row">
            <div className="up-form-group">
              <label className="up-form-label">City</label>
              <input className="up-form-input" placeholder="City" value={address.city} onChange={handleInput('city')} id="addr-city" />
            </div>
            <div className="up-form-group">
              <label className="up-form-label">State</label>
              <input className="up-form-input" placeholder="State" value={address.state} onChange={handleInput('state')} id="addr-state" />
            </div>
          </div>

          <div className="up-form-group">
            <label className="up-form-label">Pincode</label>
            <input className="up-form-input" placeholder="6-digit pincode" type="number" value={address.pincode} onChange={handleInput('pincode')} id="addr-pincode" />
          </div>
        </div>

        {/* Payment Method */}
        <div className="up-checkout-section">
          <h3>💳 Payment Method</h3>
          <div className="up-payment-options">
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.value}
                className={`up-payment-option${payment === pm.value ? ' selected' : ''}`}
                onClick={() => setPayment(pm.value)}
                id={`payment-${pm.value}`}
              >
                <span className="up-payment-option-icon">{pm.icon}</span>
                {pm.label}
                {payment === pm.value && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Place Order Sticky Bar */}
      <div className="up-place-order-btn">
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          id="place-order-btn"
        >
          {loading ? '⏳ Placing Order...' : `🎉 Place Order — ₹${grandTotal.toLocaleString('en-IN')}`}
        </button>
      </div>

      <BottomNav />
    </>
  );
};

export default CheckoutPage;
