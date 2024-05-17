const http = require("http");
const socketIO = require("socket.io");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {
  writeAllChat,
  getAllChat,
  writedm,
} = require("../controllers/socket.Controller");

const app = express();

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let connectedUsers = 0;
let userSockets = {};
let onlineUsers = [];
async function initialize() {
  console.log("Connecting to chatting server");

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("invalid token"));
    }
    jwt.verify(token, process.env.JWT_SECRET);
    const decoded = jwt.decode(token, { complete: true });
    socket.userid = decoded.payload.userid;
    next();
  });

  io.on("connection", (socket) => {
    console.log("chatting server is online...");
    userSockets[socket.userid] = socket;

    // Listen for the login event to receive the username from the client
    socket.on("login", (data) => {
      console.log(`${data.username} has connected`);
      // Store the ssocket with the username in the object
      connectedUsers++;
      onlineUsers.push(data.userid);
      socket.emit("onlineUsers", onlineUsers);
    });

    socket.on("to", (data) => {
      
    });

    socket.on("all chat", (data) => {
      writeAllChat(io, data);
      console.log(connectedUsers);
      // console.log("message sent: " + data.reciept + " from: " + data.username);
    });

    socket.on("dm", (data) => {
      writedm([userSockets[data.sender], userSockets[data.receipt]], data);
      // console.log("message sent: " + data.reciept + " from: " + data.username);
    });

    socket.on("display all chat", (userid) => {
      getAllChat(io, userid);
    });

    socket.on("close", (data) => {
      console.log(`${data.username}'s disconnected`);
      connectedUsers--;

      if (data.id !== -1) {
        // Use the filter method to remove all elements equal to data.id from the onlineUsers array
        onlineUsers = onlineUsers.filter((userId) => userId !== data.id);
      }

      socket.emit("onlineUsers", onlineUsers);
    });
  });

  server.listen(process.env.SOCKET_PORT, () => {
    console.log(
      `Socket.IO server listening on port ${process.env.SOCKET_PORT}`
    );
  });

  // Listen for SIGINT (Ctrl+C) and SIGUSR2 (used by Nodemon) signals and disconnect all sockets
  process.on("SIGINT", disconnectSockets);
  process.on("SIGUSR2", disconnectSockets);
}

function disconnectSockets() {
  Object.values(userSockets).forEach((socket) => socket.disconnect());
  process.exit(); // Exit the process after all sockets are disconnected
}

async function close() {
  console.log("Chatting server closing...");
  // Place any cleanup or closing logic here, if needed
}

module.exports.initialize = initialize;
module.exports.close = close;
module.exports.getConnectedUsers = () => connectedUsers;
