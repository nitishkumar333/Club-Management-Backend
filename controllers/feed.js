const { validationResult } = require("express-validator/check");
const fs = require("fs");
const path = require("path");

const Members = require("../models/members.js");
const Society = require("../models/society");
const User = require("../models/users.js");
const Events = require("../models/events.js");

exports.getSocieties = (req, res, next) => {
  Society.find({ creator: req.userId })
    .then((societies) => {
      res.status(200).json({
        message: "Fetched societies successfully.",
        societies: societies,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSocietiesCount = (req, res, next) => {
  Society.countDocuments()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getBarGraphData = (req, res, next) => {
  Events.find().select("department -_id")
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAreaGraphData = (req, res, next) => {
  Events.find().select("date -_id")
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createSociety = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  if (!req.files && !req.files.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.files.file[0].path;
  const societyName = req.body.society;
  const department = req.body.department;
  const tagline = req.body.tagline;
  let creator;
  const society = new Society({
    society: societyName,
    department: department,
    tagline: tagline,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  society
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.societies.push(society);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Society created successfully!",
        society: society,
        creator: { _id: creator._id, name: creator.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSociety = (req, res, next) => {
  const societyId = req.params.societyId;
  Society.findById(societyId)
    .then((society) => {
      if (!society) {
        const error = new Error("Could not find society.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Society fetched.", society: society });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateSociety = (req, res, next) => {
  const societyId = req.params.societyId;
  const societyName = req.body.society;
  const department = req.body.department;
  const tagline = req.body.tagline;
  let imageUrl = req.body.file;
  if (req.files.file) {
    imageUrl = req.files.file[0].path;
  }
  if (!imageUrl) {
    const error = new Error("No file found!!");
    error.statusCode = 422;
    throw error;
  }
  Society.findById(societyId)
    .then((society) => {
      if (!society) {
        const error = new Error("Could not find society.");
        error.statusCode = 404;
        throw error;
      }
      if (society.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== society.imageUrl) {
        clearImage(society.imageUrl);
      }
      society.society = societyName;
      society.imageUrl = imageUrl;
      society.department = department;
      society.tagline = tagline;
      return society.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Society Updated!!", society: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteSociety = (req, res, next) => {
  const societyId = req.params.societyId;
  let membersIds;
  Society.findById(societyId)
    .then((society) => {
      if (!society) {
        const error = new Error("Could not find society.");
        err.statusCode = 404;
        throw error;
      }
      if (society.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      clearImage(society.imageUrl);
      return Society.findByIdAndRemove(societyId);
    })
    .then((result) => {
      membersIds = result.members;
      return Members.find({ ofSociety: societyId }).select({
        imageUrl: 1,
        _id: 0,
      });
    })
    .then((result) => {
      result.map((obj) => {
        clearImage(obj.imageUrl);
      });
      return Members.deleteMany({ ofSociety: societyId });
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.societies.pull(societyId);
      user.members.pull(...membersIds);
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "Deleted society successfully!!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
