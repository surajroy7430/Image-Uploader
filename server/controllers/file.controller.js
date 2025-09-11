const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const s3 = require("../config/s3");
const Image = require("../models/file.model");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { uploadImageToS3 } = require("../services/uploadImageToS3");

const previewFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { originalname, buffer } = req.file;

    const ext = path.extname(originalname) || "jpg";
    const name = path
      .basename(originalname, path.extname(originalname))
      .replace(/\s*\(.*?\)|\s*\[.*?\]|\s*\{.*?\}/g, "") // remove brackets data
      .replace(/[\s_,]+/g, "-") // replace spaces/commas/underscores with "-"
      .replace(/-+/g, "-") // collapse multiple dashes
      .trim();

    const { width, height } = await sharp(buffer).metadata();

    const imageKey = `uploads/${name}-${width}x${height}${ext}`;

    res
      .status(200)
      .json({ message: "Preview Ready", imageKey, size: buffer.length });
  } catch (error) {
    console.error("Preview failed:", error);
    res.status(500).json({ error: "Preview failed" });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { imageKey } = req.body;
    if (!imageKey)
      return res.status(400).json({ error: "imageKey is missing" });

    // ----------- check db for duplication----------
    const isFileExists = await Image.findOne({ fileKey: imageKey });
    if (isFileExists) {
      return res.status(409).json({ error: "File exists in db" });
    }

    // ----------- check s3 for duplication----------
    const result = await uploadImageToS3({
      filePath: req.file,
      s3Key: imageKey,
      checkExits: true,
    });

    if (result?.exists) {
      return res.status(409).json({
        error: "File already exists in bucket",
        fileUrl: result.fileUrl,
      });
    }

    const image = await Image.create({
      fileKey: imageKey,
      fileUrl: result.fileUrl,
      fileSize: req.file.buffer.length,
    });

    res
      .status(201)
      .json({ message: "Image uploaded successfully!", fileId: image._id });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

const listImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined")
      return res.status(400).json({ error: "Invalid ID" });

    const image = await Image.findById(id);
    if (!image) return res.status(400).json({ error: "Image not found" });

    if (image.fileKey) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.fileKey,
        })
      );
    }

    await Image.findByIdAndDelete(id);

    res.json({ message: "file deleted", image });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error deleting file" });
  }
};

module.exports = {
  previewFile,
  uploadFile,
  listImages,
  deleteFile,
};
