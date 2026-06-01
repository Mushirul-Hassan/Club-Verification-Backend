import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error("Only png, jpg, jpeg, webp image files are allowed"),
      false,
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
});

export default upload;
