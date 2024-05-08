const { extractToken, loggedIn } = require("../middleware/protect");
const { createUser, getUsers, getUser, deleteUser, updateUser, findUser, getUserProfile } = require("../controllers/users.Controller");

const router = require("express").Router();
router.route("/").post(createUser);
router.route("/").get(extractToken, loggedIn, getUsers);
router.route("/profile").get(extractToken, loggedIn, getUserProfile);
router.route("/find").get(extractToken, loggedIn, findUser);
router.route("/:username").get(extractToken, getUser);
router.route("/:id").delete(extractToken, loggedIn, deleteUser);
router.route("/:id").put(extractToken, loggedIn, updateUser);
module.exports = router;