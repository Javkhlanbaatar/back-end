const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const blogs = require("../models/blog");
const UserProfile = require("../models/userProfile");
const BlogPoster = require("../models/blogPoster");

exports.createUser = asyncHandler(async (req, res, next) => {
  const { username, firstname, lastname, email, phonenumber, password } =
    req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Талбар дутуу байна",
    });
  }

  try {
    const existingUser = await users.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Бүртгэлтэй байна",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const newUser = await users
      .create({
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: encryptedPassword,
        phonenumber: phonenumber,
      })
      .then(console.log(`User created`));
    await UserProfile.create({
      userid: newUser.dataValues.id,
    }).then(console.log("User profile created"));

    res.status(200).json({
      success: true,
      message: "Бүртгэл үүслээ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа",
    });
  }
});

exports.getUsers = asyncHandler(async (req, res, next) => {
  //method for admin that gets every users
  const userList = await users
    .findAll({
      raw: true,
      order: [["id", "DESC"]],
      raw: true,
    })
    .catch((err) => {
      res.status(500).json({
        message: "Серверийн алдаа",
      });
    });
  return res.status(200).json({
    userList,
    message: "Хэрэглэгчийн жагсаалт",
  });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const username = req.params.username;

  const user = await users.findOne({
    where: {
      username: username,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const blog = await blogs.findAll({
    where: {
      userid: user.id,
    },
  });

  const blog_blogs = [];

  for (item of blog) {
    const blog_poster = await BlogPoster.findOne({
      where: {
        blogid: item.id,
      },
    });
    item.poster = blog_poster;
    blog_blogs.push(item);
  }

  const profile = await UserProfile.findOne({
    where: {
      userid: user.id,
    },
  });

  return res.status(200).json({
    success: true,
    user: {
      ...user,
      image: profile?.filelink,
    },
    blogs: blog_blogs,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const userid = req.userid;
  const { firstname, lastname, email, phonenumber, profile } = req.body;
  console.log(req.body);

  if (userid != id) {
    return res.status(401).json({
      success: false,
      message: "Not Allowed",
    });
  }

  const updatedUser = {
    firstname,
    lastname,
    email,
    phonenumber,
  };
  await users.update(updatedUser, {
    where: {
      id: id,
    },
  });
  if (profile) {
    await UserProfile.update(
      {
        filename: profile.name,
        filesize: profile.size,
        filelink: profile.link,
      },
      {
        where: {
          userid: id,
        },
      }
    );
  }

  return res.status(200).json({
    success: true,
    message: "User info edited",
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  const id = req.params.id;

  if (userid != id) {
    res.status(401).json({
      success: false,
      message: "Not Allowed",
    });
  }

  const user = await users.findOne({
    where: {
      id: id,
    },
  });

  if (!user) {
    return res.status(404).json("User doesn't exist");
  }

  await users.destroy({
    where: {
      id: id,
    },
  });
  await UserProfile.destroy({
    where: {
      userid: id,
    },
  });
  return res.status(200).json("User removed successfully!");
});

exports.findUser = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const existingUsers = await users.findAll({
    where: {
      [Op.or]: [{ firstname: name }, { lastname: name }],
    },
  });

  return res.status(200).json({
    success: true,
    data: existingUsers,
  });
  //
});

exports.addFriend = asyncHandler(async (req, res, next) => {});
