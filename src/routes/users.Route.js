// const router = require("express").Router();
// const {createUsers} = require("../controllers/users.Controller")
// const {getUsers} = require("../controllers/users.Controller")

// router.route("/create").post(createUsers);
// router.route("/").get(getUsers);

// module.exports = router;

const { protect } = require("../middleware/protect");
const { createUser } = require("../controllers/users.Controller");
const {registerUser} = require("../controllers/users.Controller");
const { getUsers } = require("../controllers/users.Controller");
const { getUser } = require("../controllers/users.Controller");
const { deleteUser } = require("../controllers/users.Controller");
const { updateUser, findUser, addFriend} = require("../controllers/users.Controller");

const router = require("express").Router();
router.route("/createUser").post(createUser);
router.route("/getUsers").get(getUsers);
router.route("/:id").get(getUser);
router.route("/regUser").post(protect,registerUser);
router.route("/deleteUser/:id").delete(deleteUser);
router.route("/updateUser/:id").put(updateUser);
router.route("/findUser/:searchname").get(findUser);
router.route("/addfriend/:id").post(protect,addFriend);
module.exports = router;
