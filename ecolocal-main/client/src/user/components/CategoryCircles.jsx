const CATEGORIES = [
  { key: 'farmers',  label: 'Farmers',  icon: '🌾' },
  { key: 'artisans', label: 'Artisans', icon: '🎨' },
  { key: 'eco',      label: 'Eco',      icon: '🌱' },
  { key: 'local-shop', label: 'Local Shop', icon: '🏪' },
];

const CategoryCircles = ({ activeCategory, onSelect }) => {
  return (
    <section className="up-cat-section" aria-label="Browse categories">
      <div className="up-cat-scroll">
        {/* "All" option */}
        <button
          className={`up-cat-item${!activeCategory ? ' active' : ''}`}
          onClick={() => onSelect(null)}
          aria-pressed={!activeCategory}
          id="cat-circle-all"
        >
          <div className="up-cat-circle">🛒</div>
          <span className="up-cat-label">All</span>
        </button>

        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`up-cat-item${activeCategory === cat.key ? ' active' : ''}`}
            onClick={() => onSelect(cat.key)}
            aria-pressed={activeCategory === cat.key}
            id={`cat-circle-${cat.key}`}
          >
            <div className="up-cat-circle">{cat.icon}</div>
            <span className="up-cat-label">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export { CATEGORIES };
export default CategoryCircles;
