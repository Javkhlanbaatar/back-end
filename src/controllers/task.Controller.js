const { Op, QueryTypes } = require("sequelize");
const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const Task = require("../models/task");
const TaskFiles = require("../models/taskFiles");
exports.createTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { groupid, title, description, starttime, endtime } = req.body;

  const new_task = await Task.create({
    userid,
    groupid,
    title,
    description,
    starttime,
    endtime
  });
  if (!new_task) {
    return req.status(400).json({
      succes: false,
      message: "Failed to create new task"
    });
  }

  return res.status(200).json({
    success: true,
    message: "Created new task",
    data: new_task.dataValues
  });
});

exports.createTaskFile = asyncHandler(async (req, res, next) => {
  const { taskid, file } = req.body
  if (file) {
    const new_file = await TaskFiles.create({
      taskid: taskid,
      filename: file.name,
      filesize: file.size,
      filelink: file.link
    });
    return res.status(200).json({
      success: true,
      message: "Created New Task File",
      data: new_file.dataValues
    });
  } else
    return res.status(400).json({
      success: false,
      message: "File is empty"
    });
});

exports.getTasks = asyncHandler(async (req, res, next) => {
  const { groupid } = req.groupid;
  const taskList = await Task
    .findAll({
      where: {
        groupid
      },
      order: [["id", "DESC"]],
    })
  return res.status(200).json({
    data: taskList,
    message: "Blog list",
  });
});

// exports.getBlog = asyncHandler(async (req, res, next) => {
//   const id = req.params.id;

//   const blog_blog = await blog.findOne({
//     where: {
//       id: id
//     }
//   });

//   if (!blog_blog) {
//     return res.status(404).json({
//       success: false,
//       message: "Blog not found"
//     });
//   }

//   const blog_user = await users.findOne({
//     where: {
//       id: blog_blog.userid
//     }
//   });
//   const blog_poster = await BlogPoster.findOne({
//     where: {
//       blogid: id
//     }
//   });
//   const blog_files = await BlogFiles.findAll({
//     where: {
//       blogid: id
//     }
//   });

//   return res.status(200).json({
//     data: {
//       ...blog_blog,
//       user: blog_user,
//       image: blog_poster.filelink,
//       files: blog_files
//     },
//     success: true,

//   });
// });

// exports.editBlog = asyncHandler(async (req, res, next) => {
//   const id = req.params.id;
//   const { description, title, status, poster, files } = req.body;
//   const updatedBlog = { description: description, title: title, status: status }
//   await blog.update(updatedBlog,
//     {
//       where: {
//         id: id
//       }
//     }
//   );
//   if (poster) {
//     const blog_poster = await BlogPoster.update({
//       filename: poster.name,
//       filesize: poster.size,
//       filelink: poster.link
//     },
//     {
//       where: {
//         blogid: id
//       }
//     }
//     );
//   }
//   if (files) {
//     const new_files = files.map(async (item, index) =>
//       await BlogFiles.create({
//         blogid: new_blog.dataValues.id,
//         filename: item.name,
//         filesize: item.size,
//         filelink: item.link
//       })
//     )
//   }
//   return res.status(200).json({
//     success: true,
//     message: "Updated blog info"
//   })
// });

// exports.deleteBlog = asyncHandler(async (req, res, next) => {
//   const id = req.params.id;
//   await blog.destroy({
//     where: {
//       id: id,
//     }
//   });
//   await BlogPoster.destroy({
//     where: {
//       blogid: id,
//     }
//   });
//   await BlogFiles.destroy({
//     where: {
//       blogid: id,
//     }
//   });
//   res.status(200).json("Blog deleted successfully");

// });

// exports.findBlog = asyncHandler(async (req, res, next) => {
//   const { title } = req.body;
//   const foundBlog = await blog.findOne({
//     where: {
//       title: title
//     }
//   });
//   if (!foundBlog) return res.status(404).json({
//     message: "Blog not found",
//     success: False
//   });
//   const user = await users.findOne({
//     where: {
//       id: foundBlog.userid
//     }
//   });
//   const shortFoundBlog = {
//     title: foundBlog.title,
//     firstname: user.firstname,
//     lastname: user.lastname,
//     description: foundBlog.description,
//     likeCount: foundBlog.likeCount,
//     date: foundBlog.createdAt,
//   }
//   return res.status(200).json({
//     success: true,
//     data: shortFoundBlog
//   });
// });