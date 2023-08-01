const express = require('express');
const router = express.Router();

const eventsController = require("../controllers/events");
const isAuth = require("../middleware/is-auth.js");
const fileUpload = require('../middleware/file-upload.js');
const {body} = require("express-validator/check");

router.get("/events/upcomingEvents/:societyId", isAuth, eventsController.getUpcomingEvents);

router.get("/events/pastEvents/:societyId", isAuth, eventsController.getPastEvents);

router.get("/all/events/count", isAuth, eventsController.getEventsCount);

router.delete("/events/:societyId/:eventId", isAuth, eventsController.deleteEvent);

router.put("/events/:eventId", isAuth, fileUpload,
[
    body("eventname").trim().not().isEmpty(),
    body("department").trim().not().isEmpty(),
    body("description").trim().not().isEmpty(),
    body("date").trim().not().isEmpty(),
    body("type").trim().not().isEmpty(),
],
eventsController.updateEvent);

router.post("/newEvent", isAuth, fileUpload,
[
    body("eventname").trim().not().isEmpty(),
    body("department").trim().not().isEmpty(),
    body("description").trim().not().isEmpty(),
    body("date").trim().not().isEmpty(),
    body("type").trim().not().isEmpty(),
],
eventsController.createEvent);

module.exports = router;