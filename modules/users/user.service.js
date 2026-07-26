const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./user.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../common/middlewares/authentication.middleware");

exports.loginService = async (identifier, password) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone_no: identifier }],
  });
  if (!user) {
    throw new Error("No user found");
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    throw new Error("Invalid Password");
  }

  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone_no: user.phone_no,
    role: user.role,
  };

  const access_token = generateAccessToken(payload);
  const refresh_token = generateRefreshToken({
    _id: user._id,
  });

  user.refresh_token = refresh_token;
  await user.save();

  return { access_token, refresh_token };
};

exports.regsiterService = async (name, email, phone_no, password) => {
  const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
  if (existingUser) {
    throw new Error("Use different email or phone");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phone_no,
    password: hashedPassword,
  });

  return user;
};

exports.createRefreshTokenService = async (token) => {
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new Error("No user found associated with this token");
  }

  if (user.refresh_token !== token) {
    throw new Error("Token mismatched");
  }

  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone_no: user.phone_no,
    role: user.role,
  };

  const access_token = generateAccessToken(payload);

  const refresh_token = generateRefreshToken({
    _id: user._id,
  });

  user.refresh_token = refresh_token;
  await user.save();

  return {
    access_token,
    refresh_token,
  };
};
