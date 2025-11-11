const Notification = require("../models/Notification");

// Tạo notification
exports.createNotification = async (req, res) => {
  try {
    const { user_id, role, type, title, message, link, data } = req.body;
    const notification = new Notification({
      user_id,
      role,
      type,
      title,
      message,
      link,
      data,
    });
    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Lấy danh sách notification (có phân trang)
exports.getNotifications = async (req, res) => {
  try {
    const { role, type, page = 1, limit = 20 } = req.query;
    const query = { user_id: req.user._id };
    if (role) query.role = role;
    if (type) query.type = type;
    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Notification.countDocuments(query);
    res.json({
      success: true,
      notifications,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });
    if (!notification)
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    notification.is_read = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { $set: { is_read: true } }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Xóa notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });
    if (!notification)
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
