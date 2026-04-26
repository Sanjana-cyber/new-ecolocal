import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

const BACKEND_URL = "http://localhost:5000";

export const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${BACKEND_URL}${img}`;
};

const ProductCard = ({ product }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/300x300?text=Image+Error";
  };

  const handleWishlistClick = (e) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    toggleWishlist(product);
  };

  const displayImage = product.mainImage || product.colorVariants?.[0]?.images?.[0];
  const rating = product.rating || (Math.random() * (5 - 3) + 3).toFixed(1); // Fallback for demo
  const isGoodRating = rating >= 4;

  return (
    <Link to={`/product/${product._id}`} className="up-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="up-card">
        <div className="up-card-img-wrap">
          <img
            src={getImageUrl(displayImage) || "https://placehold.co/300x300?text=No+Image"}
            alt={product.name}
            onError={handleImageError}
          />
          <button 
            className={`up-card-wish-btn ${wishlisted ? 'active' : ''}`}
            onClick={handleWishlistClick}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            id={`wish-btn-${product._id}`}
          >
            {wishlisted ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="up-card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="up-card-brand">{product.brand || product.category || 'Local Seller'}</span>
            {/* <div className={`up-card-rating ${isGoodRating ? 'green' : ''}`}>
              ★ {rating}
            </div> */}
          </div>
          <h3 className="up-card-name">{product.name}</h3>

          <div className="up-card-price-row">
            <span className="up-card-price">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
