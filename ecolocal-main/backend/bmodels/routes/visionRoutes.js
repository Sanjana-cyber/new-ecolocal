const express = require('express');
const router = express.Router();
const multer = require('multer');
const { visionSearch } = require('../controllers/visionController');

// Multer configuration: use memory storage for transient search files
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/', upload.single('image'), visionSearch);

module.exports = router;
