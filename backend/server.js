const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const initRoutes = require("./routes/index.route");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { uploadErrorHandler } = require("./middlewares/errorHandle.middleware");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const initSocketServer = require("./utils/socket.chat");
const { redisHealthCheck } = require("./middlewares/cache.middleware");
const fs = require("fs");
const https = require("https");
const { setupArchiveSchedule } = require("./utils/chat-archive-system");
require("dotenv").config();
const DBConnect = require("./config/mongo.js");
const session = require('express-session');
const passport = require('passport');
require('./config/passport.js');
const app = express();
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
  // passphrase: "khanh",
};
const server = https.createServer(
  {
    key: fs.readFileSync("./cert/key.pem"),
    cert: fs.readFileSync("./cert/cert.pem"),
  },
  app
);

// Middleware
app.use(
  cors({
    origin: "https://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Thêm middleware để xử lý UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
DBConnect();
// Khởi tạo socket.io
const io = initSocketServer(server);
// Middleware để truyền io instance qua req
app.use((req, res, next) => {
  req.io = io;
  next();
});

initRoutes(app);
// Redis health check middleware
app.use(redisHealthCheck);

// Serve uploads directory for local file storage (as fallback)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((err, req, res, next) => {
  console.error(err.stack);

  // First apply the upload error handler
  uploadErrorHandler(err, req, res, next);

  // If the error wasn't handled by uploadErrorHandler, handle it here
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});
// Start message archiving scheduler if enabled
if (process.env.ENABLE_MESSAGE_ARCHIVING === "true") {
  // Lấy cấu hình từ biến môi trường
  const archiveInterval = parseInt(process.env.ARCHIVE_DAYS_OLD || "90");
  const cronSchedule = process.env.ARCHIVE_CRON_SCHEDULE || "0 3 * * 0";

  // Thiết lập lịch lưu trữ
  setupArchiveSchedule({
    daysOld: archiveInterval,
    cronSchedule: cronSchedule,
  });
}
// Bật schedule archive messages tự động
setupArchiveSchedule({ daysOld: 30, cronSchedule: '0 0 * * *' }); // Mỗi ngày lúc 0h archive tin nhắn cũ hơn 30 ngày
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    charset: 'utf8mb4',
    collation: { locale: 'vi' }
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
  DBConnect();
  console.log("Database connected");
});

const paymentRoutes = require('./routes/payment.route');
app.use('/api/payment', paymentRoutes);

app.use('/api', require('./routes/banner.Routes'));
