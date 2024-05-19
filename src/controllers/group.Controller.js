const asyncHandler = require("../middleware/asyncHandler");
const group = require("../models/group");
const groupMember = require("../models/groupMember");
const users = require("../models/users");
const GroupPoster = require("../models/groupPoster");
const Task = require("../models/task");
const GroupMember = require("../models/groupMember");
exports.createGroup = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const { name, description, status, members } = req.body;

  try {
    const same_group = await group.findOne({
      where: {
        name: name,
      },
    });
    if (same_group) {
      return res.status(400).json({
        success: false,
        message: "Group Already Exists",
      });
    }

    const newGroup = await group.create({
      name: name,
      description: description,
      status: status,
    });

    const groupAdmin = await groupMember.create({
      userid: userid,
      groupid: newGroup.id,
      role: 1,
    });

    if (members) {
      const new_members = await Promise.all(
        members.map(async (member) =>
          groupMember.create({
            userid: member.id,
            groupid: newGroup.id,
            role: 0,
          })
        )
      );
    }

    return res.status(200).json({
      success: true,
      data: newGroup.dataValues,
      message: "Шинэ бүлэг үүсгэгдлээ",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.createPoster = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const { groupid, poster } = req.body;
  if (!groupid || !poster) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }
  try {
    const blog_poster = await GroupPoster.create({
      groupid,
      filename: poster.name,
      filesize: poster.size,
      filelink: poster.link,
    });
    return res.status(200).json({
      success: true,
      message: "Created New Blog Poster",
      data: blog_poster.dataValues,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.addMember = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const groupid = req.params.id;
  const { memberid } = req.body;

  if ((!groupid, !memberid)) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const admin = await GroupMember.findOne({
      where: {
        groupid: groupid,
        userid: userid,
        role: 1,
      },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Not admin",
      });
    }

    const exists = await GroupMember.findOne({
      where: {
        groupid: groupid,
        userid: memberid,
      },
    });

    if (exists)
      return res.status(400).json({
        success: false,
        message: "Already member",
      });

    const member = await GroupMember.create({
      groupid: groupid,
      userid: memberid,
      role: 0,
    });

    return res.status(200).json({
      success: true,
      message: "Member added",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.deleteMember = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const groupid = req.params.id;
  const { memberid } = req.body;

  if (!groupid || !memberid) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const admin = await GroupMember.findOne({
      where: {
        groupid: groupid,
        userid: userid,
        role: 1,
      },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Not admin",
      });
    }

    const exists = GroupMember.findOne({
      where: {
        groupid: groupid,
        userid: memberid,
      },
    });

    if (!exists)
      return res.status(400).json({
        success: false,
        message: "Member doesn't exist",
      });

    await GroupMember.destroy({
      where: {
        groupid: groupid,
        userid: memberid,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member deleted",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.getGroups = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  try {
    const groups = await groupMember.findAll({
      where: {
        userid: userid,
      },
    });
    let grouplist = [];
    for (item of groups) {
      const onegroup = await group.findOne({
        where: {
          id: item.groupid,
        },
      });
      const tasks = await Task.findAll({
        where: {
          groupid: onegroup.id,
        },
      });
      onegroup.tasks = tasks;
      grouplist.push(onegroup);
    }

    return res.status(200).json({
      data: grouplist,
      message: "Blog list",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.getGroup = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    let group_group = null;
    if (!userid) {
      group_group = await group.findOne({
        where: {
          id: id,
          status: 0
        },
      });
    } else {
      const temp = await group.findOne({
        where: {
          id: id
        }
      });
      if (temp) {
        const member = await GroupMember.findOne({
          where: {
            groupid: id,
            userid: userid
          }
        });
        if (member) {
          group_group = temp;
        }
      }
    }
    if (!group_group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }
    const poster = await GroupPoster.findOne({
      where: {
        groupid: group_group.id,
      },
    });
    group_group.poster = poster;

    const groupMembers = await groupMember.findAll({
      // in every group, the first member id of the group is always admin
      where: {
        groupid: group_group.id,
      },
    });
    const memberList = [];
    for (let i in groupMembers) {
      const user = await users.findOne({
        attributes: { exclude: ["role", "password", "createdAt", "updatedAt"] },
        where: {
          id: groupMembers[i].userid,
        },
      });
      memberList.push({ ...user, role: groupMembers[i].role });
    }
    group_group.members = memberList;

    const tasks = await Task.findAll({
      where: {
        groupid: group_group.id,
      },
    });
    group_group.tasks = tasks;

    return res.status(200).json({
      data: group_group,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.updateGroup = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const id = req.params.id;
  const { name, description, status, poster } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const updatedGroup = await group.update(
      {
        name: name,
        description: description,
        status: status,
      },
      {
        where: {
          id,
        },
      }
    );
    if (poster) {
      const updatedGroup = await GroupPoster.update(
        {
          groupid: id,
          ...poster,
        },
        {
          where: {
            id,
          },
        }
      );
    }
    if (members) {
      const new_members = await Promise.all(
        members.map(async (member) => {
          const exists = groupMember.findOne({
            where: {
              groupid: id,
              userid: member.id,
            },
          });

          if (exists) return;

          return groupMember.create({
            userid: member.id,
            groupid: newGroup.id,
            role: 0,
          });
        })
      );
    }
    return res.status(200).json({
      success: true,
      message: "Group updated",
      data: updatedGroup,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.deleteGroup = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const { name, description, status, poster } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const updatedGroup = await group.update(
      {
        name: name,
        description: description,
        status: status,
      },
      {
        where: {
          id,
        },
      }
    );
    if (poster) {
      const updatedGroup = await GroupPoster.update(
        {
          groupid: id,
          ...poster,
        },
        {
          where: {
            id,
          },
        }
      );
    }
    return res.status(200).json({
      success: true,
      message: "Group updated",
      data: updatedGroup,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});
