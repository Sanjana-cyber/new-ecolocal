import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const NAV_ITEMS = [
  { label: 'Home',       icon: '🏠', path: '/shop' },
  { label: 'Categories', icon: '📂', path: '/categories' },
  { label: 'Orders',     icon: '📦', path: '/my-orders' },
  { label: 'Cart',       icon: '🛒', path: '/cart',     badge: 'cart' },
  { label: 'Wishlist',   icon: '❤️',  path: '/wishlist', badge: 'wishlist' },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();

  const getBadge = (type) => {
    if (type === 'cart')     return totalItems     > 0 ? totalItems     : null;
    if (type === 'wishlist') return wishlist.length > 0 ? wishlist.length : null;
    return null;
  };

  return (
    <nav className="up-bottom-nav" role="navigation" aria-label="Bottom navigation">
      {NAV_ITEMS.map(item => {
        const isActive = item.path === '/shop'
          ? pathname === '/shop' || pathname === '/'
          : pathname.startsWith(item.path);
        const badge = item.badge ? getBadge(item.badge) : null;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`up-nav-item${isActive ? ' active' : ''}`}
            aria-label={item.label}
            id={`bottom-nav-${item.label.toLowerCase()}`}
          >
            {badge !== null && (
              <span className="up-nav-badge">{badge > 99 ? '99+' : badge}</span>
            )}
            <span className="up-nav-icon">{item.icon}</span>
            <span className="up-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
