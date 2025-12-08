const { Router } = require("express");
const router = Router();
const multerUpload = require("../middlewares/multer.middleware");
const {
  previewFile,
  uploadFile,
  deleteFile,
  listImages,
} = require("../controllers/file.controller");

router.post("/preview", multerUpload.single("image"), previewFile);
router.post("/upload", multerUpload.single("image"), uploadFile);

router.get("/images", listImages);

router.delete("/delete", deleteFile);

module.exports = router;
