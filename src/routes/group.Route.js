const router = require("express").Router();
const { protect } = require("../middleware/protect");
const {createGroup, getGroup, getGroups, createPoster} = require("../controllers/group.Controller");

router.route("/").post(protect, createGroup);
router.route("/poster").post(protect, createPoster);
router.route("/").get(protect, getGroups);
router.route("/:id").get(protect, getGroup);
module.exports = router;