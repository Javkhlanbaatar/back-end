const router = require("express").Router();
const { protect } = require("../middleware/protect");
const {createBlog, findBlog, deleteBlog, editBlog, getBlog, getBlogs, createBlogFile, createBlogPoster} = require("../controllers/blog.Controller");

router.route("/").post(protect, createBlog);
router.route("/poster").post(protect, createBlogPoster);
router.route("/file").post(protect, createBlogFile);
router.route("/").get(getBlogs);
router.route("/:id").get(getBlog);
router.route("/find").get(findBlog);
router.route("/:id").delete(protect, deleteBlog);
router.route("/:id").put(protect, editBlog);
module.exports = router;