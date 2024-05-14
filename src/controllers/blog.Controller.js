const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const BlogPoster = require("../models/blogPoster");
const BlogFiles = require("../models/blogFiles");
const BlogLikes = require("../models/blogLikes");
const Blog = require("../models/blog");
const { Op } = require("sequelize");
const Friend = require("../models/friend");

exports.createBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { content, title, privacy } = req.body;

  const new_blog = await Blog.create({
    userid: userid,
    title: title,
    content: content,
    privacy: privacy,
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

exports.changeBlogPoster = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { blogid, poster } = req.body;
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
});

exports.changeBlogFile = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { blogid, files } = req.body;
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
});

exports.getBlogs = asyncHandler(async (req, res, next) => {
  const ownId = req.userid;
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

  if (!blog_blog || (ownId != blog_blog.userid && blog_blog.privacy == 2)) {
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
      liked: likedBlog ? true : false,
    },
    success: true,
  });
});

exports.editBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const id = req.params.id;
  const { content, title, privacy } = req.body;
  const updatedBlog = {
    content: content,
    title: title,
    privacy: privacy,
  };
  await Blog.update(updatedBlog, {
    where: {
      id: id,
    },
  });
  return res.status(200).json({
    success: true,
    message: "Updated blog info",
  });
});

exports.deleteBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

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
  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

exports.findBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

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
    user: user,
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
});
