const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");

exports.protect = asyncHandler(async (req, res, next) => {
  console.log(req.headers.authorization);
  if (!req.headers.authorization) {
    req.userid = "";
    req.email = "";
    req.username = "";

    next();
  }
  const token = req.headers.authorization?.split(" ")[1];
  //request-н header хэсгээс bearer токен авах
  if (!token || token == "undefined") {
    req.userid = "";
    req.email = "";
    req.username = "";

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
      res.status(401).json({
        success: false,
        message: "Токен хүчингүй байна.",
        err,
      });
      return;
    }
  }
});
