const Banner = require('../models/Banner');
const Blog = require('../models/Blog');
const Promotion = require('../models/Promotion');

const marketingController = {
  // Banners
  getBanners: async (req, res) => {
    try {
      console.log('Fetching banners...');
      const banners = await Banner.find().populate('blog_id');
      console.log('Banners found:', banners.length);
      res.json(banners);
    } catch (err) {
      console.error('Error in getBanners:', err);
      res.status(500).json({ message: err.message });
    }
  },
  createBanner: async (req, res) => {
    try {
      const bannerData = {
        title: req.body.title,
        image_url: req.file?.path, // Get the Cloudinary URL from the uploaded file
        blog_id: req.body.blog_id || undefined,
        staff_id: req.user?._id
      };
      
      console.log('Creating banner with data:', bannerData);
      
      const banner = new Banner(bannerData);
      await banner.save();
      
      console.log('Banner created:', banner);
      
      res.status(201).json(banner);
    } catch (err) {
      console.error('Error creating banner:', err);
      res.status(400).json({ message: err.message });
    }
  },
  updateBanner: async (req, res) => {
    try {
      const updateData = {
        title: req.body.title,
        blog_id: req.body.blog_id || undefined
      };

      // Only update image_url if a new file is uploaded
      if (req.file?.path) {
        updateData.image_url = req.file.path;
      }

      console.log('Updating banner with data:', updateData);

      const banner = await Banner.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate('blog_id');

      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }

      console.log('Banner updated:', banner);

      res.json(banner);
    } catch (err) {
      console.error('Error updating banner:', err);
      res.status(400).json({ message: err.message });
    }
  },
  deleteBanner: async (req, res) => {
    try {
      await Banner.findByIdAndDelete(req.params.id);
      res.json({ message: 'Banner deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Blogs
  getBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find();
      res.json(blogs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  getBlogById: async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) return res.status(404).json({ message: 'Blog not found' });
      res.json(blog);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  createBlog: async (req, res) => {
    try {
      let { title, content, category, tags, status } = req.body;
      if (typeof tags === 'string') {
        tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
      const blogData = {
        title,
        content,
        category,
        tags,
        featured_image: req.file?.path,
        status: status || 'published',
        user_id: req.body.user_id || req.user._id
      };
      const blog = new Blog(blogData);
      await blog.save();
      res.status(201).json(blog);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  updateBlog: async (req, res) => {
    try {
      let { title, content, category, tags, status } = req.body;
      if (typeof tags === 'string') {
        tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
      
      const updateData = {
        title,
        content,
        category,
        tags,
        status: status || 'published'
      };

      // Only update featured_image if a new file is uploaded
      if (req.file?.path) {
        updateData.featured_image = req.file.path;
      }

      const blog = await Blog.findByIdAndUpdate(
        req.params.id, 
        updateData, 
        { new: true }
      );
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      res.json(blog);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  deleteBlog: async (req, res) => {
    try {
      await Blog.findByIdAndDelete(req.params.id);
      res.json({ message: 'Blog deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Promotions
  getPromotions: async (req, res) => {
    try {
      const promotions = await Promotion.find();
      res.json(promotions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  createPromotion: async (req, res) => {
    try {
      const promotionData = {
        ...req.body,
        created_by: req.user._id // Lấy từ token đã xác thực
      };
      const promotion = new Promotion(promotionData);
      await promotion.save();
      res.status(201).json(promotion);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  updatePromotion: async (req, res) => {
    try {
      const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(promotion);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  deletePromotion: async (req, res) => {
    try {
      await Promotion.findByIdAndDelete(req.params.id);
      res.json({ message: 'Promotion deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Blog count
  getBlogCount: async (req, res) => {
    try {
      const count = await Blog.countDocuments();
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  // Banner count
  getBannerCount: async (req, res) => {
    try {
      const count = await Banner.countDocuments();
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = marketingController;