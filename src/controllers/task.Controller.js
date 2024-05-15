const { Op, QueryTypes } = require("sequelize");
const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const Task = require("../models/task");
const TaskFiles = require("../models/taskFiles");
const Blog = require("../models/blog");
const GroupMember = require("../models/groupMember");
const Users = require("../models/users");
exports.createTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { groupid, title, description, starttime, endtime } = req.body;

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
      succes: false,
      message: "Failed to create new task",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Created new task",
    data: new_task.dataValues,
  });
});

exports.createTaskFile = asyncHandler(async (req, res, next) => {
  const { taskid, files } = req.body;
  if (files) {
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
  } else
    return res.status(400).json({
      success: false,
      message: "File is empty",
    });
});

exports.getTasks = asyncHandler(async (req, res, next) => {
  const { groupid } = req.groupid;
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
});

exports.getTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;

  const task = await Task.findOne({
    where: {
      id: taskid,
    },
  });
  console.log(taskid);

  const blogs = await Blog.findAll({
    where: {
      taskid: taskid,
    },
  });
  task.blogs = blogs;

  const adminMember = await GroupMember.findAll({
    where: {
      groupid: task.groupid,
      role: 1,
    },
  });
  const admin = await Users.findAll({
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
});

exports.editTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const taskid = req.params.id;
  const { title, description, starttime, endtime, files } = req.body;

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
});

exports.deleteTask = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { taskid } = req.params;

  const task = await Task.destroy({
    where: {
      id: taskid,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Task deleted",
  });
});

exports.gradeBlog = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { taskid } = req.params;
  const { blogid, grade } = req.body;

  const blog = Blog.update(
    {
      grade: grade,
    },
    {
      where: {
        id: blogid,
        taskid: taskid,
      },
    }
  );

  return res.status(200).json({
    success: true,
    message: "Blog graded",
  });
});
