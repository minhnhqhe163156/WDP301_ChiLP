const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
  logo: [{
    type: String,
    required: true,
  }],
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Brand", BrandSchema, "brands"); // 'blogs' is the collection name in MongoDB
