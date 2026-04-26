import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import UserHeader from '../components/UserHeader';
import FilterBar from '../components/FilterBar';
import CategoryCircles from '../components/CategoryCircles';
import ProductGrid from '../components/ProductGrid';
import BottomNav from '../components/BottomNav';
import { fetchProducts } from '../services/productService';
import '../styles/user.css';

const ITEMS_PER_PAGE = 8;

const UserShop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [total, setTotal]         = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);

  // Visual Search State
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionLabels, setVisionLabels]   = useState([]);
  const [isVisionSearch, setIsVisionSearch] = useState(false);

  // Derive params from URL search params
  const keyword  = searchParams.get('keyword')  || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')      || '';
  const minPrice = searchParams.get('minPrice')  || '';
  const maxPrice = searchParams.get('maxPrice')  || '';

  const buildParams = useCallback((page = 1) => ({
    keyword, category, sort, minPrice, maxPrice,
    page, limit: ITEMS_PER_PAGE,
  }), [keyword, category, sort, minPrice, maxPrice]);

  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    setIsVisionSearch(false);
    try {
      const data = await fetchProducts(buildParams(page));
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const handleVisionSearch = async (file) => {
    setVisionLoading(true);
    setError(null);
    setProducts([]);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('http://localhost:5000/api/vision-search', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
        setVisionLabels(data.labels || []);
        setIsVisionSearch(true);
        setTotal(data.count || 0);
        setTotalPages(1); // Visual search is currently one-page
      } else {
        setError(data.message || 'Vision search failed');
      }
    } catch (err) {
      setError('Connection to vision server failed');
    } finally {
      setVisionLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, [keyword, category, sort, minPrice, maxPrice]);

  const updateParam = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next);
  };

  const handleSearch = (kw) => updateParam({ keyword: kw });

  const handleCategorySelect = (cat) => {
    updateParam({ category: cat || '' });
  };

  const handleParamChange = (updates) => {
    // Convert sort tokens
    if (updates.sort !== undefined) {
      updateParam({ sort: updates.sort || '' });
    } else {
      updateParam(updates);
    }
  };

  return (
    <>
      <UserHeader 
        onSearch={handleSearch} 
        onVisionSearch={handleVisionSearch} 
        visionLoading={visionLoading}
      />

      <div className="up-root">
        <FilterBar
          params={{ keyword, category, sort, minPrice, maxPrice }}
          onParamChange={handleParamChange}
        />

        <CategoryCircles
          activeCategory={category || null}
          onSelect={handleCategorySelect}
        />

        {/* Main product grid */}
        <section className="up-section" aria-label="Products">
          <h2 className="up-section-title">
            {isVisionSearch ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔍 Visual Search Results
                  <button 
                    onClick={() => loadProducts(1)}
                    style={{ fontSize: '0.7rem', background: 'var(--shop-primary-pale)', border: 'none', padding: '4px 10px', borderRadius: '100px', cursor: 'pointer', color: 'var(--shop-primary)' }}
                  >
                    Clear
                  </button>
                </div>
                {visionLabels.length > 0 && (
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--shop-text-muted)', textTransform: 'none', letterSpacing: 'normal' }}>
                    Detected: {visionLabels.slice(0, 5).join(', ')}...
                  </div>
                )}
              </div>
            ) : category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
              : keyword
              ? `Results for "${keyword}"`
              : '🛍️ All Products'
            }
            {!loading && !visionLoading && (
              <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--shop-text-muted)', marginLeft: '8px' }}>
                ({total} items)
              </span>
            )}
          </h2>

          <ProductGrid 
            products={products} 
            loading={loading || visionLoading} 
            error={error} 
          />

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, paddingBottom: 16 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => loadProducts(p)}
                  className={`up-page-btn ${p === currentPage ? 'active' : ''}`}
                  id={`page-btn-${p}`}
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Branding Watermark */}
        <div className="up-watermark">
          EcoLocal
          <span>Marketplace</span>
        </div>
      </div>

      <BottomNav />
    </>
  );
};

export default UserShop;
