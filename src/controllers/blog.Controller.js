const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const BlogPoster = require("../models/blogPoster");
const BlogFiles = require("../models/blogFiles");
const BlogLikes = require("../models/blogLikes");
const Blog = require("../models/blog");
const { Op } = require("sequelize");
const Friend = require("../models/friend");
const TaskAssignment = require("../models/taskAssignment");

exports.createBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { content, title, privacy } = req.body;

  try {
    const new_blog = await Blog.create({
      userid: userid,
      title: title,
      content: content,
      privacy: privacy,
      likeCount: 0,
    });
    if (!new_blog) {
      return req.status(400).json({
        success: false,
        message: "Failed to create new blog",
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "Created New Blog",
      data: new_blog.dataValues,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

const isNumeric = (value) => {
  return /^-?\d+$/.test(value);
}

exports.changeBlogPoster = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { blogid, poster } = req.body;
  if (!blogid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }
  try {
    const blog = await Blog.findOne({
      where: {
        id: blogid,
      },
    });
    if (userid != blog.userid) {
      return res.status(401).json({
        success: false,
        message: "Not Allowed",
      });
    }
  
    if (!poster) {
      return res.status(400).json({
        success: false,
        message: "Poster is empty",
      });
    }
  
    const oldPoster = await BlogPoster.findOne({
      where: {
        blogid: blogid,
      },
    });
    let blog_poster = null;
    if (oldPoster) {
      const blog_poster = await BlogPoster.update(
        {
          filename: poster.name,
          filesize: poster.size,
          filelink: poster.link,
        },
        {
          where: {
            blogid: blogid,
          },
        }
      );
    } else {
      const blog_poster = await BlogPoster.create({
        blogid: blogid,
        filename: poster.name,
        filesize: poster.size,
        filelink: poster.link,
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "Changed Blog Poster",
      data: blog_poster?.dataValues,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.changeBlogFile = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { blogid, files } = req.body;
  if (!blogid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }
  try {
    const blog = await Blog.findOne({
      where: {
        id: blogid,
      },
    });
    if (userid != blog.userid) {
      res.status(401).json({
        success: false,
        message: "Not Allowed",
      });
    }
  
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "File is empty",
      });
    }
  
    const uploadedFiles = await BlogFiles.findAll({
      where: {
        blogid: blogid,
      },
    });
  
    if (uploadedFiles.length > 0) {
      await BlogFiles.destroy({
        where: {
          blogid: blogid,
        },
      });
    }
    const new_files = await Promise.all([
      files.map(
        async (item) =>
          await BlogFiles.create({
            blogid: blogid,
            filename: item.name,
            filesize: item.size,
            filelink: item.link,
          })
      ),
    ]);
  
    return res.status(200).json({
      success: true,
      message: "Changed Blog Files",
      data: new_files.dataValues,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.getBlogs = asyncHandler(async (req, res, next) => {
  const ownId = req.userid;
  try {
    const friends = await Friend.findAll({
      where: {
        userid: ownId,
        accepted: true,
      },
    });
    const friendsId = friends.map((friend) => friend.friendid);
    const blogList = await Blog.findAll({
      order: [["id", "DESC"]],
      where: {
        [Op.or]: [
          {
            privacy: 0,
          },
          {
            privacy: 1,
            userid: friendsId,
          },
          {
            privacy: [1, 2],
            userid: ownId,
          },
        ],
      },
    });
    const blogs = await Promise.all(
      blogList.map(async (blog) => {
        const [user, poster, likedBlog] = await Promise.all([
          users.findOne({
            attributes: {
              exclude: ["role", "password", "createdAt", "updatedAt"],
            },
            where: {
              id: blog.userid,
            },
          }),
          BlogPoster.findOne({
            where: {
              blogid: blog.id,
            },
          }),
          BlogLikes.findOne({
            where: {
              blogid: blog.id,
              userid: ownId,
            },
          }),
        ]);
        return {
          ...blog,
          user: user,
          poster,
          liked: likedBlog ? true : false,
        };
      })
    );
    return res.status(200).json({
      success: true,
      data: blogs,
      message: "Blog list",
    });
  } catch(err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.getUnassignedBlogs = asyncHandler(async (req, res, next) => {
  const ownId = req.userid;
  const taskid = req.query.taskid;
  if (!taskid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }
  try {
    const assignments = await TaskAssignment.findAll({
      where: {
        taskid: taskid,
      },
    });
    const assignedBlog = await Blog.findOne({
      where: {
        id: assignments.map((item) => item.blogid),
        userid: ownId,
      },
    });
    const blogList = await Blog.findAll({
      where: {
        userid: ownId,
      },
    });
  
    const blogs = await Promise.all(
      blogList.map(async (blog) => {
        const [user, poster] = await Promise.all([
          users.findOne({
            attributes: {
              exclude: ["role", "password", "createdAt", "updatedAt"],
            },
            where: {
              id: blog.userid,
            },
          }),
          BlogPoster.findOne({
            where: {
              blogid: blog.id,
            },
          }),
        ]);
        return {
          ...blog,
          user: user,
          assigned: blog.id === assignedBlog?.id,
          poster,
        };
      })
    );
    return res.status(200).json({
      success: true,
      data: blogs,
      message: "Blog list",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.getBlog = asyncHandler(async (req, res, next) => {
  const ownId = req.userid;
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const blog_blog = await Blog.findOne({
      where: {
        id: id,
      },
    });
  
    if (!blog_blog || (ownId != blog_blog.userid && blog_blog.privacy == 2)) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
  
    const blog_user = await users.findOne({
      attributes: { exclude: ["role", "password", "createdAt", "updatedAt"] },
      where: {
        id: blog_blog.userid,
      },
    });
    const blog_poster = await BlogPoster.findOne({
      where: {
        blogid: id,
      },
    });
    const blog_files = await BlogFiles.findAll({
      where: {
        blogid: id,
      },
    });
    const likedBlog = await BlogLikes.findOne({
      where: {
        blogid: id,
        userid: ownId,
      },
    });
  
    return res.status(200).json({
      data: {
        ...blog_blog,
        user: blog_user,
        image: blog_poster,
        files: blog_files,
        liked: likedBlog ? true : false,
      },
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: true,
      message: "System error"
    });
  }
}); 

exports.editBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  const { content, title, privacy } = req.body;
  const updatedBlog = {
    content: content,
    title: title,
    privacy: privacy,
  };
  try {
    await Blog.update(updatedBlog, {
      where: {
        id: id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Updated blog info",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }
  try {
    await Blog.destroy({
      where: {
        id: id,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.findBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const { title } = req.body;
  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }
  try {
    const friends = await Friend.findAll({
      where: {
        userid: userid,
        accepted: true,
      },
    });
    const friendsId = friends.map((friend) => friend.friendid);
    const blogList = await Blog.findAll({
      where: {
        title: { [Op.like]: `${title}%` },
        [Op.or]: [
          {
            privacy: 0,
          },
          {
            privacy: 1,
            userid: friendsId,
          },
          {
            privacy: [1, 2],
            userid: userid,
          },
        ],
      },
    });
    const blogs = await Promise.all(
      blogList.map(async (blog) => {
        const [user, poster] = await Promise.all([
          users.findOne({
            attributes: {
              exclude: ["role", "password", "createdAt", "updatedAt"],
            },
            where: {
              id: blog.userid,
            },
          }),
          BlogPoster.findOne({
            where: {
              blogid: blog.id,
            },
          }),
        ]);
        return {
          ...blog,
          user: user,
          poster,
        };
      })
    );
    return res.status(200).json({
      success: true,
      message: "Blog search",
      data: blogs,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.likeBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const blogid = req.params.id;
  if (!blogid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }
  try {
    const blogLikes = await BlogLikes.findOne({
      where: {
        blogid,
        userid,
      },
    });
  
    if (blogLikes) {
      await BlogLikes.destroy({
        where: {
          blogid,
          userid,
        },
      });
      await Blog.decrement("likeCount", {
        where: {
          id: blogid,
        },
      });
      return res.status(200).json({
        success: true,
        message: "Unliked",
      });
    }
  
    const newBlogLike = await BlogLikes.create({
      blogid,
      userid,
    });
    await Blog.increment("likeCount", {
      where: {
        id: blogid,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Liked",
      data: newBlogLike,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});
