const Banner = require('../models/Banner');

exports.createBanner = async (req, res) => {
  try {
    const banner = new Banner({
      title: req.body.title,
      image_url: req.file?.path, // Cloudinary URL
      blog_id: req.body.blog_id || undefined,
      staff_id: req.user._id
    });
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().populate('blog_id');
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      blog_id: req.body.blog_id,
    };
    // If a new image is uploaded, update image_url
    if (req.file && req.file.path) {
      updateData.image_url = req.file.path;
    }
    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Banner not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};