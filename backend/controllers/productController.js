const Product = require("../models/Product");
const Category = require("../models/category");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.createProduct = async (req, res) => {
  const {
    product_name,
    category_id,
    description,
    price,
    quantity,
    size,
    color,
    brand,
    discount_price,
    is_featured,
    tags,
    specifications,
  } = req.body;
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    // Lấy link ảnh từ Cloudinary (multer-storage-cloudinary trả về trong req.files)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    }
    // Nếu imageUrls là chuỗi, chuyển thành mảng
    if (typeof imageUrls === 'string') {
      imageUrls = imageUrls.split(',').map(s => s.trim());
    }
    // Parse tags/specifications nếu là string
    let parsedTags = tags;
    let parsedSpecifications = specifications;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    }
    if (typeof specifications === "string") {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch {
        parsedSpecifications = {};
      }
    }
    const product = new Product({
      product_name,
      category_id,
      description,
      price,
      quantity,
      size,
      color,
      brand,
      discount_price,
      is_featured,
      tags: parsedTags,
      specifications: parsedSpecifications,
      seller_id: req.user._id,
      imageurl: imageUrls,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    console.log("Fetching products...");

    // Populate category_id (name) và seller_id (name, email, shop_name)
    const products = await Product.find()
      .populate('category_id', 'name')
      .populate('seller_id', 'name email shop_name')
      .lean();
    console.log(`Found ${products.length} products`);

    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
      .populate("seller_id", "name email shop_name");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Kiểm tra quyền sửa
    if (
      product.seller_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Xử lý ảnh (giữ ảnh cũ nếu không upload ảnh mới)
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    } else if (req.body.imageurl) {
      if (typeof req.body.imageurl === "string") {
        imageUrls = [req.body.imageurl];
      } else if (Array.isArray(req.body.imageurl)) {
        imageUrls = req.body.imageurl;
      }
    } else {
      imageUrls = product.imageurl; // giữ ảnh cũ
    }

    // Parse tags nếu cần
    let parsedTags = req.body.tags;
    if (typeof parsedTags === "string") {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch {
        parsedTags = [];
      }
    }

    // Parse specifications nếu cần
    let parsedSpecifications = req.body.specifications;
    if (typeof parsedSpecifications === "string") {
      try {
        parsedSpecifications = JSON.parse(parsedSpecifications);
      } catch {
        parsedSpecifications = {};
      }
    }

    // Cập nhật các field
    product.product_name = req.body.product_name || product.product_name;
    product.category_id = req.body.category_id || product.category_id;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.quantity = req.body.quantity || product.quantity;
    product.size = req.body.size || product.size;
    product.color = req.body.color || product.color;
    product.brand = req.body.brand || product.brand;
    product.discount_price = req.body.discount_price || product.discount_price;
    product.is_featured = req.body.is_featured ?? product.is_featured;
    product.tags = parsedTags;
    product.specifications = parsedSpecifications;
    product.imageurl = imageUrls;
    product.updated_at = new Date();

    const updated = await product.save();

    res.json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (
      product.seller_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.testConnection = async (req, res) => {
  try {
    console.log("Testing database connection...");

    // Test basic database connection
    const dbState = mongoose.connection.readyState;
    console.log("Database state:", dbState);

    // Test if models are registered
    const models = mongoose.modelNames();
    console.log("Registered models:", models);

    // Test basic queries
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const userCount = await User.countDocuments();

    res.json({
      message: "Database connection test",
      dbState: dbState,
      registeredModels: models,
      counts: {
        products: productCount,
        categories: categoryCount,
        users: userCount,
      },
    });
  } catch (error) {
    console.error("Test connection error:", error);
    res.status(500).json({
      message: "Test failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// API: GET /products/suggestions?query=giay
exports.getKeywordSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !query.trim()) {
      return res.json([]);
    }
    // Tìm các sản phẩm có tên gần giống query, chỉ lấy tên, không lấy toàn bộ sản phẩm
    const regex = new RegExp(query, "i");
    const products = await Product.find({ product_name: regex })
      .limit(10)
      .select("product_name -_id");
    // Trả về mảng tên sản phẩm (loại bỏ trùng lặp)
    const names = [...new Set(products.map((p) => p.product_name))];
    res.json(names);
  } catch (error) {
    console.error("Get keyword suggestions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
