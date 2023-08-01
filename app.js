const path = require("path");
const { v4: uuidv4 } = require("uuid");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const membersRoutes = require("./routes/members");
const eventsRoutes = require("./routes/events");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
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

const fileUploadMiddleware =  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
  { name: "file", maxCount: 1 },
  { name: "report", maxCount: 1 },  
])

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
//     { name: "file", maxCount: 1 },
//     { name: "report", maxCount: 1 },  
//   ])
// );

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/reports", express.static(path.join(__dirname, "reports")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/home", feedRoutes);
app.use("/auth", authRoutes);
app.use(membersRoutes);
app.use(eventsRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://nitish333:ritik1920@cluster0.spya7d3.mongodb.net/backend?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("connected");
    app.listen(8080);
  })
  .catch((err) => console.log(err));