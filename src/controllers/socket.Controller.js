const asyncHandler = require("../middleware/asyncHandler");
const { Op } = require("sequelize");
const chatMessage = require("../models/chatMessage");
const sequelize = require("../services/database");

exports.getChats = asyncHandler(async (req, res, next) => {
  const sender = req.userid;
  const receipt = req.params.userid;
  
  if (!receipt) {
    return res.status(400).json({
      success: false,
      message: "Bad request",
    });
  }

  try {
    const chatHistory = await chatMessage.findAll({
      order: [["id", "ASC"]],
      where: {
        [Op.or]: [
          { sender_id: sender, recipient_id: receipt },
          { sender_id: receipt, recipient_id: sender },
        ],
      },
    });
    return res.status(200).json({
      success: true,
      data: chatHistory,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
});

//for save chat
exports.writedm = asyncHandler(async (sockets, data) => {
  const cont = data.content;
  const sender = data.sender;
  const receipt = data.receipt;
  console.log(sender, receipt, cont);

  const chat = await chatMessage.create({
    sender_id: sender,
    recipient_id: receipt,
    content: cont.slice(0, 255),
  });
  if (chat) console.log("created chat backup");

  sockets.map((socket) => {
    if (socket) socket.emit("display dm", chat);
  })
});

exports.setAllChatReadStatus = asyncHandler(async (req, res) => {
  const senderId = req.body.senderId; // The sender whose messages should be marked as read
  const recipientId = req.body.recipientId; // The recipient who is viewing the messages
  console.log("Sender ID:", senderId);
  console.log("Recipient ID:", recipientId);
  await chatMessage.update(
    { read: true },
    { where: { sender_id: senderId, recipient_id: recipientId, read: false } }
  );

  res.status(200).json({
    success: true,
    message: `All chat messages from sender ${senderId} to recipient ${recipientId} have been marked as read.`,
  });
});

// getting number for notification.
exports.getUnreadMessageCounts = asyncHandler(async (req, res) => {
  const unreadMessageCounts = await chatMessage.findAll({
    attributes: [
      "sender_id",
      [sequelize.fn("count", sequelize.col("id")), "unread_count"],
    ],
    where: { recipient_id: req.params.userid, read: false },
    group: ["sender_id"],
  });

  res.status(200).json({
    success: true,
    data: unreadMessageCounts,
  });
});
