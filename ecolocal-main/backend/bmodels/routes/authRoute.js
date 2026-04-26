const express = require('express');
const { register, login } = require('../controllers/authController');
const passport = require("passport");
const { generateToken } = require('../controllers/authController');


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// Google login
router.get(
  "/google",
 passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account"
})

);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    const user = req.user;   // correct

    if (!user) {
      return res.status(400).json({ message: "User not found from Google login" });
    }

    const token = generateToken(user._id, user.role);

    res.redirect(
      `http://localhost:5173/google-success?token=${token}&role=${user.role}&name=${user.name}`
    );
  }
);






module.exports = router;
