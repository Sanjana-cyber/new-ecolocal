const express = require('express');
const upload = require("../middleware/upload");
const { addProduct } = require("../controllers/productController");

const router = express.Router();

// All images go to Cloudinary via memoryStorage (no local /uploads folder needed)
router.post("/add", upload.single("image"), addProduct);

module.exports = router;
