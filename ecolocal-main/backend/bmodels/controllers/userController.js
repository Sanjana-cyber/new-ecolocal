const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/me  (update name, email, phone)
const updateMe = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/me/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is wrong' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
//make admin
const makeAdmin = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = "admin";
  await user.save();

  res.json({ message: "User promoted to admin" });
};
//forgot password
const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 2️⃣ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3️⃣ Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4️⃣ Save token in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    // 5️⃣ Create reset link
    const resetLink =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 6️⃣ Email transporter
    const transporter = nodemailer.createTransport({

      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }

    });

    // 7️⃣ Email content
    const message = `
You requested a password reset.

Click the link below to reset your password:

${resetLink}

This link will expire in 1 hour.

If you did not request this, ignore this email.
`;

    // 8️⃣ Send email
    await transporter.sendMail({

      to: user.email,
      subject: "Password Reset Request",
      text: message

    });

    res.status(200).json({
      success: true,
      message: "Reset password link sent to email"
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};

//reset password


const resetPassword = async (req, res) => {

  try {

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({

      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }

    });

    if (!user) {

      return res.status(400).json({
        success: false,
        message: "Token invalid or expired"
      });

    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful"
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
 


};
 module.exports = {
  getMe,
  updateMe,
  changePassword,
  makeAdmin,
  forgotPassword,
  resetPassword
};
// pandeysahil116@gmail.com