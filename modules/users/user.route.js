const express = require("express");
const router = express.Router();

const User = require("./user.controller");

router.post("/api/v1/login" , User.loginController)
router.post("/api/v1/register" , User.registerController)
router.post("/api/v1/token" , User.createRefreshTokenController)

module.exports = router;