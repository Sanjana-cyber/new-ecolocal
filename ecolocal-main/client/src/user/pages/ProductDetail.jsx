import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import BottomNav from '../components/BottomNav';
import '../styles/user.css';

const BACKEND_URL = 'http://localhost:5000';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/')) return `${BACKEND_URL}${img}`;
  return `${BACKEND_URL}/uploads/${img}`;
};

const Toast = ({ msg, type }) =>
  msg ? <div className={`up-toast ${type}`}>{msg}</div> : null;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [toast, setToast]               = useState(null);

  const carouselRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2100);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        
        // Initial Selection: First color, first available size
        if (data.colorVariants?.length > 0) {
          const firstColor = data.colorVariants[0];
          setSelectedColor(firstColor);
          if (firstColor.sizes?.length > 0) {
            setSelectedSize(firstColor.sizes[0]);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Reset carousel index when color changes
  useEffect(() => {
    setActiveImgIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="up-detail-page">
        <div className="up-detail-back">
          <button className="up-page-back" onClick={() => navigate(-1)}>←</button>
          <span>Loading...</span>
        </div>
        <div className="up-skeleton-carousel" style={{ height: 400, background: '#eee', margin: '10px' }} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="up-detail-page">
        <div className="up-empty">
          <div className="up-empty-icon">⚠️</div>
          <p className="up-empty-title">Product not found</p>
          <button className="up-btn-primary" onClick={() => navigate('/shop')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  const colorVariants = product.colorVariants || [];
  const currentImages = selectedColor?.images?.length > 0 ? selectedColor.images : [product.mainImage].filter(Boolean);
  const currentPrice  = product.price || 0;
  const currentStock  = selectedSize?.stock ?? 0;
  const wishlisted    = isWishlisted(product._id);

  const handleColorSelect = (cv) => {
    setSelectedColor(cv);
    // Auto-select first in-stock size if current size isn't in this color
    if (cv.sizes?.length > 0) {
      const sameSizeName = cv.sizes.find(s => s.size === selectedSize?.size);
      setSelectedSize(sameSizeName || cv.sizes[0]);
    }
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    setActiveImgIndex(newIndex);
  };

  const handleAddToCart = () => {
    if (currentStock === 0) return;
    const variantData = {
      color: selectedColor?.color,
      size: selectedSize?.size,
      stock: selectedSize?.stock,
      price: product.price,
      image: selectedColor?.images?.[0] || product.mainImage
    };
    addToCart(product, variantData, 1);
    showToast('Added to cart 🛒');
  };

  const handleBuyNow = () => {
    if (currentStock === 0) return;
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️', wishlisted ? 'error' : 'success');
  };

  return (
    <>
      <Toast msg={toast?.msg} type={toast?.type} />

      <div className="up-detail-page" style={{ paddingTop: 0 }}>
        {/* Back header */}
        <div className="up-detail-header-sticky" style={{ position: 'sticky', top: 0, zIndex: 400, background: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display:'flex', alignItems:'center', gap: 15 }}>
            <button onClick={() => navigate(-1)} style={{ background:'none', border:'none', fontSize:'1.4rem', cursor:'pointer', padding: 0 }}>←</button>
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{product.name}</span>
          </div>
          <button onClick={handleWishlist} style={{ background:'none', border:'none', fontSize:'1.3rem', cursor:'pointer' }}>
            {wishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        {/* 1. Meesho-style Image Carousel */}
        <div className="up-detail-carousel-container" style={{ position: 'relative', background: '#fff' }}>
          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="up-detail-carousel"
            style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              scrollSnapType: 'x mandatory', 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {currentImages.map((img, i) => (
              <div key={i} style={{ minWidth: '100%', scrollSnapAlign: 'start', position: 'relative', aspectRatio: '1/1.2', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f9f9' }}>
                <img
                  src={getImageUrl(img)}
                  alt={`${product.name} perspective ${i+1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = "https://placehold.co/600x800?text=No+Image"; }}
                />
              </div>
            ))}
          </div>
          {/* Pagination Indicators */}
          {currentImages.length > 1 && (
            <div style={{ position: 'absolute', bottom: 15, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
              {currentImages.map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    width: activeImgIndex === i ? 20 : 8, 
                    height: 8, 
                    borderRadius: 4, 
                    background: activeImgIndex === i ? 'var(--shop-primary)' : 'rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. Info Section */}
        <div className="up-detail-content" style={{ padding: '20px 16px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--shop-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.brand}</p>
              <h1 style={{ fontSize: '1.25rem', margin: '4px 0 8px', color: '#333', lineHeight: 1.3 }}>{product.name}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: 10 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#000' }}>₹{currentPrice.toLocaleString('en-IN')}</span>
            <span style={{ color: '#888', textDecoration: 'line-through', fontSize: '1rem' }}>₹{(currentPrice * 1.2).toFixed(0)}</span>
            <span style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 700 }}>20% off</span>
          </div>

          <div style={{ marginTop: 20, borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>Description</h4>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#555' }}>{product.description}</p>
          </div>

          {/* 3. Color Selection */}
          {colorVariants.length > 0 && (
            <div style={{ marginTop: 25 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Select Color</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {colorVariants.map((cv) => (
                  <div 
                    key={cv.color}
                    onClick={() => handleColorSelect(cv)}
                    className={`up-color-node ${selectedColor?.color === cv.color ? 'active' : ''}`}
                    style={{ 
                      border: selectedColor?.color === cv.color ? '2px solid var(--shop-primary)' : '1px solid #eee',
                      padding: '4px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      background: selectedColor?.color === cv.color ? '#f0f9f1' : '#fff'
                    }}
                  >
                    <div style={{ width: 45, height: 45, background: cv.color.toLowerCase(), borderRadius: '8px', marginBottom: 4, margin: 'auto', border: '1px solid #00000010' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', textTransform: 'capitalize' }}>{cv.color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Size Selection */}
          {selectedColor?.sizes?.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Select Size</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {selectedColor.sizes.map((s) => {
                  const isLow = s.stock > 0 && s.stock < 5;
                  const isOut = s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      disabled={isOut}
                      className={`up-size-btn ${selectedSize?.size === s.size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                      style={{ 
                        padding: '10px 20px', borderRadius: '10px', 
                        border: selectedSize?.size === s.size ? '2px solid var(--shop-primary)' : '1px solid #ddd',
                        background: selectedSize?.size === s.size ? 'var(--shop-primary)' : '#fff',
                        color: selectedSize?.size === s.size ? '#fff' : (isOut ? '#ccc' : '#333'),
                        fontWeight: 700, cursor: isOut ? 'not-allowed' : 'pointer',
                        position: 'relative', minWidth: '60px'
                      }}
                    >
                      {s.size}
                      {isLow && <span style={{ position: 'absolute', top: -10, right: -5, background: '#ef4444', color: '#fff', fontSize: '0.6rem', padding: '2px 5px', borderRadius: 4 }}>Only {s.stock}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* 5. Action Buttons (Inline) */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '35px', paddingBottom: '20px' }}>
            <button 
              className="up-btn-secondary" 
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              style={{ 
                flex: 1, padding: '14px', borderRadius: '12px', 
                background: '#fff', color: '#111', border: '1.5px solid #111', 
                fontWeight: 800, cursor: 'pointer', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', gap: '8px', 
                fontSize: '0.95rem' 
              }}
            >
              🛒 Add to Cart
            </button>
            <button 
              className="up-btn-primary" 
              onClick={handleBuyNow}
              disabled={currentStock === 0}
              style={{ 
                flex: 1, padding: '14px', borderRadius: '12px', 
                background: 'var(--shop-primary)', color: '#fff', 
                border: 'none', fontWeight: 800, cursor: 'pointer', 
                fontSize: '0.95rem' 
              }}
            >
              ⚡ Buy Now
            </button>
          </div>

        </div>
      </div>

      <BottomNav />
    </>
  );
};

export default ProductDetail;
