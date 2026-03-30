const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dherc6nup",
  api_key: "213773512474268",
  api_secret: "P-Yxzc4a2VmDFCIl_IoNeYXCOVY"
});

module.exports = cloudinary;