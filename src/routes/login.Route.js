const router = require("express").Router();
const { Login, adminLogin, checkAuth, changePassword } =require("../controllers/login.Controller");
const { protect } = require("../middleware/protect");
router.route("/login").post(Login);
router.route("/adminlogin").post(adminLogin);
router.route("/check").get(protect, checkAuth);
router.route("/changePassword").put(protect,changePassword);
module.exports = router;
// const express = require("express");
// const router = express.Router();
// const logCtrl = require("../controllers/login.Controller");

// router.route("/login").post(logCtrl.Login);
