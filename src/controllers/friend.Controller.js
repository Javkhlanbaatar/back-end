const asyncHandler = require("../middleware/asyncHandler");
const Friend = require("../models/friend");
const Users = require("../models/users");

exports.getFriends = asyncHandler(async (req, res, next) => {
  const userid = req.params.id;

  if (!userid) {
    return res.status(400).json({
      success: false,
      message: "Id is empty",
    });
  }

  try {
    const friendsId = await Friend.findAll({
      where: {
        userid,
      },
    });

    const friends = [
      friendsId.map((item) =>
        Users.findOne({
          attributes: {
            exclude: ["role", "password", "createdAt", "updatedAt"],
          },
          where: {
            userid: item.friendid,
          },
        })
      ),
    ];

    return res.status(200).json({
      success: true,
      message: "Friends",
      data: friends,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.addFriend = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const friendId = Number(req.params.id);

  if (!friendId) {
    return res.status(400).json({
      success: false,
      message: "Id is empty",
    });
  }

  if (userid === friendId) {
    return res.status(400).json({
      success: false,
      message: "Can't friend yourself",
    });
  }

  try {
    const friend = await Friend.findOne({
      where: {
        userid,
        friendid: friendId,
      },
    });

    if (friend) {
      return res.status(400).json({
        success: false,
        message: "Friend already added",
      });
    }

    await Friend.create({
      userid,
      friendid: friendId,
      accepted: false,
    });

    const accepted = await Friend.findOne({
      where: {
        userid: friendId,
        friendid: userid,
      },
    });

    if (accepted) {
      await Friend.update(
        {
          accepted: true,
        },
        {
          where: {
            userid,
            friendid: friendId,
          },
        }
      );
      await Friend.update(
        {
          accepted: true,
        },
        {
          where: {
            userid: friendId,
            friendid: userid,
          },
        }
      );
      await Users.increment("friendCount", {
        where: {
          id: userid,
        },
      });
      await Users.increment("friendCount", {
        where: {
          id: friendId,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Friend added",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

exports.removeFriend = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const friendId = req.params.id;

  if (!friendId) {
    return res.status(400).json({
      success: false,
      message: "Id is empty",
    });
  }

  if (userid == friendId) {
    return res.status(400).json({
      success: false,
      message: "Can't friend yourself",
    });
  }

  try {
    const friend = await Friend.findOne({
      where: {
        userid,
        friendid: friendId,
      },
    });
  
    if (!friend) {
      return res.status(400).json({
        success: false,
        message: "Not friends",
      });
    }
  
    await Friend.destroy({
      where: {
        userid,
        friendid: friendId,
      },
    });
    await Friend.destroy({
      where: {
        userid: friendId,
        friendid: userid,
      },
    });
  
    await Users.decrement("friendCount", {
      where: {
        id: userid,
      },
    });
    await Users.decrement("friendCount", {
      where: {
        id: friendId,
      },
    });
  
    return res.status(200).json({
      success: true,
      message: "Friend removed",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});
