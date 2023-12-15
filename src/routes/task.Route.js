const router = require("express").Router();
const { createTask, getTasks, createTaskFile } = require("../controllers/task.Controller");
const { protect } = require("../middleware/protect");

router.route("/").post(protect, createTask);
router.route("/file").post(protect, createTaskFile);
router.route("/").get(getTasks);
// router.route("/:id").get(getBlog);
// router.route("/find").get(findBlog);
// router.route("/:id").delete(protect, deleteBlog);
// router.route("/:id").put(protect, editBlog);
module.exports = router;