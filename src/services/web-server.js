let express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

//db table add
const Users = require("../models/users");
const ChatMessage = require("../models/chatMessage");
const friend = require("../models/friend");
const Group = require("../models/group");
const GroupMember = require("../models/groupMember");
const Blog = require("../models/blog");
const Task = require("../models/task");
const BlogFiles = require("../models/blogFiles");
const userprofile = require("../models/userProfile");
const BlogPoster = require("../models/blogPoster");
const GroupPoster = require("../models/groupPoster");
const TaskFiles = require("../models/taskFiles");
const BlogLikes = require("../models/blogLikes");

// const scheduler = require("./scheduler"); // устгаж болохгүй!!!
function initialize() {
  const app = express();
  app.use(morgan("dev"));
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: false }));
  app.use(
    express.json({
      limit: "50mb",
    })
  );
  app.use(
    express.urlencoded({
      limit: "50mb",
    })
  );
  app.use(
    helmet.hidePoweredBy(),
    helmet.noSniff(),
    helmet.xssFilter(),
    helmet.contentSecurityPolicy(),
    helmet.crossOriginEmbedderPolicy(),
    helmet.frameguard()
  );
  app.use(cors());
  app.use(express.json());

  const loginRoute = require("../routes/login.Route");
  const usersRoute = require("../routes/users.Route");
  const socketRoute = require("../routes/socket.Route");
  const blogRoute = require("../routes/blog.Route");
  const groupRoute = require("../routes/group.Route");
  const taskRoute = require("../routes/task.Route");

  app.use("/auth", loginRoute);
  app.use("/user", usersRoute);
  app.use("/blog", blogRoute);
  app.use("/group", groupRoute);
  app.use("/socket", socketRoute);
  app.use("/task", taskRoute);

  Users.sync().then(() => {
    userprofile.sync();
    ChatMessage.sync();
    friend.sync();
  });
  Group.sync().then(() => {
    GroupPoster.sync();
    GroupMember.sync();
    Task.sync().then(() => {
      TaskFiles.sync();
    });
  });

  Blog.sync().then(() => {
    BlogPoster.sync();
    BlogFiles.sync();
    BlogLikes.sync();
  });

  app.listen(process.env.PORT, function () {
    console.log("Server is ready at" + process.env.PORT);
  });
}

function close() {}

module.exports.initialize = initialize;
module.exports.close = close;
