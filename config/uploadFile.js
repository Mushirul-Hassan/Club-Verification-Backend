import cloudinary from "./cloudinary.js";

const uploadFileToCloudinary = async (file, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url); // Returns the clean web URL string
      },
    );

    uploadStream.end(file.buffer);
  });
};

export default uploadFileToCloudinary;
