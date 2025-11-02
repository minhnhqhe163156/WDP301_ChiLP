const Category = require('../models/category');

exports.createCategory = async (req, res) => {
  const { name } = req.body; 
  try {
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("🔥 createCategory error:", error); 
    res.status(500).json({ message: 'Lỗi server khi tạo danh mục' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find(); // Không filter, lấy tất cả
    res.json(categories);
  } catch (error) {
    console.error("🔥 getCategories error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },  // ✅ Đúng tên field trong schema
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error("🔥 updateCategory error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.deleteCategory = async (req, res) => {
  console.log("🧪 Deleting category ID:", req.params.id); // <-- THÊM DÒNG NÀY
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Xoá danh mục thành công' });
  } catch (error) {
    console.error("🔥 deleteCategory error:", error);
    res.status(500).json({ message: 'Lỗi server khi xoá danh mục' });
  }
};





