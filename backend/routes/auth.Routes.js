const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get(
  "/current-user",
  authMiddleware.verifyToken,
  authController.getCurrentUser
);
// Địa chỉ giao hàng
router.get(
  "/addresses",
  authMiddleware.verifyToken,
  authController.getAddresses
);
router.post(
  "/addresses",
  authMiddleware.verifyToken,
  authController.addAddress
);
router.put(
  "/addresses/:addressId",
  authMiddleware.verifyToken,
  authController.updateAddress
);
router.delete(
  "/addresses/:addressId",
  authMiddleware.verifyToken,
  authController.deleteAddress
);
router.patch(
  "/addresses/:addressId/default",
  authMiddleware.verifyToken,
  authController.setDefaultAddress
);
router.post("/logout", authController.logout);
router.put(
  "/update-profile",
  authMiddleware.verifyToken,
  authController.updateProfile
);
router.post("/change-password", authMiddleware.verifyToken, authController.changePassword);
router.get("/check", authMiddleware.verifyToken, authController.checkAuth);
router.get("/count", authController.getUserCount);
router.get("/registration-stats", authController.getRegistrationStats);

// Đăng nhập với Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Xử lý callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Đảm bảo name được encode đúng UTF-8
    const userName = req.user.name || req.user.displayName || "User";
    console.log("[Google Callback] req.user:", req.user); // Thêm log chi tiết
    console.log("[Google Callback] Original name:", userName);

    // Tạo JWT cho user, trả về cả name
    const token = jwt.sign(
      {
        id: req.user._id,
        role: req.user.role,
        name: userName,
        email: req.user.email,
        picture_avatar: req.user.picture_avatar,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "2d" }
    );

    console.log("[Google Callback] JWT payload name:", userName);

    // Redirect về FE kèm token trên URL
    res.redirect(
      `https://localhost:5173/loginandregister?googleLogin=success&token=${token}` +
        `&name=${encodeURIComponent(userName)}` +
        `&email=${encodeURIComponent(req.user.email || "")}` +
        `&picture_avatar=${encodeURIComponent(req.user.picture_avatar || "")}`
    );
  }
);

// Add more routes as needed, e.g., for protected routes
module.exports = router;
