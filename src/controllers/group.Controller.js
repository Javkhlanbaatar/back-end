const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const group = require("../models/group");
const groupMember = require("../models/groupMember");
const users = require("../models/users");
const GroupPoster = require("../models/groupPoster");
const Task = require("../models/task");
const Users = require("../models/users");
exports.createGroup = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const { name, description, status } = req.body;
  const same_group = await group.findOne({
    where: {
      name: name
    }
  });
  if (same_group) {
    return res.status(400).json({
      success: false,
      message: "Group Already Exists"
    });
  }
  const newGroup = await group.create({
    name: name,
    description: description,
    status: status,
  });
  if (newGroup) {
    console.log("created new group here")
    // return res.status(200).json({
    //     success: true,
    //     message: "Created New Group"
    // });
    const groupAdmin = await groupMember.create({
      userid: userid,
      groupid: newGroup.id,
      role: 1,
    });
    if (groupAdmin) {
      console.log("created admin for the new group here")
      return res.status(200).json({
        success: true,
        data: newGroup.dataValues,
        message: "Шинэ бүлэг үүсгэгдлээ",
      });
    }
  }
  else return res.status(400).json({
    success: false,
    message: "Failed to create new group"
  });
});

exports.createPoster = asyncHandler(async (req, res, next) => {
  const { groupid, poster } = req.body
  if (poster) {
    const blog_poster = await GroupPoster.create({
      groupid,
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

exports.getGroups = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const groupId = await groupMember.findAll({
    where: {
      id: userid
    },
  });
  let grouplist = [];
  for (item in groupId) {
    const onegroup = await group.findOne({
      where: item.groupid
    });
    const tasks = await Task.findAll({
      where: {
        groupid: onegroup.id
      }
    })
    onegroup.tasks = tasks;
    grouplist.push(onegroup);
  }

  return res.status(200).json({
    data: grouplist,
    message: "Blog list",
  });
});

exports.getGroup = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const group_group = await group.findOne({
    where: {
      id: id
    }
  });
  if (!group_group) {
    return res.status(404).json({
      success: false,
      message: "Group not found"
    });
  }
  const poster = await GroupPoster.findOne({
    where: {
      groupid: group_group.id
    }
  })
  group_group.poster = poster;

  const groupMembers = await groupMember.findAll({
    // in every group, the first member id of the group is always admin
    where: {
      groupid: group_group.id
    }
  });
  const memberList = []
  for (let i in groupMembers) {
    const user = await users.findOne({
      where: {
        id: groupMembers[i].userid
      }
    });
    memberList.push({...user, role: groupMembers[i].role})
  }
  group_group.members = memberList;

  const tasks = await Task.findAll({
    where: {
      groupid: group_group.id
    }
  })
  group_group.tasks = tasks;

  return res.status(200).json({
    data: group_group,
    success: true,
  });
});
