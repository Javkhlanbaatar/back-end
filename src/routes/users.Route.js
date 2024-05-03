const { protect } = require("../middleware/protect");
const { createUser, getUsers, getUser, deleteUser, updateUser, findUser, addFriend } = require("../controllers/users.Controller");

const router = require("express").Router();
router.route("/").post(createUser);
router.route("/").get(protect, getUsers);
router.route("/:username").get(getUser);
router.route("/:id").delete(protect,deleteUser);
router.route("/:id").put(protect,updateUser);
router.route("/find").get(protect, findUser);
router.route("/addfriend/:username").post(protect,addFriend);
module.exports = router;
