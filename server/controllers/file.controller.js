const path = require("path");
const sharp = require("sharp");
const s3 = require("../config/s3");
const {
  DeleteObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const { uploadImageToS3 } = require("../services/uploadImageToS3");

const previewFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { originalname, buffer } = req.file;

    const ext = path.extname(originalname) || "jpg";
    const name = path
      .basename(originalname, path.extname(originalname))
      .toLowerCase()
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

    return res
      .status(201)
      .json({ message: "Image uploaded successfully!", fileKey: imageKey });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

const listImages = async (req, res) => {
  try {
    const folders = ["artists/", "albums/", "covers/", "mm/", "uploads/"];

    let allFiles = [];

    for (const folder of folders) {
      const command = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: folder,
      });

      const response = await s3.send(command);

      const files = (response.Contents || []).map((file) => {
        const fileName = file.Key.split("/").pop();

        return {
          fileName,
          folder: folder.replace(/\/$/, ""),
          fileKey: file.Key,
          fileSize: file.Size,
          fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
        };
      });

      allFiles = [...allFiles, ...files];
    }

    res.json(allFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { fileKey } = req.query;
    if (!fileKey) return res.status(400).json({ error: "Invalid fileKey" });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
      })
    );

    res.json({ message: "file deleted", fileKey });
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
