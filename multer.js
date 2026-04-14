const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudConfig");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CarRental",
    allowed_formats: ["jpg", "png", "jpeg", "webp"] 
  }
});

const upload = multer({ storage });

module.exports = upload;