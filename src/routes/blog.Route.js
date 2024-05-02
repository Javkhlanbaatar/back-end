const router = require("express").Router();
const { protect } = require("../middleware/protect");
const {createBlog, findBlog, deleteBlog, editBlog, getBlog, getBlogs, createBlogFile, createBlogPoster, likeBlog} = require("../controllers/blog.Controller");

router.route("/").post(protect, createBlog);
router.route("/poster").post(protect, createBlogPoster);
router.route("/file").post(protect, createBlogFile);
router.route("/").get(protect, getBlogs);
router.route("/:id").get(protect, getBlog);
router.route("/find").get(protect, findBlog);
router.route("/:id").delete(protect, deleteBlog);
router.route("/:id").put(protect, editBlog);
router.route("/:id/like").put(protect, likeBlog);
module.exports = router;