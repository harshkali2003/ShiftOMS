const mongoose = require("mongoose");
const userData = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
    },
    phone_no : {
        type : String,
        required : true,
        min : 10,
    },
    password : {
        type : String,
        required : true,
    },
    role : {
        type : String,
        enum : ["CUSTOMER" , "ADMIN"],
        default : "CUSTOMER",
    },
    refresh_token : {
        type : String,
    }
} , {timestamps : true});

userData.index({email : 1} , {unique : true})
userData.index({phone_no : 1} , {unique : true})

module.exports = mongoose.model("Users" , userData);