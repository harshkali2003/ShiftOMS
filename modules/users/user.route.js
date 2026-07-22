const express = require("express");
const router = express.Router();

const User = require("./user.controller");
const { model } = require("mongoose");

router.post("/api/v1/login" , User.loginController)
router.post("/api/v1/register" , User.registerController)

module.exports = router;