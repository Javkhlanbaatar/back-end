const router = require("express").Router();
const { extractToken, loggedIn} = require("../middleware/protect");
const {getChats, setAllChatReadStatus, getUnreadMessageCounts } = require("../controllers/socket.Controller");

router.route("/:userid/getChats").get(extractToken, loggedIn, getChats);
router.route("/setAllChatRead").post(setAllChatReadStatus);
router.route("/getUnreadCount/:userid").get(getUnreadMessageCounts);

module.exports = router;