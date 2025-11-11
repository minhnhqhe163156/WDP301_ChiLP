const Brand = require("../models/Brand");

exports.getBrands = async (req, res) => {
  try {
    const banners = await Brand.find();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createBrands = async (req, res) => {
  const { logo, name } = req.body;
  try {
    const banner = new Brand({
      logo,
      name,
    });
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const deleted = await Brand.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
