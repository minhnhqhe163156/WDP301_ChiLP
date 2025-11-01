const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // required: function() { return !this.googleId; }, // Chỉ required nếu không phải Google
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "marketing_staff", "admin"],
      required: true,
      default: "customer",
    },
    gender: {
      type: String,
      enum: ["", "Nam", "Nữ", "Khác"],
      default: "",
    },
    picture_avatar: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
    last_login: Date,
    is_active: {
      type: Boolean,
      default: true,
    },
    shop_name: {
      type: String,
      trim: true,
    },
    shop_description: {
      type: String,
      trim: true,
    },
    shop_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    googleId: {
      type: String,
      required: false,
    },
    // Thêm trường để hỗ trợ liên kết tài khoản
    accountType: {
      type: String,
      enum: ["email", "google", "linked"], // email: chỉ email, google: chỉ google, linked: đã liên kết
      default: "email"
    },
    // Cho phép đăng nhập bằng OTP
    allowOTPLogin: {
      type: Boolean,
      default: true
    },
    // Lưu thông tin liên kết
    linkedAccounts: [{
      provider: {
        type: String,
        enum: ["google", "facebook", "email"]
      },
      providerId: String,
      linkedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true,
  }
);

// Hash password nếu bị thay đổi và có password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


// UserSchema.methods.SignAccessToken = function () {
//   return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
//       expiresIn: "24h"
//   });
// };
module.exports = mongoose.model("User", UserSchema, "users");
