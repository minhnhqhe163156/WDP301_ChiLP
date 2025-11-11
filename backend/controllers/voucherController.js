const Voucher = require('../models/Voucher');

// Helper: cập nhật trạng thái voucher hết hạn
async function autoExpireVouchers() {
  const now = new Date();
  await Voucher.updateMany(
    { end_date: { $lt: now }, status: { $ne: 'expired' } },
    { $set: { status: 'expired' } }
  );
}

exports.createVoucher = async (req, res) => {
  const { voucher_code, discount_value, discount_type, start_date, end_date, minimum_purchase, maximum_discount, usage_limit } = req.body;
  try {
    const voucher = new Voucher({
      voucher_code,
      discount_value,
      discount_type: discount_type || 'amount',
      start_date,
      end_date,
      minimum_purchase,
      maximum_discount,
      usage_limit,
      created_by: req.user._id,
    });
    await voucher.save();
    res.status(201).json({ success: true, voucher });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ success: false, message: 'Mã voucher đã tồn tại!' });
    }
    console.error('Voucher create error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getVouchers = async (req, res) => {
  try {
    await autoExpireVouchers();
    const vouchers = await Voucher.find().populate('created_by');
    res.json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateVoucher = async (req, res) => {
  const { id } = req.params;
  const { voucher_code, discount_value, start_date, end_date, minimum_purchase, maximum_discount, usage_limit } = req.body;
  try {
    const voucher = await Voucher.findById(id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }
    voucher.voucher_code = voucher_code;
    voucher.discount_value = discount_value;
    voucher.start_date = start_date;
    voucher.end_date = end_date;
    voucher.minimum_purchase = minimum_purchase;
    voucher.maximum_discount = maximum_discount;
    voucher.usage_limit = usage_limit;
    await voucher.save();
    res.json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.deleteVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    const voucher = await Voucher.findByIdAndDelete(id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }
    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.applyVoucher = async (req, res) => {
  const { voucher_code, order_total } = req.body;
  try {
    const voucher = await Voucher.findOne({ voucher_code, status: 'active' });
    if (!voucher) return res.status(404).json({ success: false, message: 'Invalid or expired voucher' });
    if (voucher.used_count >= voucher.usage_limit) return res.status(400).json({ success: false, message: 'Voucher usage limit reached' });
    if (order_total < voucher.minimum_purchase) return res.status(400).json({ success: false, message: 'Order total below minimum purchase' });
    voucher.used_count += 1;
    if (voucher.used_count >= voucher.usage_limit) voucher.status = 'used';
    await voucher.save();
    let discount = voucher.discount_value;
    if (voucher.discount_type === 'percent') {
      discount = Math.floor(Number(order_total) * voucher.discount_value / 100);
      if (voucher.maximum_discount) {
        discount = Math.min(discount, voucher.maximum_discount);
      }
    } else if (voucher.discount_type === 'amount') {
      discount = Math.min(voucher.discount_value, voucher.maximum_discount || voucher.discount_value);
    }
    res.json({ success: true, discount, voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Validate voucher code (không tăng used_count, chỉ kiểm tra hợp lệ)
exports.validateVoucher = async (req, res) => {
  const { voucher, order_total } = req.query;
  try {
    const found = await Voucher.findOne({ voucher_code: voucher, status: 'active' });
    if (!found) return res.status(404).json({ success: false, message: 'Voucher không hợp lệ hoặc đã hết hạn' });
    if (found.used_count >= found.usage_limit) return res.status(400).json({ success: false, message: 'Voucher đã hết lượt sử dụng' });
    const now = new Date();
    if (found.start_date && now < found.start_date) return res.status(400).json({ success: false, message: 'Voucher chưa bắt đầu' });
    if (found.end_date && now > found.end_date) return res.status(400).json({ success: false, message: 'Voucher đã hết hạn' });
    let discount = found.discount_value;
    if (found.discount_type === 'percent' && order_total) {
      discount = Math.floor(Number(order_total) * found.discount_value / 100);
      if (found.maximum_discount) {
        discount = Math.min(discount, found.maximum_discount);
      }
    } else if (found.discount_type === 'amount') {
      discount = Math.min(found.discount_value, found.maximum_discount || found.discount_value);
    }
    const totalAfterDiscount = Number(order_total) - discount;
    return res.json({
      success: true,
      data: {
        code: found.voucher_code,
        discount,
        totalAfterDiscount, // <-- thêm dòng này
        discount_type: found.discount_type,
        discount_value: found.discount_value,
        minimum_purchase: found.minimum_purchase,
        maximum_discount: found.maximum_discount,
        end_date: found.end_date,
        usage_left: found.usage_limit - found.used_count,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getVoucherCount = async (req, res) => {
  try {
    const count = await Voucher.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVoucherUsageStats = async (req, res) => {
  try {
    const { type = 'month', year, month, voucher_code } = req.query;
    let groupId = null;
    let match = {};
    const now = new Date();
    if (voucher_code) {
      match.voucher_code = voucher_code;
    }
    if (type === 'year') {
      groupId = { $year: '$updatedAt' };
      match.used_count = { $gt: 0 };
    } else if (type === 'month') {
      const y = parseInt(year) || now.getFullYear();
      groupId = { $month: '$updatedAt' };
      match.$expr = { $and: [
        { $eq: [{ $year: '$updatedAt' }, y] },
        { $gt: ['$used_count', 0] }
      ] };
    } else if (type === 'day') {
      const y = parseInt(year) || now.getFullYear();
      const m = parseInt(month) || now.getMonth() + 1;
      groupId = { $dayOfMonth: '$updatedAt' };
      match.$expr = { $and: [
        { $eq: [{ $year: '$updatedAt' }, y] },
        { $eq: [{ $month: '$updatedAt' }, m] },
        { $gt: ['$used_count', 0] }
      ] };
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
    const pipeline = [
      Object.keys(match).length ? { $match: match } : null,
      { $group: { _id: groupId, total: { $sum: '$used_count' } } },
      { $sort: { _id: 1 } }
    ].filter(Boolean);
    const stats = await Voucher.aggregate(pipeline);
    let labels = [];
    let counts = [];
    if (type === 'year') {
      labels = stats.map(s => s._id);
      counts = stats.map(s => s.total);
    } else if (type === 'month') {
      labels = Array.from({ length: 12 }, (_, i) => i + 1);
      const statMap = Object.fromEntries(stats.map(s => [s._id, s.total]));
      counts = labels.map(m => statMap[m] || 0);
    } else if (type === 'day') {
      const daysInMonth = new Date(year || now.getFullYear(), (month || now.getMonth() + 1), 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const statMap = Object.fromEntries(stats.map(s => [s._id, s.total]));
      counts = labels.map(d => statMap[d] || 0);
    }
    res.json({ labels, counts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getVoucherUsageDetail = async (req, res) => {
  try {
    await autoExpireVouchers();
    const vouchers = await Voucher.find({}, {
      voucher_code: 1,
      used_count: 1,
      usage_limit: 1,
      status: 1,
      discount_value: 1,
      start_date: 1,
      end_date: 1,
      maximum_discount: 1,
      minimum_purchase: 1,
      created_by: 1,
      _id: 0
    })
      .sort({ used_count: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};