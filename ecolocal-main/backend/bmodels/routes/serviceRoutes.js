const express = require("express");
const router = express.Router();

// 📂 Import controller functions
const {
  getServices,
  getSingleService,
  addService,
  updateService,
  deleteService
} = require("../controllers/serviceController");

// 🔐 Import auth middleware
const { protect, isAdmin } = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| 🛠️ Service Routes (Updated Structure)
|--------------------------------------------------------------------------
*/

// 📋 GET all services
router.get("/all", getServices);

// ➕ Add new service (Admin Only)
router.post("/add", protect, isAdmin, addService);

// 🔍 GET one service
router.get("/:id", getSingleService);

// ✏️ Update service (Admin Only)
router.put("/update/:id", protect, isAdmin, updateService);

// ❌ Delete service (Admin Only)
router.delete("/delete/:id", protect, isAdmin, deleteService);

module.exports = router;