const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { getMe, updateMe, changePassword, makeAdmin, forgotPassword, resetPassword } = require('../controllers/userController');

router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

router.get('/test-protected', protect, (req, res) => {
  res.json({ message: `Token OK for user ${req.user.id}` });
});

// Profile routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/password', protect, changePassword);
router.put('/make-admin/:id', protect, isAdmin, makeAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


module.exports = router;



