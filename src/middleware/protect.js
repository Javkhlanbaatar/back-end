const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");

exports.protect = asyncHandler(async (req, res, next) => {
  console.log(req.headers.authorization);
  if (!req.headers.authorization) {
    res.status(401).json({
      success: false,
      message: "Нэвтэрсний дараа энэ үйлдлийг хийх боломжтой",
    });
    return;
  }
  //request-н header хэсгээс bearer токен авах
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Нэвтэрсний дараа энэ үйлдлийг хийх боломжтой",
    });
    return;
  }
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
});
