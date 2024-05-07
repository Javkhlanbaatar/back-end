const { getFriends, addFriend, removeFriend } = require("../controllers/friend.Controller");
const { extractToken, loggedIn } = require("../middleware/protect");

const router = require("express").Router();
router.route("/:id").get(extractToken, loggedIn, getFriends);
router.route("/:id").post(extractToken, loggedIn, addFriend);
router.route("/:id").delete(extractToken, loggedIn, removeFriend);
module.exports = router;