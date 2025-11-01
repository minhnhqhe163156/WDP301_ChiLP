const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinaryConfig"); // Assuming you have a cloudinary config file
const PasswordResetToken = require("../models/PasswordResetToken");
const LoginOTP = require("../models/LoginOTP");
const { sendMailOTP, sendLoginOTP } = require("../utils/sendMail");
// const LoginHistory = require("../models/LoginHistory");
const useragent = require("useragent");
const geoip = require("geoip-lite");

const authController = {
  // Register function
  register: async (req, res) => {
    try {
      const { email, password, name, role } = req.body;

        // Validate input
        const usernameRegex = /^[a-zA-Z0-9]{4,30}$/;
        if (!usernameRegex.test(name)) {
          return res.status(400).json({ message: 'Username phải từ 4-30 ký tự, không chứa ký tự đặc biệt' });
        }
        if (!email.endsWith('@gmail.com')) {
          return res.status(400).json({ message: 'Email phải có đuôi @gmail.com' });
        }
        if (!password || password.length > 20) {
          return res.status(400).json({ message: 'Password tối đa 20 ký tự' });
        }
        
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Create new user
      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        role,
        is_active: true,
        picture_avatar: null,
      });

      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: error.message });
    }
  },

  // Updated Login function
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password là bắt buộc" });
      }

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User không tìm thấy" });
      }

      // Nếu user không có password (tài khoản Google)
      if (!user.password) {
        return res
          .status(400)
          .json({ message: "Tài khoản này chỉ có thể đăng nhập bằng Google" });
      }

      // Check if user is active
      if (user.is_active === false) {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa "});
      }

      // Verify password with bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Sai mật khẩu" });
      }

      // Check if user is active (assuming isActiveUser function exists)
      if (user.is_active === false) {
        return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hóa" });
      }

      // Create token
      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "2d" } // 2 days
      );

      // Cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        path: "/",
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      };

      // Set cookies
      res.cookie("token", token, cookieOptions);
      res.cookie(
        "userInfo",
        JSON.stringify({
          _id: user._id,
          name: user.fullname || user.name,
          role: user.role,
        }),
        cookieOptions
      );

      // // Ghi log lịch sử đăng nhập
      // try {
      //   const agent = useragent.parse(req.headers["user-agent"]);
      //   const ip = req.headers["x-forwarded-for"] || req.ip;
      //   const geo = geoip.lookup(ip);
      //   await LoginHistory.create({
      //     userId: user._id,
      //     ip,
      //     device: agent.toString(),
      //     location: geo
      //       ? `${geo.city || ""}, ${geo.region || ""}, ${geo.country || ""}`.replace(/^, |, $/g, "")
      //       : "Unknown",
      //   });
      // } catch (logErr) {
      //   console.error("Không thể ghi lịch sử đăng nhập:", logErr);
      // }

      return res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: {
          _id: user._id,
          name: user.fullname || user.name,
          role: user.role,
          email: user.email,
          picture_avatar: user.picture_avatar,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      // Clear the cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        path: "/",
      };

      res.clearCookie("token", cookieOptions);
      res.clearCookie("userInfo", cookieOptions);

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { name, email, picture_avatar, is_active, password } = req.body;
      const userId = req.user.id;
      // Validate input
      if (!name || !email || !picture_avatar) {
        return res
          .status(400)
          .json({ message: "Name, email, picture_avatar are required" });
      }
      const updatedPictureAvatar = await cloudinary.uploader.upload(
        picture_avatar
      );
        // Validate name: only letters (allow spaces if needed)
    const nameRegex = /^[\p{L}\s]+$/u;
    if (!nameRegex.test(name)) {
      return res
        .status(400)
        .json({ message: "Name must contain only letters and spaces" });
    }
      // Find user and update
      const user = await User.findByIdAndUpdate(
        userId,
        { name, picture_avatar: updatedPictureAvatar.secure_url },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Return updated user info
      const updatedUser = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture_avatar: user.picture_avatar,
      };
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  checkAuth: async (req, res) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      req.user = decoded;

      res.status(200).json({ message: "Token is valid", user: req.user });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  },

  // Get current user info
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userInfo = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture_avatar: user.picture_avatar,
      };

      res.status(200).json(userInfo);
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Lấy danh sách địa chỉ giao hàng
  getAddresses: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user.address || []);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Thêm địa chỉ mới
  addAddress: async (req, res) => {
    try {
      const { name, phone, address, isDefault } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (isDefault) {
        user.address.forEach(addr => addr.isDefault = false);
      }
      user.address.push({ name, phone, address, isDefault: !!isDefault });
      await user.save();
      res.status(201).json(user.address);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Sửa địa chỉ
  updateAddress: async (req, res) => {
    try {
      const { name, phone, address, isDefault } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const addr = user.address.id(req.params.addressId);
      if (!addr) return res.status(404).json({ message: "Address not found" });

      if (isDefault) {
        user.address.forEach(a => a.isDefault = false);
      }
      addr.name = name;
      addr.phone = phone;
      addr.address = address;
      addr.isDefault = !!isDefault;
      await user.save();
      res.json(user.address);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Xóa địa chỉ
  deleteAddress: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.address.id(req.params.addressId).remove();
      await user.save();
      res.json(user.address);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.address.forEach(addr => addr.isDefault = false);
      const addr = user.address.id(req.params.addressId);
      if (!addr) return res.status(404).json({ message: "Address not found" });
      addr.isDefault = true;
      await user.save();
      res.json(user.address);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Thêm hàm đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const userId = req.user._id; // hoặc req.user.id tùy JWT
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Kiểm tra nếu user là Google (có googleId), không cho đổi mật khẩu
      if (user.googleId) {
        return res.status(400).json({ message: "Tài khoản Google không thể đổi mật khẩu!" });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

      // Đổi mật khẩu
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Thêm API lấy lịch sử đăng nhập
  getLoginHistory: async (req, res) => {
    try {
      const userId = req.user._id;
      const history = await LoginHistory.find({ userId }).sort({ time: -1 }).limit(20);
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Gửi OTP quên mật khẩu
  sendResetOTP: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Email không tồn tại" });

      // Tạo OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu OTP vào DB, hết hạn sau 10 phút
      await PasswordResetToken.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      });

      // Gửi email OTP
      await sendMailOTP(email, otp);

      res.json({ message: "OTP đã được gửi về email" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Xác thực OTP và đổi mật khẩu
  resetPasswordWithOTP: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const tokenDoc = await PasswordResetToken.findOne({ email, otp });

      if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
      }

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Đổi mật khẩu
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      // Xóa OTP sau khi dùng
      await PasswordResetToken.deleteMany({ email });

      res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Kiểm tra email và tự động gửi OTP (hỗ trợ cả Google và email)
  checkEmailAndSendOTP: async (req, res) => {
    try {
      console.log("=== DEBUG: checkEmailAndSendOTP ===");
      const { email } = req.body;
      console.log("Email received:", email);
      
      // Kiểm tra email tồn tại
      const user = await User.findOne({ email });
      console.log("User found:", user ? "Yes" : "No");
      
      if (!user) {
        return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
      }

      // Kiểm tra tài khoản có bị khóa không
      if (user.is_active === false) {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa" });
      }

      // Kiểm tra có cho phép đăng nhập OTP không (mặc định là true)
      if (user.allowOTPLogin === false) {
        return res.status(403).json({ message: "Tài khoản này không hỗ trợ đăng nhập bằng OTP" });
      }

      // Xác định loại tài khoản
      let accountType = "email";
      if (user.googleId && user.password) {
        accountType = "linked"; // Tài khoản đã liên kết
      } else if (user.googleId && !user.password) {
        accountType = "google"; // Chỉ tài khoản Google
      }
      console.log("Account type:", accountType);

      // Tạo OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated OTP:", otp);

      // Lấy thông tin thiết bị
      const agent = useragent.parse(req.headers["user-agent"]);
      const ip = req.headers["x-forwarded-for"] || req.ip;
      const geo = geoip.lookup(ip);

      const deviceInfo = {
        browser: agent.toString(),
        ip: ip,
        location: geo ? `${geo.city || ""}, ${geo.region || ""}, ${geo.country || ""}`.replace(/^, |, $/g, "") : "Unknown"
      };

      // Xóa OTP cũ nếu có
      await LoginOTP.deleteMany({ email, isUsed: false });
      console.log("Deleted old OTPs");

      // Lưu OTP mới vào DB, hết hạn sau 5 phút
      const newOTP = await LoginOTP.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
        deviceInfo,
        accountType
      });
      console.log("Saved new OTP:", newOTP._id);

      // Gửi email OTP
      await sendLoginOTP(email, otp, deviceInfo, accountType);
      console.log("Email sent successfully");

      res.json({ 
        message: "OTP đã được gửi về email của bạn",
        email: email,
        accountType: accountType
      });
    } catch (err) {
      console.error("Send OTP error:", err);
      res.status(500).json({ message: "Có lỗi xảy ra khi gửi OTP: " + err.message });
    }
  },

  // Xác thực OTP đăng nhập (hỗ trợ cả Google và email)
  verifyLoginOTP: async (req, res) => {
    try {
      console.log("=== DEBUG: verifyLoginOTP ===");
      const { email, otp } = req.body;
      console.log("Email:", email, "OTP:", otp);
      
      // Kiểm tra OTP
      const tokenDoc = await LoginOTP.findOne({ 
        email, 
        otp, 
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });
      console.log("Token doc found:", tokenDoc ? "Yes" : "No");

      if (!tokenDoc) {
        return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
      }

      // Lấy thông tin user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Đánh dấu OTP đã sử dụng
      tokenDoc.isUsed = true;
      await tokenDoc.save();
      console.log("OTP marked as used");

      // Tạo JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "2d" }
      );

      // Cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        path: "/",
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      };

      // Set cookies
      res.cookie("token", token, cookieOptions);
      res.cookie(
        "userInfo",
        JSON.stringify({
          _id: user._id,
          name: user.fullname || user.name,
          role: user.role,
        }),
        cookieOptions
      );

      console.log("Login successful for user:", user.email);

      return res.status(200).json({
        message: "Đăng nhập thành công",
        token,
        user: {
          _id: user._id,
          name: user.fullname || user.name,
          role: user.role,
          email: user.email,
          picture_avatar: user.picture_avatar,
          accountType: user.accountType
        },
      });
    } catch (err) {
      console.error("Verify OTP error:", err);
      res.status(500).json({ message: "Có lỗi xảy ra khi xác thực OTP: " + err.message });
    }
  },

  // Liên kết tài khoản Google với tài khoản email hiện có
  linkGoogleAccount: async (req, res) => {
    try {
      const { email, googleId, googleName, googlePicture } = req.body;
      const userId = req.user.id;

      // Kiểm tra user có quyền liên kết không
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Kiểm tra email có khớp với user hiện tại không
      if (currentUser.email !== email) {
        return res.status(403).json({ message: "Email không khớp với tài khoản hiện tại" });
      }

      // Kiểm tra Google ID đã được sử dụng chưa
      const existingGoogleUser = await User.findOne({ googleId });
      if (existingGoogleUser && existingGoogleUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Tài khoản Google này đã được liên kết với tài khoản khác" });
      }

      // Cập nhật thông tin liên kết
      currentUser.googleId = googleId;
      currentUser.accountType = "linked";
      currentUser.picture_avatar = googlePicture || currentUser.picture_avatar;
      
      // Thêm vào danh sách tài khoản đã liên kết
      currentUser.linkedAccounts.push({
        provider: "google",
        providerId: googleId,
        linkedAt: new Date()
      });

      await currentUser.save();

      res.json({ 
        message: "Liên kết tài khoản Google thành công",
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          accountType: currentUser.accountType,
          picture_avatar: currentUser.picture_avatar
        }
      });
    } catch (err) {
      console.error("Link Google account error:", err);
      res.status(500).json({ message: "Có lỗi xảy ra khi liên kết tài khoản" });
    }
  },

  // Hủy liên kết tài khoản Google
  unlinkGoogleAccount: async (req, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await User.findById(userId);

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Kiểm tra có password không (để đảm bảo vẫn có thể đăng nhập)
      if (!currentUser.password) {
        return res.status(400).json({ message: "Không thể hủy liên kết vì tài khoản không có mật khẩu" });
      }

      // Hủy liên kết
      currentUser.googleId = null;
      currentUser.accountType = "email";
      currentUser.linkedAccounts = currentUser.linkedAccounts.filter(
        account => account.provider !== "google"
      );

      await currentUser.save();

      res.json({ 
        message: "Hủy liên kết tài khoản Google thành công",
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          accountType: currentUser.accountType
        }
      });
    } catch (err) {
      console.error("Unlink Google account error:", err);
      res.status(500).json({ message: "Có lỗi xảy ra khi hủy liên kết tài khoản" });
    }
  },
  // Get total user count
  getUserCount: async (req, res) => {
    try {
      const count = await User.countDocuments();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user registration statistics
  getRegistrationStats: async (req, res) => {
    try {
      const { type = 'month', year, month } = req.query;
      let groupId = null;
      let match = {};
      const now = new Date();
      if (type === 'year') {
        groupId = { $year: '$createdAt' };
      } else if (type === 'month') {
        const y = parseInt(year) || now.getFullYear();
        groupId = { $month: '$createdAt' };
        match = { $expr: { $eq: [{ $year: '$createdAt' }, y] } };
      } else if (type === 'day') {
        const y = parseInt(year) || now.getFullYear();
        const m = parseInt(month) || now.getMonth() + 1;
        groupId = { $dayOfMonth: '$createdAt' };
        match = { $expr: { $and: [
          { $eq: [{ $year: '$createdAt' }, y] },
          { $eq: [{ $month: '$createdAt' }, m] }
        ] } };
      } else {
        return res.status(400).json({ message: 'Invalid type' });
      }
      const pipeline = [
        Object.keys(match).length ? { $match: match } : null,
        { $group: { _id: groupId, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ].filter(Boolean);
      const stats = await User.aggregate(pipeline);
      let labels = [];
      let counts = [];
      if (type === 'year') {
        labels = stats.map(s => s._id);
        counts = stats.map(s => s.count);
      } else if (type === 'month') {
        labels = Array.from({ length: 12 }, (_, i) => i + 1);
        const statMap = Object.fromEntries(stats.map(s => [s._id, s.count]));
        counts = labels.map(m => statMap[m] || 0);
      } else if (type === 'day') {
        const daysInMonth = new Date(year || now.getFullYear(), (month || now.getMonth() + 1), 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const statMap = Object.fromEntries(stats.map(s => [s._id, s.count]));
        counts = labels.map(d => statMap[d] || 0);
      }
      res.json({ labels, counts });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};


module.exports = authController;