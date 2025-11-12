const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin", "marketing_staff"]),
  brandController.createBrands
);
router.get("/", brandController.getBrands);

module.exports = router;
