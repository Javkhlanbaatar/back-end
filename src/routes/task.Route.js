const router = require("express").Router();
const { createTask, getTasks, createTaskFile, getTask, editTask, deleteTask, assignBlog, getAssignedBlog, gradeBlog } = require("../controllers/task.Controller");
const { extractToken, loggedIn } = require("../middleware/protect");

router.route("/").post(extractToken, loggedIn, createTask);
router.route("/file").post(extractToken, loggedIn, createTaskFile);
router.route("/").get(extractToken, loggedIn, getTasks);
router.route("/:id").get(extractToken, loggedIn, getTask);
// router.route("/find").get(extractToken, loggedIn, findTask);
router.route("/:id").put(extractToken, loggedIn, editTask);
router.route("/:id").delete(extractToken, loggedIn, deleteTask);
router.route("/:id/assign").post(extractToken, loggedIn, assignBlog);
router.route("/:id/assign").get(extractToken, loggedIn, getAssignedBlog);
router.route("/:id/grade").post(extractToken, loggedIn, gradeBlog);
module.exports = router;