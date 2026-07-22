require("dotenv").config();
const jwt = require("jsonwebtoken");

const access_key = process.env.JWT_ACCESS_KEY;
const refresh_key = process.env.JWT_REFRESH_KEY;

const generateAccessToken = (payload) => {
    return jwt.sign(payload , access_key , {expiresIn : "48h"});
}

const generateRefreshToken = (payload) => {
    return jwt.sign(payload , refresh_key , {expiresIn : "192h"});
}

module.exports = {generateAccessToken , generateRefreshToken};