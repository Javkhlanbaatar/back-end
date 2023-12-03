const router = require("express").Router();
const { protect } = require("../middleware/protect");
const {createGroup, getGroup, getGroups} = require("../controllers/group.Controller");

router.route("/createGroup").post(protect, createGroup);
router.route("/getGroups").get(getGroups);
router.route("/getGroup/:id").get(getGroup);
module.exports = router;