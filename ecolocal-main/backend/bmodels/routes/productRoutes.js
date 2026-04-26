const express = require('express');
const router = express.Router();
const {
  getProducts,
  getSingleProduct,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// 📦 GET all products (public) & ➕ ADD product (admin only)
router.route('/')
  .get(getProducts)
  .post(protect, isAdmin, addProduct);

// 🔍 GET single product (public), ✏️ UPDATE (admin), ❌ DELETE (admin)
router.route('/:id')
  .get(getSingleProduct)
  .put(protect, isAdmin, updateProduct)
  .delete(protect, isAdmin, deleteProduct);

module.exports = router;