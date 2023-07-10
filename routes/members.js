const express = require("express");
const router = express.Router();

const membersController = require("../controllers/members");
const isAuth = require("../middleware/is-auth.js");

router.get("/societies/:societyId", isAuth, membersController.getMembers);

router.delete("/societies/:societyId/:memId", isAuth, membersController.deleteMember);

router.get("/members/:memId", isAuth, membersController.getMember);

router.put("/members/:memId", isAuth, membersController.updateMember);

router.post("/member", isAuth, membersController.createMember);

module.exports = router;