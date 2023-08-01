const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "report") {
      cb(null, "reports");
    } else {
      cb(null, "images");
    }
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const fileUploadMiddleware = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).fields([
  { name: "file", maxCount: 1 },
  { name: "report", maxCount: 1 },
]);

module.exports = fileUploadMiddleware;
