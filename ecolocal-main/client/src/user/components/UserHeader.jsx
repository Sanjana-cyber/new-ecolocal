import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UserHeader = ({ onSearch, onVisionSearch, visionLoading }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract keyword from URL params to keep search bar in sync
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const kw = sp.get('keyword') || '';
    setQuery(kw);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
    // Navigate to shop with keyword
    const sp = new URLSearchParams(location.search);
    if (query.trim()) sp.set('keyword', query.trim());
    else sp.delete('keyword');
    navigate(`/shop?${sp.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  const handleLensClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (onVisionSearch) {
      onVisionSearch(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('ecolocal_cart');
    navigate('/');
  };

  return (
    <header className="up-header">
      <div className="up-header-top">
        <span className="up-header-logo">🌿 EcoLocal</span>

        <form className="up-search-bar" onSubmit={handleSearch}>
          <span className="up-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            id="user-search-input"
            autoComplete="off"
          />
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept="image/*"
          />

          {query && (
            <button
              type="button"
              className="up-search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            className={`up-search-camera ${visionLoading ? 'loading' : ''}`}
            onClick={handleLensClick}
            disabled={visionLoading}
            title="Search by image / Camera"
          >
            {visionLoading ? '⏳' : '📷'}
          </button>
        </form>

        <button
          className="up-logout-btn"
          onClick={handleLogout}
          title="Logout"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '100px',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: '8px',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s'
          }}
        >
          <span>Logout</span>

        </button>
      </div>

      <div className="up-header-address">
        <span>📍</span>
        <span>Deliver to</span>
        <span>Your Location</span>
      </div>
    </header>
  );
};

export default UserHeader;
