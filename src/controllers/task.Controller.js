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