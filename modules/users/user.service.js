const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./user.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../common/middlewares/authentication.middleware");

exports.loginService = async (identifier, password) => {
  const user = await User.findOne({ $or: [{ email : identifier }, { phone_no : identifier }] });
  if (!user) {
    throw new Error("No user found");
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    throw new Error("Invalid Password");
  }

  const result = user.toObject();
  delete result.password;

  const access_token = generateAccessToken(result);
  const refresh_token = generateRefreshToken(result);

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

  if (user.refresh_token.toString() !== token.toString()) {
    throw new Error("Token mismatched");
  }

  const result = user.toObject();
  delete result.password;

  const access_token = generateAccessToken(result);
  const refresh_token = generateRefreshToken(result);

  user.refresh_token = refresh_token;
  await user.save();

  return { access_token, refresh_token };
};