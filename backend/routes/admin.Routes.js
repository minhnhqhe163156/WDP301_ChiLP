const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const adminController = require("../controllers/admin.Controller");
const statisticsController = require("../controllers/adminStatistics.controller");


router.get(
  "/users",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  adminController.getAllUsers
);
router.patch(
  "/users/:userId/status",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  adminController.updateUserStatus
);

router.patch(
  "/users/:userId/role",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  adminController.updateUserRole
);


router.patch(
  "/change-password",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  adminController.changeOwnPassword
);

router.get(
  "/statistics/revenue",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  statisticsController.getRevenueStats
);

router.get(
  "/statistics/orders",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  statisticsController.getOrderStats
);

router.get(
  "/statistics/category",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  statisticsController.getProductCategoryStats
);



module.exports = router;
