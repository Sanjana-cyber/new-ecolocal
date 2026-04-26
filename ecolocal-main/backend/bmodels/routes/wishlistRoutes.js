const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require('../controllers/wishlistController');

// All wishlist routes are protected
router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
