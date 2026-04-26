import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/user.css';

const CATEGORIES = [
  { key: 'farmers',  label: 'Farmers',  icon: '🌾', desc: 'Fresh produce & farm goods' },
  { key: 'artisans', label: 'Artisans', icon: '🎨', desc: 'Handcrafted art & crafts' },
  { key: 'eco',      label: 'Eco',      icon: '🌱', desc: 'Sustainable & eco-friendly' },
  { key: 'local-shop', label: 'Local Shop', icon: '🏪', desc: 'Exclusive local stores' },
];

const CategoriesPage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (catKey) => {
    navigate(`/shop?category=${catKey}`);
  };

  return (
    <>
      <div className="up-page">
        <div className="up-page-header">
          <button className="up-page-back" onClick={() => navigate(-1)}>←</button>
          <h1>All Categories</h1>
        </div>

        <div className="up-categories-grid">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className="up-cat-card"
              onClick={() => handleCategoryClick(cat.key)}
              id={`cat-card-${cat.key}`}
              aria-label={cat.label}
              style={{ background: 'white', border: '2px solid transparent', cursor: 'pointer', textAlign: 'center' }}
            >
              <span className="up-cat-card-icon">{cat.icon}</span>
              <p className="up-cat-card-name">{cat.label}</p>
              <p className="up-cat-card-sub">{cat.desc}</p>
            </button>
          ))}
        </div>

        {/* Quick browse all */}
        <div style={{ padding: '0 12px 12px' }}>
          <button
            onClick={() => navigate('/shop')}
            style={{
              width: '100%', padding: '13px', borderRadius: '100px',
              border: '1.5px solid var(--shop-primary)', background: 'none',
              color: 'var(--shop-primary)', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'Outfit',
            }}
            id="browse-all-btn"
          >
            🛍️ Browse All Products
          </button>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default CategoriesPage;
