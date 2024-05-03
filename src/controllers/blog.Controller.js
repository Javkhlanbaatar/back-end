const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const BlogPoster = require("../models/blogPoster");
const BlogFiles = require("../models/blogFiles");
const BlogLikes = require("../models/blogLikes");
const Blog = require("../models/blog");
exports.createBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { description, title, status } = req.body;

  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const new_blog = await Blog.create({
    userid: userid,
    title: title,
    description: description,
    status: status,
    likeCount: 0,
  });
  if (!new_blog) {
    return req.status(400).json({
      succes: false,
      message: "Failed to create new blog",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Created New Blog",
    data: new_blog.dataValues,
  });
});

exports.createBlogPoster = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const { blogid, poster } = req.body;
  if (poster) {
    const blog_poster = await BlogPoster.create({
      blogid: blogid,
      filename: poster.name,
      filesize: poster.size,
      filelink: poster.link,
    });
    return res.status(200).json({
      success: true,
      message: "Created New Blog Poster",
      data: blog_poster.dataValues,
    });
  } else
    return res.status(400).json({
      success: false,
      message: "Poster is empty",
    });
});

exports.createBlogFile = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (userid != id) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const { blogid, file } = req.body;
  if (file) {
    const new_file = await BlogFiles.create({
      blogid: blogid,
      filename: file.name,
      filesize: file.size,
      filelink: file.link,
    });
    return res.status(200).json({
      success: true,
      message: "Created New Blog File",
      data: new_file.dataValues,
    });
  } else
    return res.status(400).json({
      success: false,
      message: "File is empty",
    });
});

exports.getBlogs = asyncHandler(async (req, res, next) => {
  const ownId = req.userid;
  const { userid } = req.body;
  let blogList = [];
  if (userid) {
    blogList = await Blog.findAll({
      where: {
        userid: userid,
      },
      order: [["id", "DESC"]],
    });
  } else {
    blogList = await Blog.findAll({
      order: [["id", "DESC"]],
    });
  }
  const blogs = [];
  await Promise.all(
    blogList.map(async (blog, index) => {
      const user = await users.findOne({
        where: {
          id: blog.userid,
        },
      });
      const poster = await BlogPoster.findOne({
        where: {
          blogid: blog.id,
        },
      });
      const likedBlog = await BlogLikes.findOne({
        where: {
          blogid: blog.id,
          userid: ownId,
        },
      });
      const iterativeBlog = {
        ...blog,
        firstname: user.firstname,
        lastname: user.lastname,
        poster,
        liked: likedBlog? true : false,
      };
      blogs.push(iterativeBlog);
    })
  );
  return res.status(200).json({
    data: blogs,
    message: "Blog list",
  });
});

exports.getBlog = asyncHandler(async (req, res, next) => {
  const ownId = req.userid;
  const id = req.params.id;

  const blog_blog = await Blog.findOne({
    where: {
      id: id,
    },
  });

  if (!blog_blog || (ownId != blog_blog.userid && blog_blog.status == 2)) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  const blog_user = await users.findOne({
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
      liked: likedBlog ? true : false
    },
    success: true,
  });
});

exports.editBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const id = req.params.id;
  const { description, title, status, poster, files } = req.body;
  const updatedBlog = {
    description: description,
    title: title,
    status: status,
  };
  await Blog.update(updatedBlog, {
    where: {
      id: id,
    },
  });
  if (poster) {
    const blog_poster = await BlogPoster.update(
      {
        filename: poster.name,
        filesize: poster.size,
        filelink: poster.link,
      },
      {
        where: {
          blogid: id,
        },
      }
    );
  }
  if (files) {
    const new_files = files.map(
      async (item, index) =>
        await BlogFiles.create({
          blogid: new_blog.dataValues.id,
          filename: item.name,
          filesize: item.size,
          filelink: item.link,
        })
    );
  }
  return res.status(200).json({
    success: true,
    message: "Updated blog info",
  });
});

exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const id = req.params.id;
  await Blog.destroy({
    where: {
      id: id,
    },
  });
  await BlogPoster.destroy({
    where: {
      blogid: id,
    },
  });
  await BlogFiles.destroy({
    where: {
      blogid: id,
    },
  });
  res.status(200).json("Blog deleted successfully");
});

exports.findBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const { title } = req.body;
  const foundBlog = await Blog.findOne({
    where: {
      title: title,
    },
  });
  if (!foundBlog)
    return res.status(404).json({
      message: "Blog not found",
      success: False,
    });
  const user = await users.findOne({
    where: {
      id: foundBlog.userid,
    },
  });
  const shortFoundBlog = {
    title: foundBlog.title,
    firstname: user.firstname,
    lastname: user.lastname,
    description: foundBlog.description,
    likeCount: foundBlog.likeCount,
    date: foundBlog.createdAt,
  };
  return res.status(200).json({
    success: true,
    data: shortFoundBlog,
  });
});

exports.likeBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const blogid = req.params.id;
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
        id: blogid
      }
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
      id: blogid
    }
  });
  return res.status(200).json({
    success: true,
    message: "Liked",
    data: newBlogLike,
  });
});
