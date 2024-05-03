const router = require("express").Router();
const { extractToken, loggedIn, } = require("../middleware/protect");
const {getChats, getAllChat,writeAllChat} = require("../controllers/socket.Controller");
const {getOnlineUsers} = require("../controllers/socket.Controller");
const {setAllChatReadStatus} = require("../controllers/socket.Controller");
const {getUnreadMessageCounts} = require("../controllers/socket.Controller");

// router.route("/:username/saveChat").post(extractToken,saveChat);
// router.route("/:username/getChat").get(extractToken,getChats);
router.route("/writeAllChat").post(writeAllChat);
router.route("/:userid/getChats").get(extractToken, loggedIn, getChats);
router.route("/getAllChat").get(getAllChat);
router.route("/getOnlineUsers").get(getOnlineUsers);
router.route("/setAllChatRead").post(setAllChatReadStatus);
router.route("/getUnreadCount/:userid").get(getUnreadMessageCounts);

module.exports = router;