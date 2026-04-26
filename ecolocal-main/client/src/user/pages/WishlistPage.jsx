import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import BottomNav from '../components/BottomNav';
import '../styles/user.css';

const BACKEND_URL = "http://localhost:5000";

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BACKEND_URL}${img}`;
};

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    // Add to cart with default variant if available
    const defaultVariant = product.colorVariants?.[0]?.sizes?.[0] 
      ? { color: product.colorVariants[0].color, size: product.colorVariants[0].sizes[0].size, price: product.price }
      : null;
      
    addToCart(product, defaultVariant, 1);
    removeFromWishlist(product._id);
  };

  if (loading && wishlist.length === 0) {
    return (
      <div className="up-page">
        <div className="up-page-header">
           <button className="up-page-back" onClick={() => navigate(-1)}>←</button>
           <h1>My Wishlist</h1>
        </div>
        <div className="up-loading" style={{ textAlign: 'center', padding: '100px 0' }}>
           <p>Updating your favorites...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <>
      <div className="up-page">
        <div className="up-page-header">
          <button className="up-page-back" onClick={() => navigate(-1)}>←</button>
          <h1>My Wishlist ({wishlist.length})</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="up-empty" style={{ paddingTop: 80 }}>
            <div className="up-empty-icon">❤️</div>
            <p className="up-empty-title">Your wishlist is empty</p>
            <p className="up-empty-sub">Save items you love!</p>
            <button
              className="up-btn-primary"
              onClick={() => navigate('/shop')}
              style={{ marginTop: 16, padding: '10px 28px', border: 'none', borderRadius: '100px', background: 'var(--shop-primary)', color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit' }}
              id="wishlist-shop-btn"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="up-product-grid">
            {wishlist.map(product => {
              const displayImage = product.mainImage || product.colorVariants?.[0]?.images?.[0];
              const imgUrl = getImageUrl(displayImage);

              return (
                <article
                  key={product._id}
                  className="up-card"
                  id={`wishlist-item-${product._id}`}
                >
                  <div
                    className="up-card-img-wrap"
                    onClick={() => navigate(`/product/${product._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={imgUrl || "https://placehold.co/300x300?text=No+Image"}
                      alt={product.name}
                      loading="lazy"
                      onError={e => { e.target.src = "https://placehold.co/300x300?text=Error"; }}
                    />
                    <button
                      className="up-card-wish-btn active"
                      onClick={(e) => { e.stopPropagation(); removeFromWishlist(product._id); }}
                      aria-label="Remove from wishlist"
                      id={`wl-remove-${product._id}`}
                    >
                      ❤️
                    </button>
                  </div>

                  <div className="up-card-body">
                    <p className="up-card-brand">{product.brand}</p>
                    <h3 className="up-card-name" onClick={() => navigate(`/product/${product._id}`)}>{product.name}</h3>
                    <p className="up-card-price">₹{product.price.toLocaleString('en-IN')}</p>

                    <div className="up-card-actions">
                      <button
                        className="up-btn-cart"
                        onClick={() => handleMoveToCart(product)}
                        id={`wl-add-cart-${product._id}`}
                      >
                        🛒 Move to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
};

export default WishlistPage;
