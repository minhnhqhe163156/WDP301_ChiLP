
const User = require('../models/User');
const bcrypt = require('bcryptjs');


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -__v -shop_rating');
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: err.message });
    }
}

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    // ID của người đang đăng nhập (admin hiện tại)
    const currentAdminId = req.user._id?.toString();

    // Cấm admin tự disable chính mình
    if (userId === currentAdminId && is_active === false) {
      return res.status(400).json({ message: "Bạn không thể vô hiệu hóa chính mình." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { is_active },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};


const changeOwnPassword = async (req, res) => {
  try {
    const adminId = req.user.id; // lấy từ verifyToken
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' });
    }

    const admin = await User.findById(adminId);
    if (!admin) return res.status(404).json({ message: 'Không tìm thấy admin.' });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    return res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ.', error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ["customer", "seller", "marketing_staff"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Vai trò không hợp lệ." });
    }

    const targetUser = await User.findById(userId);
    
    if (!targetUser) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật vai trò người dùng thành công.",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


module.exports = {
    getAllUsers,
    updateUserStatus,
    changeOwnPassword,
    updateUserRole,
};