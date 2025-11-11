const Blog = require('../models/Blog');

exports.createBlog = async (req, res) => {
  try {
    // Parse tags nếu là string
    let { title, content, category, tags, status } = req.body;
    if (typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    const blogData = {
      title,
      content,
      category,
      tags,
      status: status || 'published',
      featured_image: req.file?.path, // Lưu link ảnh cloudinary
      user_id: req.user._id,
    };
    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('user_id');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    let { title, content, category, tags, status } = req.body;
    // Parse tags nếu là string
    if (typeof tags === 'string') {
      tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    const updateData = {
      title,
      content,
      category,
      tags,
      status,
    };
    // Nếu có ảnh mới thì cập nhật
    if (req.file && req.file.path) {
      updateData.featured_image = req.file.path;
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedBlog) return res.status(404).json({ message: 'Blog not found' });
    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};