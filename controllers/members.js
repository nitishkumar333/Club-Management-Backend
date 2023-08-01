const { validationResult } = require("express-validator/check");
const fs = require("fs");
const path = require("path");
const Members = require("../models/members.js");

const User = require("../models/users.js");
const Society = require("../models/society");

exports.getMembers = (req, res, next) => {
  const societyId = req.params.societyId;
  Members.find({ ofSociety: societyId, creator: req.userId })
    .then((members) => {
      res.status(200).json({
        message: "Fetched societies successfully.",
        members: members,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getMembersCount = (req, res, next) => {
  Members.countDocuments()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createMember = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  if (!req.files || !req.files.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.files.file[0].path;
  const name = req.body.name;
  const email = req.body.email;
  const phoneno = req.body.contact;
  const department = req.body.department;
  const position = req.body.position;
  const societyId = req.body.societyId;
  let creator;
  const member = new Members({
    name: name,
    email: email,
    phoneno: phoneno,
    department: department,
    position: position,
    imageUrl: imageUrl,
    creator: req.userId,
    ofSociety: societyId,
  });
  member
    .save()
    .then((res) => {
      return Society.findById(societyId);
    })
    .then((society) => {
      society.members.push(member);
      return society.save();
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.members.push(member);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Member created successfully!",
        member: member,
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

exports.getMember = (req, res, next) => {
  const memId = req.params.memId;
  Members.findById(memId)
    .then((member) => {
      if (!member) {
        const error = new Error("Could not find Member.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Member fetched.", member: member });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateMember = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const memId = req.params.memId;
  if (!memId) {
    const error = new Error("No Member Found!");
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const department = req.body.department;
  const email = req.body.email;
  const phoneno = req.body.phoneno;
  const position = req.body.position;
  let imageUrl = req.body.file;
  if (req.files.file) {
    imageUrl = req.files.file[0].path;
  }
  if (!imageUrl) {
    const error = new Error("No file found!!");
    error.statusCode = 422;
    throw error;
  }
  Members.findById(memId)
    .then((member) => {
      if (!member) {
        const error = new Error("Could not find society.");
        error.statusCode = 404;
        throw error;
      }
      if (member.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== member.imageUrl) {
        clearImage(member.imageUrl);
      }
      member.name = name;
      member.imageUrl = imageUrl;
      member.department = department;
      member.email = email;
      member.position = position;
      member.phoneno = phoneno;
      return member.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Society Updated!!", member: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteMember = (req, res, next) => {
  const memId = req.params.memId;
  const societyId = req.params.societyId;
  console.log(memId);
  console.log(societyId);
  Members.findById(memId)
    .then((member) => {
      if (!member) {
        const error = new Error("Could not find society.");
        err.statusCode = 404;
        throw error;
      }
      if (member.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      clearImage(member.imageUrl);
      return Members.findByIdAndRemove(memId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.members.pull(memId);
      return user.save();
    })
    .then((result) => {
      return Society.findById(societyId);
    })
    .then((society) => {
      society.members.pull(memId);
      return society.save();
    })
    .then((result) => {
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
