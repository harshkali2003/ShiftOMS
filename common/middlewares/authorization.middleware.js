require("dotenv").config();
const jwt = require("jsonwebtoken");

const access_key = process.env.JWT_ACCESS_KEY;

const verifyToken = (req,resp,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return next(new Error("Missing Token"));
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token , access_key);

        req.user = decoded;

        next();
    }catch(err){
        return next(err);
    }
}

const roleAccess = (...allowedRoles) => {
    return (req,resp,next) => {
        const user = req?.user;
        if(!user || !user?.role){
            return next(new Error("Login first"));
        }

        if(!allowedRoles.includes(user?.role)){
            return next(new Error("Forbidden"))
        }

        next();
    }
}

module.exports = {verifyToken , roleAccess};