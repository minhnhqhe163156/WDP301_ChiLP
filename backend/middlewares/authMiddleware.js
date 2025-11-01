const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = {
  // Verify token
  verifyToken: async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password"); // Exclude password and __v from the user object
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  },

  // Check role middleware
  checkRole: (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    };
  },

  // Specific role middlewares
  isAdmin: (req, res, next) => {
    authMiddleware.checkRole(["admin"])(req, res, next);
  },

  isStaff: (req, res, next) => {
    authMiddleware.checkRole(["marketing_staff", "admin"])(req, res, next);
  },

  isSeller: (req, res, next) => {
    authMiddleware.checkRole(["seller"])(req, res, next);
  },

  isCustomer: (req, res, next) => {
    authMiddleware.checkRole(["customer"])(req, res, next);
  },
  
  isMarketing: (req, res, next) => {
    authMiddleware.checkRole(["marketing_staff"])(req, res, next);
  }
};

module.exports = authMiddleware; 