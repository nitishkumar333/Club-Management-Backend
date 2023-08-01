const { validationResult } = require("express-validator/check");
const fs = require("fs");
const path = require("path");
const Events = require("../models/events.js");
const User = require("../models/users.js");
const Society = require("../models/society.js");

exports.getEventsCount = (req, res, next) => {
  Events.countDocuments()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getUpcomingEvents = (req, res, next) => {
  const societyId = req.params.societyId;
  Events.find({ ofSociety: societyId, creator: req.userId, type: "UPCOMING" })
    .then((events) => {
      res.status(200).json({
        message: "Fetched events successfully.",
        events: events,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPastEvents = (req, res, next) => {
  const societyId = req.params.societyId;
  Events.find({ ofSociety: societyId, creator: req.userId, type: "COMPLETED" })
    .then((events) => {
      res.status(200).json({
        message: "Fetched events successfully.",
        events: events,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createEvent = (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const error = new Error("Validation failed, entered data is incorrect.");
  //   error.statusCode = 422;
  //   throw error;
  // }
  if (!req.files || !req.files.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const type = req.body.type;
  if (type === "COMPLETED" && (!req.files || !req.files.report)) {
    const error = new Error("No Report found.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.files.file[0].path;
  let reportUrl;
  if (type === "COMPLETED") {
    reportUrl = req.body.report;
    if (req.files && req.files.report) {
      reportUrl = req.files.report[0].path;
    }
  }
  const eventname = req.body.eventname;
  const date = req.body.date;
  const description = req.body.description;
  const department = req.body.department;
  const winners = req.body.winners;
  const societyId = req.body.societyId;
  let creator;
  const event = new Events({
    eventname: eventname,
    date: date,
    description: description,
    department: department,
    winners: winners,
    type: type,
    imageUrl: imageUrl,
    reportUrl: reportUrl,
    creator: req.userId,
    ofSociety: societyId,
  });
  event
    .save()
    .then((res) => {
      return Society.findById(societyId);
    })
    .then((society) => {
      society.events.push(event);
      return society.save();
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.events.push(event);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Event created successfully!",
        event: event,
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

exports.updateEvent = (req, res, next) => {
  const eventId = req.params.eventId;
  if (!eventId) {
    const error = new Error("No Event Found!");
    error.statusCode = 422;
    throw error;
  }
  const eventname = req.body.eventname;
  const department = req.body.department;
  const description = req.body.description;
  const winners = req.body.winners;
  const type = req.body.type;
  const date = req.body.date;
  let imageUrl = req.body.file;
  let reportUrl;
  if (type === "COMPLETED") {
    reportUrl = req.body.report;
    if (req.files && req.files.report) {
      reportUrl = req.files.report[0].path;
    }
  }
  if (req.files && req.files.file) {
    imageUrl = req.files.file[0].path;
  }
  if (!imageUrl) {
    const error = new Error("No file found!!");
    error.statusCode = 422;
    throw error;
  }
  if (type === "COMPLETED" && !reportUrl) {
    const error = new Error("No Report found!!");
    error.statusCode = 422;
    throw error;
  }
  Events.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error("Could not find Event.");
        error.statusCode = 404;
        throw error;
      }
      if (event.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== event.imageUrl) {
        clearImage(event.imageUrl);
      }
      event.eventname = eventname;
      event.imageUrl = imageUrl;
      event.reportUrl = reportUrl;
      event.department = department;
      event.date = date;
      event.description = description;
      event.winners = winners;
      event.type = type;
      return event.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Event Updated!!", event: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteEvent = (req, res, next) => {
  const eventId = req.params.eventId;
  const societyId = req.params.societyId;
  Events.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error("Could not find event.");
        err.statusCode = 404;
        throw error;
      }
      if (event.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized!");
        error.statusCode = 403;
        throw error;
      }
      clearImage(event.imageUrl);
      if (event.type === "COMPLETED") {
        clearImage(event.reportUrl);
      }
      return Events.findByIdAndRemove(eventId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.events.pull(eventId);
      return user.save();
    })
    .then((result) => {
      return Society.findById(societyId);
    })
    .then((society) => {
      society.events.pull(eventId);
      return society.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted event successfully!!" });
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
