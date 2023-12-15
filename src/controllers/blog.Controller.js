const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const blog = require("../models/blog");
const users = require("../models/users");
const BlogPoster = require("../models/blogPoster");
const BlogFiles = require("../models/blogFiles");
exports.createBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { description, title, status } = req.body;

  const new_blog = await blog.create({
    userid: userid,
    title: title,
    description: description,
    status: status,
    likeCount: 0,
  });
  if (!new_blog) {
    return req.status(400).json({
      succes: false,
      message: "Failed to create new blog"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Created New Blog",
    data: new_blog.dataValues
  });
});

exports.createBlogPoster = asyncHandler(async (req, res, next) => {
  const { blogid, poster } = req.body
  if (poster) {
    const blog_poster = await BlogPoster.create({
      blogid: blogid,
      filename: poster.name,
      filesize: poster.size,
      filelink: poster.link
    });
    return res.status(200).json({
      success: true,
      message: "Created New Blog Poster",
      data: blog_poster.dataValues
    });
  } else
    return res.status(400).json({
      success: false,
      message: "Poster is empty"
    });
});

exports.createBlogFile = asyncHandler(async (req, res, next) => {
  const { blogid, file } = req.body
  if (file) {
    const new_file = await BlogFiles.create({
      blogid: blogid,
      filename: file.name,
      filesize: file.size,
      filelink: file.link
    });
    return res.status(200).json({
      success: true,
      message: "Created New Blog File",
      data: new_file.dataValues
    });
  } else
    return res.status(400).json({
      success: false,
      message: "File is empty"
    });
});

exports.getBlogs = asyncHandler(async (req, res, next) => {
  const { userid } = req.body;
  let blogList = [];
  if (userid) {
    blogList = await blog
      .findAll({
        where: {
          userid: userid
        },
        order: [["id", "DESC"]],
      })
  } else {
    blogList = await blog
      .findAll({
        order: [["id", "DESC"]],
      })
  }
  const blogs = []
  for (let j in blogList) {
    const user = await users.findOne({
      where: {
        id: blogList[j].userid
      }
    });
    const poster = await BlogPoster.findOne({
      where: {
        blogid: blogList[j].id
      }
    });
    const iterativeBlog = {
      ...blogList[j],
      firstname: user.firstname,
      lastname: user.lastname,
      poster
    }
    blogs.push(iterativeBlog)
  }
  return res.status(200).json({
    data: blogs,
    message: "Blog list",
  });
});

exports.getBlog = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const blog_blog = await blog.findOne({
    where: {
      id: id
    }
  });

  if (!blog_blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found"
    });
  }

  const blog_user = await users.findOne({
    where: {
      id: blog_blog.userid
    }
  });
  const blog_poster = await BlogPoster.findOne({
    where: {
      blogid: id
    }
  });
  const blog_files = await BlogFiles.findAll({
    where: {
      blogid: id
    }
  });

  return res.status(200).json({
    data: {
      ...blog_blog,
      user: blog_user,
      image: blog_poster.filelink,
      files: blog_files
    },
    success: true,

  });
});

exports.editBlog = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { description, title, status, poster, files } = req.body;
  const updatedBlog = { description: description, title: title, status: status }
  await blog.update(updatedBlog,
    {
      where: {
        id: id
      }
    }
  );
  if (poster) {
    const blog_poster = await BlogPoster.update({
      filename: poster.name,
      filesize: poster.size,
      filelink: poster.link
    },
      {
        where: {
          blogid: id
        }
      }
    );
  }
  if (files) {
    const new_files = files.map(async (item, index) =>
      await BlogFiles.create({
        blogid: new_blog.dataValues.id,
        filename: item.name,
        filesize: item.size,
        filelink: item.link
      })
    )
  }
  return res.status(200).json({
    success: true,
    message: "Updated blog info"
  })
});

exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  await blog.destroy({
    where: {
      id: id,
    }
  });
  await BlogPoster.destroy({
    where: {
      blogid: id,
    }
  });
  await BlogFiles.destroy({
    where: {
      blogid: id,
    }
  });
  res.status(200).json("Blog deleted successfully");

});

exports.findBlog = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  const foundBlog = await blog.findOne({
    where: {
      title: title
    }
  });
  if (!foundBlog) return res.status(404).json({
    message: "Blog not found",
    success: False
  });
  const user = await users.findOne({
    where: {
      id: foundBlog.userid
    }
  });
  const shortFoundBlog = {
    title: foundBlog.title,
    firstname: user.firstname,
    lastname: user.lastname,
    description: foundBlog.description,
    likeCount: foundBlog.likeCount,
    date: foundBlog.createdAt,
  }
  return res.status(200).json({
    success: true,
    data: shortFoundBlog
  });
});