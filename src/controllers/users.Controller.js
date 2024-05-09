const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const users = require("../models/users");
const blogs = require("../models/blog");
const UserProfile = require("../models/userProfile");
const BlogPoster = require("../models/blogPoster");
const Blog = require("../models/blog");
const Friend = require("../models/friend");

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
  const userid = req.userid;
  const username = req.params.username;
  const page = req.query.page;
  const perPage = req.query.perPage;

  const exists = await users.findOne({
    where: {
      username: username,
    },
  });

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const friend = await Friend.findOne({
    where: {
      userid: userid,
      friendid: exists.id,
      accepted: true,
    },
  });

  let who = "";
  if (userid === exists.id) who = "owner";
  else if (friend) who = "friend";

  const [user, all_blogs, friends] = await Promise.all([
    userDetails(exists.id),
    userBlogs(exists.id, who, page, perPage),
    userFriends(exists.id),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      ...user,
      friend: friend ? true : false,
      friends: friends,
      blogs: all_blogs,
    },
  });
});

const userDetails = async (id) => {
  const user = await users.findOne({
    where: {
      id: id,
    },
  });

  if (!user) {
    return null;
  }

  const profile = await UserProfile.findOne({
    where: {
      userid: user.id,
    },
  });

  return {
    ...user,
    profile: profile,
  };
};

const userBlogs = async (id, who, page, perPage) => {
  let all_blogs = [];

  if (who === "owner") {
    all_blogs = await blogs.findAll({
      where: {
        userid: id,
      },
    });
  }
  else if (who === "friend") {
    all_blogs = await blogs.findAll({
      where: {
        [Op.or]: [{
          userid: id,
          status: 0,
        },
        {
          userid: id,
          status: 1,
        },
      ]
      },
      order: [["id", "DESC"]],
    });
  }
  else {
    all_blogs = await blogs.findAll({
      where: {
        userid: id,
        status: 0
      },
    });
  }

  all_blogs = await Promise.all(
    all_blogs.map(async (blog) => {
      const poster = await BlogPoster.findOne({
        where: {
          blogid: blog.id,
        },
      });
      blog.poster = poster;
      return blog;
    })
  );

  let pages = 1;

  const blogData = {
    data: all_blogs,
    page: page? page : 1,
    perPage: perPage? perPage : 100,
    pages: pages
  }

  if (page && perPage) {
    blogData.data = blogData.data.slice(0+((page-1)*perPage), page*perPage);
    blogData.pages = Math.ceil(all_blogs.length / perPage);
  }

  return blogData;
};

const userFriends = async (id) => {
  const friendsId = await Friend.findAll({
    where: {
      userid: id,
      accepted: true,
    },
  });
  const friends = await Promise.all(
    friendsId.map(async (item) => await userDetails(item.friendid))
  );
  return friends;
};

exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const userid = req.userid;

  const userProfile = await UserProfile.findOne({
    where: {
      userid: userid
    }
  });

  return res.status(200).json({
    success: true,
    data: userProfile
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const userid = req.userid;
  const { firstname, lastname, email, phonenumber, profile } = req.body;

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
  const id = Number(req.params.id);

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
    return res.status(404).json({
      success: false,
      message: "User doesn't exist",
    });
  }

  await users.destroy({
    where: {
      id: id,
    },
  });

  return res.status(200).json({
    success: false,
    message: "User removed successfully!",
  });
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
