const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true, // <-- XÓA HOẶC COMMENT DÒNG NÀY
  },
  title: String,
  image_url: String,
  blog_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
});

module.exports = mongoose.model("Banner", BannerSchema, "banners");
