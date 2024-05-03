const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const group = require("../models/group");
const groupMember = require("../models/groupMember");
const users = require("../models/users");
const GroupPoster = require("../models/groupPoster");
const Task = require("../models/task");
const Users = require("../models/users");
const { checkout, post } = require("../routes/group.Route");
exports.createGroup = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

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
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }
  
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
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const groups = await groupMember.findAll({
    where: {
      userid: userid
    },
  });
  let grouplist = [];
  for (item of groups) {
    const onegroup = await group.findOne({
      where: {
        id: item.groupid
      }
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
  const userid = req.userid;
  if (!userid) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }
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


exports.updateGroup = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (userid !== id) {
    res.status(401).json({
      success: false,
      message: "Not Allowed"
    });
  }

  const id = req.params.id;
  const { name, description, status, poster } = req.body;
  
  try {
    const updatedGroup = await group.update({
      name: name,
      description: description,
      status: status,
    }, {
      where: {
        id
      }
    });
    if (poster) {
      const updatedGroup = await GroupPoster.update({
        groupid: id,
        ...poster,
      }, {
        where: {
          id
        }
      });
    }
    return res.status(200).json({
      success: true,
      message: "Group updated",
      data: updatedGroup
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Failed to update group",
      err
    });
  }
});