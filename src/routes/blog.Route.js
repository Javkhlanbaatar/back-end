const router = require("express").Router();
const { extractToken: extractToken, loggedIn} = require("../middleware/protect");
const {createBlog, findBlog, deleteBlog, editBlog, getBlog, getBlogs, likeBlog, changeBlogPoster, changeBlogFile, getUnassignedBlogs} = require("../controllers/blog.Controller");

router.route("/").post(extractToken, loggedIn, createBlog);
router.route("/poster").post(extractToken, loggedIn, changeBlogPoster);
router.route("/file").post(extractToken, loggedIn, changeBlogFile);
router.route("/").get(extractToken, getBlogs);
router.route("/unassigned").get(extractToken, getUnassignedBlogs);
router.route("/:id").get(extractToken, getBlog);
router.route("/find").get(extractToken, loggedIn, findBlog);
router.route("/:id").delete(extractToken, loggedIn, deleteBlog);
router.route("/:id").put(extractToken, loggedIn,  editBlog);
router.route("/:id/like").put(extractToken, loggedIn, likeBlog);
module.exports = router;