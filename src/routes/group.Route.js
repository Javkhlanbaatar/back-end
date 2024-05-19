const router = require("express").Router();
const { extractToken: extractToken, loggedIn } = require("../middleware/protect");
const {createGroup, getGroup, getGroups, createPoster, updateGroup, deleteGroup, addMember, deleteMember} = require("../controllers/group.Controller");

router.route("/").post(extractToken, loggedIn, createGroup);
router.route("/poster").post(extractToken, loggedIn, createPoster);
router.route("/").get(extractToken, loggedIn, getGroups);
router.route("/:id").get(extractToken, getGroup);
router.route("/:id").put(extractToken, loggedIn, updateGroup);
router.route("/:id").delete(extractToken, loggedIn, deleteGroup);
router.route("/:id/member").post(extractToken, loggedIn, addMember);
router.route("/:id/member").delete(extractToken, loggedIn, deleteMember);
module.exports = router;