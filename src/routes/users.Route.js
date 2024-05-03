const { extractToken, loggedIn } = require("../middleware/protect");
const { createUser, getUsers, getUser, deleteUser, updateUser, findUser, addFriend } = require("../controllers/users.Controller");

const router = require("express").Router();
router.route("/").post(createUser);
router.route("/").get(extractToken, loggedIn, getUsers);
router.route("/:username").get(getUser);
router.route("/:id").delete(extractToken, loggedIn, deleteUser);
router.route("/:id").put(extractToken, loggedIn, updateUser);
router.route("/find").get(extractToken, loggedIn, findUser);
router.route("/addfriend/:username").post(extractToken, loggedIn, addFriend);
module.exports = router;
