import ProductCard from './ProductCard';

// Skeleton loader card
const SkeletonCard = () => (
  <div className="up-skeleton-card">
    <div className="up-skeleton up-skeleton-img" />
    <div className="up-skeleton up-skeleton-line" />
    <div className="up-skeleton up-skeleton-line short" />
    <div className="up-skeleton up-skeleton-line" style={{ width: '40%', margin: '0 10px 12px' }} />
  </div>
);

const ProductGrid = ({ products, loading, error }) => {
  if (error) {
    return (
      <div className="up-empty">
        <div className="up-empty-icon">⚠️</div>
        <p className="up-empty-title">Failed to load products</p>
        <p className="up-empty-sub">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="up-product-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="up-empty">
        <div className="up-empty-icon">🔍</div>
        <p className="up-empty-title">No products found</p>
        <p className="up-empty-sub">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className="up-product-grid">
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
