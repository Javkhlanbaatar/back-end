let express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require('path');
const app = express();
const port = process.env.PORT;

// // Set up view engine
// app.set('view engine', 'ejs');
// app.set('views', './src/views');

//copy code from this github if it's necessary https://github.com/bradtraversy/chatcord

//const indexRoute = require('./routes/index.Route');
const loginRoute = require('../routes/login.Route');
const usersRoute = require('../routes/users.Route');
//db table add 
const Users = require('../models/users')
const Upload = require('../models/upload');
const ChatMessage = require('../models/chatMessage');

const friend = require('../models/friend');
const group = require('../models/group');
const groupmember = require('../models/groupMember');
const blog = require('../models/blog');
const task = require('../models/task');
const taskreport = require('../models/taskReport');
const blogfiles = require("../models/blogFiles");

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

  
  const loginRoute = require('../routes/login.Route');
  const usersRoute = require('../routes/users.Route');
  const uploadRoute = require('../routes/upload.Route');
  const socketRoute = require('../routes/socket.Route');
  const blogRoute = require('../routes/blog.Route');
  const groupRoute = require('../routes/group.Route');
  
  app.use('/auth', loginRoute);
  app.use('/user', usersRoute);
  app.use('/image',uploadRoute );
  app.use('/blog', blogRoute);
  app.use('/group', groupRoute);
  app.use('/uploads', express.static(path.join(__dirname, '../src/upload'))); // Serve static files from the 'src/upload' folder
  app.use('/socket',socketRoute);
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/upload/index.html'));
  });
  

  app.use("/public", express.static("public"));

  Users.sync()
  .then(() => {ChatMessage.sync();friend.sync()});
  group.sync().then(() => {groupmember.sync(); task.sync();})
  .then(() => blog.sync()).then(() => taskreport.sync())
  .then(() => Upload.sync()).then(() => blogfiles.sync());
  app.listen(process.env.PORT, function () {
    console.log("Server is ready at" + process.env.PORT);
  });
}

function close() {}

module.exports.initialize = initialize;
module.exports.close = close;