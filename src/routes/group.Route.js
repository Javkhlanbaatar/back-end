const router = require("express").Router();
const { extractToken: extractToken, loggedIn } = require("../middleware/protect");
const {createGroup, getGroup, getGroups, createPoster} = require("../controllers/group.Controller");

router.route("/").post(extractToken, loggedIn, createGroup);
router.route("/poster").post(extractToken, loggedIn, createPoster);
router.route("/").get(extractToken, loggedIn, getGroups);
router.route("/:id").get(extractToken, loggedIn, getGroup);
module.exports = router;