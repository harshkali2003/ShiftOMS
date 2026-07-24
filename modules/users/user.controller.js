const { loginService, regsiterService, createRefreshTokenService } = require("./user.service");

exports.loginController = async (req,resp,next) => {
    try{
        const {email , phone_no , password} = req.body;
        if((!email && !phone_no) || !password){
            throw new Error("All fields are required")
        }

        const identifier = email || phone_no;

        const {access_token , refresh_token} = loginService(identifier , password).select(-password);

        return resp.status(200).json({
            success : true,
            message : "Login successful",
            token : access_token,
            refresh_token : refresh_token,
        })
    } catch(err){
        return next(err);
    }
}

exports.registerController = async (req,resp,next) => {
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

exports.createRefreshTokenController = async (req , resp , next) => {
    try{
        const {token} = req.body;
        if(!token){
            throw new Error("Token is required");
        }

        const {access_token , refresh_token} = await createRefreshTokenService(token);

        return resp.status(201).json({
            success : true,
            message : "Refresh token created",
            access_token : access_token,
            refresh_token : refresh_token,
        })
    } catch(err){
        return next(err);
    }
}