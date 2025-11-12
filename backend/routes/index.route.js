const authRoute = require("./auth.Routes.js");
const productRoute = require("./product.Routes.js");
const orderRoutes = require("./order.Routes.js");
const paymentRoutes = require("./payment.route.js");
const feedbackRoutes = require("./feedback.Routes.js");
const reviewRoutes = require("./review.Routes.js");
const notificationRoutes = require("./notificationRoutes.js");
const promotionRoutes = require("./promotion.Routes.js");
const voucherRoutes = require("./voucher.Routes.js");
const cartRoutes = require("./cart.Routes.js");
const wishlistRoutes = require("./wishlistRoutes");
const shippingRoutes = require("./shipping.Routes.js");
const statisticsRoutes = require("./statistics.Routes.js");
const categoryRoutes = require("./category.Routes.js");
const marketingRoutes = require("./marketing.Routes.js");
const brandRoutes = require("./brand.Routes.js");
const chatRoute = require("./chat.route");
const adminRoutes = require("./admin.Routes.js");
const BlogRoutes = require("./blog.Routes.js");
const BannerRoutes = require("./banner.Routes.js");
const rateLimit = require("express-rate-limit");
// const CategoriesRoutes = require("./categories.route");

const initRoutes = (app) => {
  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 200, // Limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later",
  });
  app.get("/", (req, res) => {
    res.send("Pace Up API is running🚀🚀🚀...");
  });

  // Routes

  app.use("/api/chat", apiLimiter);
  app.use("/api/chat", chatRoute);

  app.use("/api/auth", apiLimiter, authRoute);
  app.use("/api/products", productRoute);
  app.use("/api/orders", apiLimiter, orderRoutes); // Áp dụng rate limiting cho order routes
  app.use("/api/payment", paymentRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/review", reviewRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/promotions", promotionRoutes);
  app.use("/api/vouchers", voucherRoutes);
  app.use("/api/cart", apiLimiter, cartRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/shipping", shippingRoutes);
  app.use("/api/statistics", statisticsRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/categories", categoryRoutes);

  app.use("/api/admin", adminRoutes);
  // app.use("/api/users", userRoutes);
  app.use("/api/marketing", marketingRoutes); // This will handle both blogs and banners
  // Apply rate limiting to all API routes
};

module.exports = initRoutes;
