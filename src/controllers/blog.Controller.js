const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const blog = require("../models/blog");
const upload = require("../models/upload");
const users = require("../models/users");
exports.createBlog = asyncHandler(async (req, res, next) => {
    const userid = req.userid;
    const {description, title, status} = req.body;

    const imageUrl = "";

    const new_blog = await blog.create({
        userid: userid,
        title: title,
        description: description,
        status: status,
        image: imageUrl,
        likeCount: 0,
    });
    if(new_blog){
        return res.status(200).json({
            success: true,
            message: "Created New Blog"
        });
    }
    else return req.status(400).json({
        succes: false, 
        message: "Failed to create new blog"
    });
});

exports.getBlogs = asyncHandler(async (req, res, next) => {
  //method for admin that gets every users
  const blogList = await blog
    .findAll({
      order: [["id", "DESC"]],
    })
    const shortBlogs = []
    for( let j in blogList){
        const user = await users.findOne({
                where: {
                id: blogList[j].userid 
                }
            });
        const iterativeBlog = {
            title: blogList[j].title,
            firstname: user.firstname,
            lastname: user.lastname,
            description: blogList[j].description,
            likeCount: blogList[j].likeCount,
            date: blogList[j].createdAt,
        }
        shortBlogs.push(iterativeBlog) 
    }
    return res.status(200).json({
    data: shortBlogs,
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
      message: "User not found"
    });
  }
//   const uploadFile = await upload.findOne({
//     where: {
//         blog_blogId: blog_blog.id
//     }
//   });

  return res.status(200).json({
    data: blog_blog,
    success: true,
    
  });
});

exports.editBlog = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { description, title, status } = req.body;
  const updatedBlog = { description:description, title: title, status: status }
  await blog.update(updatedBlog,
    { where: {
        id: id
    }}
  );
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
    res.status(200).json("Blog deleted successfully");
  
});

exports.findBlog = asyncHandler(async (req, res, next) => {
    const title = req.params.title;
    const foundBlog = await blog.findOne({
        where: {
            title: title
    }});
    if(!foundBlog) return res.status(404).json({
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