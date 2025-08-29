const s3 = require("../config/s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { HeadObjectCommand } = require("@aws-sdk/client-s3");

const uploadToS3 = async ({ body, key, mimetype }) => {
  const parallelUpload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: body,
      Key: key,
      ContentType: mimetype,
    },
  });

  parallelUpload.on("httpUploadProgress", (progress) => {
    console.log("Upload Progress:", progress.Key);
  });

  await parallelUpload.done();
};

const checkIfExistsInS3 = async (key) => {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
};

module.exports = { uploadToS3, checkIfExistsInS3 };
