import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

/**
 * UserLayout wraps all user-facing pages with the global Cart and Wishlist context.
 * This ensures cart/wishlist state is shared across all user routes.
 */
const UserLayout = ({ children }) => {
  return (
    <CartProvider>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </CartProvider>
  );
};

export default UserLayout;
