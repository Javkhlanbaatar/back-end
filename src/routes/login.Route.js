const router = require("express").Router();
const { Login, adminLogin, checkAuth, changePassword } =require("../controllers/login.Controller");
const { extractToken, loggedIn } = require("../middleware/protect");
router.route("/login").post(Login);
router.route("/adminlogin").post(adminLogin);
router.route("/check").get(extractToken, loggedIn, checkAuth);
router.route("/changePassword").put(extractToken, loggedIn, changePassword);
module.exports = router;
