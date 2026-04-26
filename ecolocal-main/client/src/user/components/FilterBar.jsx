import { useState, useRef, useEffect } from 'react';

// CATEGORIES remains same
const CATEGORIES = [
  { value: '',         label: 'All Categories' },
  { value: 'farmers',  label: '🌾 Farmers' },
  { value: 'artisans', label: '🎨 Artisans' },
  { value: 'eco',      label: '🌱 Eco' },
  { value: 'local-shop', label: '🏪 Local Shop' },
];

// GENDER_OPTIONS and PRICE_OPTIONS removed as per request

// Dropdown component
const Dropdown = ({ label, options, value, onChange, id }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);
  const isActive  = !!value;

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className={`up-filter-btn${isActive ? ' active' : ''}`}
        onClick={() => setOpen(p => !p)}
        aria-expanded={open}
        id={id}
      >
        {selected?.label || label}
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="up-dropdown-panel" role="listbox">
          {options.map(opt => (
            <button
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`up-dropdown-item${value === opt.value ? ' active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
              {value === opt.value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Filter modal (bottom sheet)
const FilterModal = ({ open, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => { if (open) setLocalFilters(filters); }, [open, filters]);

  const handleApply = () => { onApply(localFilters); onClose(); };
  const handleReset = () => {
    const reset = { minPrice: '', maxPrice: '' };
    setLocalFilters(reset);
    onApply(reset);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="up-dropdown-overlay" onClick={onClose} />
      <div className="up-modal-sheet" role="dialog" aria-modal="true" aria-label="Filters">
        <div className="up-modal-header">
          <h3>Filters</h3>
          <button className="up-modal-close" onClick={onClose} aria-label="Close filters">✕</button>
        </div>

        <div className="up-modal-body">
          {/* Price Range */}
          <div className="up-filter-section">
            <h4>Price Range (₹)</h4>
            <div className="up-range-row">
              <input
                className="up-range-input"
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={e => setLocalFilters(p => ({ ...p, minPrice: e.target.value }))}
                id="filter-min-price"
              />
              <span style={{ color: 'var(--shop-text-muted)' }}>–</span>
              <input
                className="up-range-input"
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={e => setLocalFilters(p => ({ ...p, maxPrice: e.target.value }))}
                id="filter-max-price"
              />
            </div>
          </div>
        </div>

        <div className="up-modal-actions">
          <button className="up-btn-outline" onClick={handleReset} id="filter-reset-btn">Reset</button>
          <button className="up-btn-primary" onClick={handleApply} id="filter-apply-btn">Apply Filters</button>
        </div>
      </div>
    </>
  );
};

// Main FilterBar
const FilterBar = ({ params, onParamChange }) => {
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActiveFilters =
    params.minPrice || params.maxPrice;

  const handleCategory = (val) => {
    onParamChange({ category: val, page: 1 });
  };

  const handleFilterApply = ({ minPrice, maxPrice }) => {
    onParamChange({ minPrice, maxPrice, page: 1 });
  };

  return (
    <>
      <div className="up-filter-bar" style={{ overflow: 'visible' }} role="toolbar" aria-label="Product filters">
        <Dropdown
          id="category-dropdown"
          label="Category"
          options={CATEGORIES}
          value={params.category || ''}
          onChange={handleCategory}
        />
        <button
          className={`up-filter-btn${hasActiveFilters ? ' active' : ''}`}
          onClick={() => setFilterOpen(true)}
          id="filters-btn"
        >
          {hasActiveFilters ? '🔴' : '⚙️'} Filters
        </button>
      </div>

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={{ minPrice: params.minPrice || '', maxPrice: params.maxPrice || '' }}
        onApply={handleFilterApply}
      />
    </>
  );
};

export default FilterBar;
