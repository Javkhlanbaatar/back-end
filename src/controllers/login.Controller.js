const jwt = require("jsonwebtoken");
const { Op, QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const Users = require("../models/users");
const profile = require("../models/upload");
// const io = require('socket.io');


exports.Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Параметр дутуу байна.",
    });
  }

  const user = await Users.findOne({
    where: {
      [Op.or]: [
        { email: email },
        { username: email },
      ],
    },
  });
  
  if (!user) {
    return res.status(500).json({
      success: false,
      message: "Бүртгэлгүй байна",
    });
  }

  const oldPassword = user.password;

  const passwordMatch = await bcrypt.compare(password, oldPassword);

  if (passwordMatch) {
    const attributes = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(
      {
        userid: attributes.id,
        username: attributes.username,
        email: attributes.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRESIN,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Амжилттай нэвтэрлээ",
      userid: user.id,
      token,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "Нэвтрэх нэр эсвэл нууц үг буруу байна",
    });
  }
});

exports.adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  //console.log(req.body)
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Параметр дутуу байна.",
    });
    return;
  }
  await Users.findOne({
    where: {
      email: email,
    },
  }).then((result) => {
      //console.log("******", result);
      if (result == null) {
        res.status(500).json({
          success: false,
          message: "Бүртгэлгүй байна",
        });
        return;
      }
      if(result.role === "User"){
        res.status(500).json({
          success:false,
          message: "Бүртгэлтэй админ биш!",
        });
        return;
      }
      const oldPassword = result.password;

      bcrypt.compare(password, oldPassword).then(async (result) => {
        if (result == true) {
          const attributes = await Users.findOne({
            attributes: ["id", "username", "email"],
            where: {
              [Op.and]: [
                {
                  email,
                },
              ],
            },
          });

          const userid = attributes.id;
          const username = attributes.username;
          const token = jwt.sign(
            {
              userid,
              username,
              email,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRESIN,
            }
          );
          //  const token = userController.generateJwt(userid, roleid);
          //   console.log("login authorized!!!!!")
          res.status(200).json({
            success: true,
            message: "Амжилттай нэвтэрлээ",
            token,
          });
          return;
        } else {
          console.log("this");
          res.status(400).json({
            success: false,
            message: "Нэвтрэх нэр эсвэл нууц үг буруу байна",
          });
        }
      });
    })
    .catch((err) => {
      // console.log(err)
      // logger.error("Алдаа гарлаа: " + err);
      return res.status(500).json({
        success: false,
        message: "Серверийн алдаа",
      });
    });
});

exports.changePassword= asyncHandler(async (req, res, next) => {
  const { oldPass, newPass, newPass2} = req.body;
  const email = req.email;
  console.log(email, oldPass, newPass, newPass2);
  if(newPass !==newPass2) {
    return res.status(400).json({
      success:false,
      message:"Passwords not match"
    });
  }
  await Users.findOne({
    where: {
      email: email,
      verified: true,
    },
  })
    .then((result) => {
      //console.log("******", result);
      console.log("found result: "+result.username);
      if (result == null) {
        res.status(500).json({
          success: false,
          message: "Бүртгэлгүй байна",
        });
        return;
      }
      const oldPassword = result.password;
      const id = result.id;
      bcrypt.compare(oldPass, oldPassword).then(async (result) => {
        if (result == true) {
          console.log("old password matched");
          //end shine pass davslah yostoi
          const salt = await bcrypt.genSalt(10);
          const encryptedPassword = await bcrypt.hash(newPass, salt);
          let changePass ={};
        changePass.password = encryptedPassword;
        console.log("updating password")
          await Users.update(changePass, { where: { id:id } });
          res.status(200).json({
            success: true,
            message: "Changed password",
          });
          return;
        } else {
          res.status(400).json({
            success: false,
            message: "Old password is wrong",
          });
        }
      });
    });

});
