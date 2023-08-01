const express = require("express");
const router = express.Router();

const membersController = require("../controllers/members");
const isAuth = require("../middleware/is-auth.js");
const fileUpload = require('../middleware/file-upload.js');
const { body } = require("express-validator/check");

router.get("/societies/:societyId", isAuth, membersController.getMembers);

router.delete("/societies/:societyId/:memId", isAuth, membersController.deleteMember);

router.get("/members/:memId", isAuth, membersController.getMember);

router.get("/all/members/count", isAuth, membersController.getMembersCount);

router.put("/members/:memId", isAuth, fileUpload, 
[
    body("name").trim().not().isEmpty(),
    body("email").trim().not().isEmpty(),
    body("phoneno").trim().not().isEmpty(),
    body("department").trim().not().isEmpty(),
    body("position").trim().not().isEmpty(),
],
membersController.updateMember);

router.post("/member", isAuth, fileUpload, 
[
    body("name").trim().not().isEmpty(),
    body("email").trim().not().isEmpty(),
    body("contact").trim().isLength({ min: 10 }),
    body("department").trim().not().isEmpty(),
    body("position").trim().not().isEmpty(),
],
membersController.createMember);

module.exports = router;