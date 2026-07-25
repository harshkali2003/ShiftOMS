const express = require("express");
const router = express.Router();

const Product = require("./products.controller");
const { roleAccess, verifyToken } = require("../../common/middlewares/authorization.middleware")

router.get("/api/v1/product" , Product.getAllProductController);
router.post("/api/v1/create" , verifyToken , roleAccess("ADMIN") , Product.postProductController);
router.patch("/api/v1/update" , verifyToken , roleAccess("ADMIN") , Product.updateProductController);

module.exports = router;