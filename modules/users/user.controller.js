const { loginService, regsiterService } = require("./user.service");

exports.loginController = (req,resp,next) => {
    try{
        const {email , phone_no , password} = req.body;
        if((!email && !phone_no) || !password){
            throw new Error("All fields are required")
        }

        const identifier = email || phone_no;

        const {access_token , refresh_token, user} = loginService(identifier , password).select(-password);

        return resp.status(200).json({
            success : true,
            message : "Login successful",
            data : user,
            token : access_token,
            refresh_token : refresh_token,
        })
    } catch(err){
        return next(err);
    }
}

exports.registerController = (req,resp,next) => {
    try{
        const {name , email , phone_no , password} = req.body;
        if(!name || !email || !phone_no || !password){
            throw new Error("All fields are required")
        }

        const user = await regsiterService(name,email,phone_no,password);

            return resp.status(201).json({
            success : true,
            message : "Registration successful",
            data : user,
        })
    } catch(err){
        return next(err);
    }
}