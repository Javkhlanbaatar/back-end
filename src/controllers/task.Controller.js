const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const Task = require("../models/task");
const TaskFiles = require("../models/taskFiles");
const Blog = require("../models/blog");
const GroupMember = require("../models/groupMember");
const Users = require("../models/users");
const BlogPoster = require("../models/blogPoster");
const TaskAssignment = require("../models/taskAssignment");
exports.createTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { groupid, title, description, starttime, endtime } = req.body;

  if (!groupid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const new_task = await Task.create({
      groupid,
      userid,
      title,
      description,
      starttime,
      endtime,
    });
    if (!new_task) {
      return req.status(400).json({
        success: false,
        message: "Failed to create new task",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Created new task",
      data: new_task.dataValues,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.createTaskFile = asyncHandler(async (req, res, next) => {
  const { taskid, files } = req.body;
  if (!taskid || !files) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const new_files = await Promise.all(
      files.map((item) =>
        TaskFiles.create({
          taskid: taskid,
          filename: file.name,
          filesize: file.size,
          filelink: file.link,
        })
      )
    );
    return res.status(200).json({
      success: true,
      message: "Created New Task Files",
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

exports.getTasks = asyncHandler(async (req, res, next) => {
  const { groupid } = req.groupid;

  if (!groupid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const taskList = await Task.findAll({
      where: {
        groupid,
      },
      order: [["id", "DESC"]],
    });
    return res.status(200).json({
      success: true,
      data: taskList,
      message: "Task list",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.getTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;
  const { short } = req.query;

  if (!taskid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const task = await Task.findOne({
      where: {
        id: taskid,
      },
    });

    if (!short) {
      const blogs = await Blog.findAll({
        where: {
          taskid: taskid,
        },
      });
      task.blogs = blogs;
    }

    const adminMember = await GroupMember.findAll({
      where: {
        groupid: task.groupid,
        role: 1,
      },
    });
    const admin = await Users.findAll({
      attributes: { exclude: ["role", "password", "createdAt", "updatedAt"] },
      where: {
        id: adminMember.map((item) => item.userid),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task",
      data: {
        task: task,
        admin: admin,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.editTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;
  const { title, description, starttime, endtime, files } = req.body;

  if (!taskid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const task = await Task.update(
      {
        title: title,
        description: description,
        starttime: starttime,
        endtime: endtime,
      },
      {
        where: {
          id: taskid,
        },
      }
    );

    await TaskFiles.destroy({
      where: {
        taskid: taskid,
      },
    });

    if (files) {
      const taskFiles = await Promise.all(
        files.map((item) =>
          TaskFiles.create({
            taskid: taskid,
            filename: item.name,
            filesize: item.size,
            filelink: item.link,
          })
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "Task updated",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.deleteTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;

  if (!taskid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const task = await Task.destroy({
      where: {
        id: taskid,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.getAssignedBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;

  if (!taskid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const task = await Task.findOne({
      where: {
        id: taskid,
      },
    });
    const admin = await GroupMember.findOne({
      where: {
        userid: userid,
        groupid: task.groupid,
        role: 1,
      },
    });
    if (!admin)
      return res.status(400).json({
        success: false,
        message: "Not admin",
      });

    const assignments = await TaskAssignment.findAll({
      where: {
        taskid: taskid,
      },
    });
    const blogList = await Promise.all(
      assignments.map((item) =>
        Blog.findOne({
          where: {
            id: item.blogid,
          },
        })
      )
    );

    const blogs = await Promise.all(
      blogList.map(async (blog) => {
        const [user, poster, assign] = await Promise.all([
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
          TaskAssignment.findOne({
            where: {
              blogid: blog.id,
              taskid: taskid,
            },
          }),
        ]);
        return {
          ...blog,
          user: user,
          grade: assign.grade,
          poster,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Assigned blogs",
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

exports.assignBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;
  const { blogid } = req.body;

  if (!taskid || !blogid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    // Check if on time
    const task = await Task.findOne({
      where: {
        id: taskid,
      },
    });
    const now = new Date();
    if (now < task.starttime) {
      return res.status(400).json({
        success: false,
        message: "Too early",
      });
    }
    if (now > task.endtime) {
      return res.status(400).json({
        success: false,
        message: "Too late",
      });
    }

    const exists = await TaskAssignment.findOne({
      where: {
        taskid: taskid,
        blogid: blogid,
      },
    });
    if (exists) {
      await TaskAssignment.update(
        {
          blogid: blogid,
        },
        {
          where: {
            taskid: taskid,
          },
        }
      );
    } else {
      await TaskAssignment.create({
        taskid: taskid,
        blogid: blogid,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog assigned",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.gradeBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;
  const { blogid, score } = req.body;

  if (!taskid || !blogid || !score) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const task = await Task.findOne({
      where: {
        id: taskid,
      },
    });
    const admin = await GroupMember.findOne({
      where: {
        userid: userid,
        groupid: task.groupid,
        role: 1,
      },
    });
    if (!admin)
      return res.status(400).json({
        success: false,
        message: "Not admin",
      });
  
    await TaskAssignment.update(
      {
        grade: score,
      },
      {
        where: {
          taskid: taskid,
          blogid: blogid,
        },
      }
    );
  
    return res.status(200).json({
      success: true,
      message: "Blog graded",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});
