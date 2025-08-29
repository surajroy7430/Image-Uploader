const mime = require("mime-types");
const { uploadToS3, checkIfExistsInS3 } = require("../utils/s3Handlers");

const fileUrl = (key) => {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

const uploadImageToS3 = async ({ filePath, s3Key, checkExits }) => {
  if (!filePath || !s3Key) return null;

  try {
    const mimetype =
      mime.lookup(filePath.originalname) || "application/octet-stream";

    if (checkExits) {
      const exists = await checkIfExistsInS3(s3Key);
      if (exists) return { exists: true, fileUrl: fileUrl(s3Key) };

      await uploadToS3({ body: filePath.buffer, key: s3Key, mimetype });
      return { exists: false, fileUrl: fileUrl(s3Key) };
    } else {
      await uploadToS3({ body: filePath.buffer, key: s3Key, mimetype });
      return { exists: false, fileUrl: fileUrl(s3Key) };
    }
  } catch (error) {
    console.error("Error uploading cover image:", error.message);
    return null;
  }
};

module.exports = { uploadImageToS3 };
