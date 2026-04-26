import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import BottomNav from '../components/BottomNav';
import '../styles/user.css';

const IMAGE_BASE = 'http://localhost:5000/uploads/';
const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${IMAGE_BASE}${img}`;
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

  const shipping = totalPrice > 500 ? 0 : 49;
  const grandTotal = totalPrice + shipping;

  return (
    <>
      <div className="up-page">
        {/* Header */}
        <div className="up-page-header">
          <button className="up-page-back" onClick={() => navigate(-1)} aria-label="Go back">←</button>
          <h1>My Cart ({cart.length} items)</h1>
        </div>

        {cart.length === 0 ? (
          <div className="up-empty" style={{ paddingTop: 80 }}>
            <div className="up-empty-icon">🛒</div>
            <p className="up-empty-title">Your cart is empty</p>
            <p className="up-empty-sub">Add some amazing products!</p>
            <button
              className="up-btn-primary"
              onClick={() => navigate('/shop')}
              style={{ marginTop: 16, padding: '10px 28px', border: 'none', borderRadius: '100px', background: 'var(--shop-primary)', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}
              id="cart-shop-btn"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <>
            <div className="up-cart-list">
              {cart.map((item) => {
                const imgUrl = getImageUrl(item.image);
                const variantLabel = item.selectedVariant
                  ? `${item.selectedVariant.size || ''} ${item.selectedVariant.color || ''}`.trim()
                  : '';

                return (
                  <div
                    key={`${item.productId}-${item.variantKey}`}
                    className="up-cart-item"
                    id={`cart-item-${item.productId}`}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="up-cart-item-img"
                        onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                      />
                    ) : null}
                    <div
                      className="up-cart-item-img-ph"
                      style={{ display: imgUrl ? 'none' : 'flex' }}
                    >
                      📦
                    </div>

                    <div className="up-cart-item-info">
                      <p className="up-cart-item-name">{item.name}</p>
                      {variantLabel && (
                        <p className="up-cart-item-variant">Variant: {variantLabel}</p>
                      )}
                      <p className="up-cart-item-price">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        <span style={{ fontSize: '0.74rem', fontWeight: 400, color: 'var(--shop-text-muted)', marginLeft: 6 }}>
                          (₹{item.price} × {item.quantity})
                        </span>
                      </p>

                      <div className="up-qty-control">
                        <button
                          className="up-qty-btn"
                          onClick={() => updateQuantity(item.productId, item.variantKey, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="up-qty-num">{item.quantity}</span>
                        <button
                          className="up-qty-btn"
                          onClick={() => updateQuantity(item.productId, item.variantKey, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      className="up-cart-remove"
                      onClick={() => removeFromCart(item.productId, item.variantKey)}
                      aria-label={`Remove ${item.name}`}
                      id={`cart-remove-${item.productId}`}
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="up-cart-summary">
              <h3 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 12, borderBottom: '1px solid var(--shop-border)', paddingBottom: 8 }}>
                Price Details
              </h3>

              <div className="up-summary-row">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="up-summary-row">
                <span>Delivery Charges</span>
                <span style={{ color: shipping === 0 ? '#1a7340' : 'inherit' }}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping === 0 && (
                <p style={{ fontSize: '0.75rem', color: '#1a7340', marginTop: 4 }}>
                  🎉 You saved ₹49 on delivery!
                </p>
              )}
              <div className="up-summary-row total">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                className="up-checkout-btn"
                onClick={() => navigate('/checkout')}
                id="proceed-checkout-btn"
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </>
  );
};

export default CartPage;
