const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");

exports.extractToken = asyncHandler(async (req, res, next) => {
  console.log(req.headers.authorization);
  if (!req.headers.authorization) {
    req.userid = "";
    req.email = "";
    req.username = "";
    console.log("No authorization");

    next();
  }
  const token = req.headers.authorization?.split(" ")[1];
  //request-н header хэсгээс bearer токен авах
  if (!token || token == "undefined") {
    req.userid = "";
    req.email = "";
    req.username = "";
    console.log("No token");

    next();
  } else {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      const decoded = jwt.decode(token, { complete: true });

      req.userid = decoded.payload.userid;
      req.email = decoded.payload.email;
      req.username = decoded.payload.username;

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Токен хүчингүй байна.",
        err,
      });
    }
  }
});

exports.loggedIn = asyncHandler(async (req, res, next) => {
  const userid = req.userid;
  if (!userid) {
    return res.status(401).json({
      success: false,
      message: "Login first",
    });
  }

  next();
});
