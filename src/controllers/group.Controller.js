const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const group = require("../models/group");
const groupMember = require("../models/groupMember");
const users = require("../models/users");
exports.createGroup = asyncHandler(async (req, res, next) => {
    const userid = req.userid;
    const {name, description, status} = req.body;
    const newGroup = await group.create({
        name: name,
        description: description,
        status: status,
    });
    if(newGroup){
        console.log("created new group here")
        // return res.status(200).json({
        //     success: true,
        //     message: "Created New Group"
        // });
        const groupAdmin = await groupMember.create({
            userid:userid,
            groupid: newGroup.id,
            role: 1,
        });
        if(groupAdmin){
            console.log("created admin for the new group here")
            return res.status(200).json({
                success:true,
                message: "Шинэ бүлэг үүсгэгдлээ"
            });
        }
    }
    else return req.status(400).json({
        succes: false, 
        message: "Failed to create new group"
    });
});

exports.getGroups = asyncHandler(async (req, res, next) => {
  //method for admin that gets every users
  const grouplist = await group.findAll({
      order: [["id", "DESC"]],
    })
    
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
      message: "group not found"
    });
  }
  const groupMembers = await groupMember.findAll({
    // in every group, the first member id of the group is always admin
    where:{
        groupid: group_group.id
    },
    attributes:{userid}
  });
  const memberList = []
  for(let i in groupMembers){
    const user = await users.findOne({
        where: {
            id: groupMembers[i].userid
        },
        attributes:{firstname, lastname}
    });
    memberList.push(user)
  }
  group_group.memberList = memberList
  return res.status(200).json({
    data: group_group,
    success: true,
  });
});
