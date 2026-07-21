const mongoose = require("mongoose");
const items = new mongoose.Schema({
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Products",
        required : true,
    },
    quantity : {
        type : Number,
        required : true,
        min : 1,
    },
    price : {
        type : Number,
        required : true,
        min : 1,
    }
} , {_id : false})

const orderData = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true,
    },
    items : [items],
    totalPrice : {
        type : Number,
        required : true,
        min : 1,
    },
    orderStatus : {
        type : String,
        enum : ["PENDING" , "PROCESSED" , "SHIPPED" , "DELIVERED" , "CANCELLED"],
        default : "PENDING",
        required : true,
    },
    paymentStatus : {
        type : String,
        enum : ["PENDING" , "PAID"],
        default : "PENDING",
    }
} , {timestamps : true})

orderData.index({userId : 1})

module.exports = mongoose.model("Orders" , orderData);