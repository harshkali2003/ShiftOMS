const bcrypt = require("bcrypt");
const User = require("./user.model");
const { generateAccessToken, generateRefreshToken } = require("../../common/middlewares/authentication.middleware")

exports.loginService = (identifier , password) => {
    const user = await User.findOne({$or : [{email} , {phone_no}]});
    if(!user){
        throw new Error("No user found");
    }

    const matchedPassword = await bcrypt.compare(password , user.password);
    if(!matchedPassword){
        throw new Error("Invalid Password")
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);
    user.refresh_token = refresh_token;
    await user.save();

    return {access_token , refresh_token , user};
}

exports.regsiterService = (name , email , phone_no , password) => {
    const existingUser = await User.findOne({$or : [{"email"} , {"phone_no"}]});
    if(existingUser){
        throw new Error("Use different email or phone")
    }

    const hashedPassword = await bcrypt.hash(password , 10);

    const user = await User.create({
        name,
        email,
        phone_no,
        password : hashedPassword,
    })

    return user;
}