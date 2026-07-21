const mongoose = require("mongoose");

const stockLog = new mongoose.Schema({
    type : {
        type : String,
        enum : ["STOCK_ADDED" , "STOCK_DEDUCTED" , "STOCK_REMOVED"],
        required : true,
    },
    description : {
        type : String,
        required : true,
    }
} , {_id : false})

const productData = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    info : {
        type : String,
        required : true,
    },
    actualPrice : {
        type : Number,
        required : true,
        min : 1,
    },
    discountedPrice : {
        type : Number,
        min : 1,
    },
    stock : {
        type : Number,
        required : true,
        min : 1,
    },
    stockMovementLog : [stockLog]
} , {timestamps : true})

productData.index({name : 1})

module.exports = mongoose.model("Products" , productData);