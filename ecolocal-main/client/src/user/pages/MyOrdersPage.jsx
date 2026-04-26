import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
import BottomNav from '../components/BottomNav';
import '../styles/user.css';

const statusIcon = {
  pending:    '🟡',
  processing: '🔵',
  shipped:    '🟣',
  delivered:  '🟢',
  cancelled:  '🔴',
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <>
      <div className="up-page">
        <div className="up-page-header">
          <button className="up-page-back" onClick={() => navigate(-1)}>←</button>
          <h1>My Orders</h1>
        </div>

        {loading ? (
          <div className="up-order-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="up-skeleton-card" style={{ padding: 16, borderRadius: 12 }}>
                <div className="up-skeleton" style={{ height: 12, marginBottom: 8, width: '40%' }} />
                <div className="up-skeleton" style={{ height: 12, marginBottom: 8 }} />
                <div className="up-skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="up-empty" style={{ paddingTop: 60 }}>
            <div className="up-empty-icon">⚠️</div>
            <p className="up-empty-title">Could not fetch orders</p>
            <p className="up-empty-sub">{error}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--shop-text-muted)', marginTop: 8 }}>
              Please log in to view your orders.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="up-empty" style={{ paddingTop: 80 }}>
            <div className="up-empty-icon">📦</div>
            <p className="up-empty-title">No orders yet</p>
            <p className="up-empty-sub">Your orders will appear here once you shop!</p>
            <button
              className="up-btn-primary"
              onClick={() => navigate('/shop')}
              style={{ marginTop: 16, padding: '10px 28px', border: 'none', borderRadius: '100px', background: 'var(--shop-primary)', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}
              id="orders-shop-btn"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="up-order-list">
            {orders.map(order => {
              const status = order.status || 'pending';
              const items  = order.orderItems || [];

              return (
                <div key={order._id} className="up-order-card" id={`order-${order._id}`}>
                  <div className="up-order-card-header">
                    <div>
                      <p className="up-order-id">Order #{order._id?.slice(-8).toUpperCase()}</p>
                      <p className="up-order-date">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`up-order-status ${status}`}>
                      {statusIcon[status] || '⬛'} {status}
                    </span>
                  </div>

                  <div className="up-order-items">
                    {items.slice(0, 3).map((item, idx) => (
                      <span key={idx}>
                        {item.name || item.product?.name || 'Product'}
                        {idx < Math.min(items.length, 3) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {items.length > 3 && (
                      <span style={{ color: 'var(--shop-primary)', fontWeight: 600 }}>
                        {' '}+{items.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="up-order-total">
                    <span className="up-order-total-label">
                      {order.paymentMethod ? `💳 ${order.paymentMethod}` : ''}
                    </span>
                    <span className="up-order-total-value">
                      ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {order.shippingAddress && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--shop-text-muted)', marginTop: 8 }}>
                      📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
};

export default MyOrdersPage;
