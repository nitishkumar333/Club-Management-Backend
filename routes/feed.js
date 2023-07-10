const express = require("express");
const { body } = require("express-validator/check");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth.js");

const router = express.Router();

// GET /feed/posts
router.get("/societies", isAuth, feedController.getSocieties);

// POST /feed/post
router.post(
  "/society",
  isAuth,
  [
    body("society").trim().isLength({ min: 5 }),
    body("tagline").trim().isLength({ min: 5 }),
  ],
  feedController.createSociety
);

router.get("/society/:societyId", isAuth, feedController.getSociety);

router.put("/society/:societyId", isAuth, feedController.updateSociety);

router.delete("/society/:societyId", isAuth, feedController.deleteSociety);

module.exports = router;
