const mongoose = require('mongoose');

const LoginOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
  loginAttempt: { type: Date, default: Date.now },
  deviceInfo: {
    browser: String,
    ip: String,
    location: String
  },
  // Thêm thông tin về loại tài khoản
  accountType: {
    type: String,
    enum: ["email", "google", "linked"],
    default: "email"
  }
});

module.exports = mongoose.model('LoginOTP', LoginOTPSchema); 