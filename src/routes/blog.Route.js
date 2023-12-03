const router = require("express").Router();
const { protect } = require("../middleware/protect");
const {createBlog, findBlog, deleteBlog, editBlog, getBlog, getBlogs} = require("../controllers/blog.Controller");

router.route("/createblog").post(protect, createBlog);
router.route("/getBlogs").get(getBlogs);
router.route("/getBlog/:id").get(getBlog);
router.route("/findBlog/:title").get(findBlog);
router.route("/deleteBlog/:id").delete(deleteBlog);
router.route("/editBlog/:id").get(editBlog);
module.exports = router;