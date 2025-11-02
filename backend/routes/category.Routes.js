const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/Category.controller");
const authMiddleware = require("../middlewares/authMiddleware");

// Tạo mới
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  categoryController.createCategory
);

// Lấy tất cả
router.get("/", categoryController.getCategories);

// Cập nhật
router.put("/:id", categoryController.updateCategory);

// ❗Đặt DELETE TRƯỚC khi export
router.delete("/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, categoryController.deleteCategory);

// ✅ Xuất sau khi đã khai báo đầy đủ
module.exports = router;
