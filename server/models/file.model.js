const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    fileUrl: String,
    fileSize: Number,
    fileKey: String,
  },
  { collection: "mm-images", timestamps: true }
);

module.exports = mongoose.model("Image", fileSchema);
