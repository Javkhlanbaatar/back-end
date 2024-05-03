const router = require("express").Router();
const { extractToken: extractToken, loggedIn} = require("../middleware/protect");
const {createBlog, findBlog, deleteBlog, editBlog, getBlog, getBlogs, createBlogFile, createBlogPoster, likeBlog} = require("../controllers/blog.Controller");

router.route("/").post(extractToken, loggedIn, createBlog);
router.route("/poster").post(extractToken, loggedIn, createBlogPoster);
router.route("/file").post(extractToken, loggedIn, createBlogFile);
router.route("/").get(extractToken, getBlogs);
router.route("/:id").get(extractToken, getBlog);
router.route("/find").get(extractToken, loggedIn, findBlog);
router.route("/:id").delete(extractToken, loggedIn, deleteBlog);
router.route("/:id").put(extractToken, loggedIn,  editBlog);
router.route("/:id/like").put(extractToken, loggedIn, likeBlog);
module.exports = router;