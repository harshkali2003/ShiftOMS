const express = require("express");
const router = express.Router();

const Order = require("./orders.controller");
const {verifyToken , roleAccess} = require("../../common/middlewares/authorization.middleware")

router.post("/api/v1/order/create" , verifyToken , Order.createOrderController);

router.get("/api/v1/order/my" , verifyToken , Order.getMyOrderController);

router.get("/api/v1/order/all" , verifyToken , roleAccess("ADMIN") , Order.getAllOrderController);

router.patch("/api/v1/status/:id" , verifyToken , roleAccess("ADMIN") , Order.updateOrderStatusController);

router.post("/api/v1/order/create/online" , verifyToken , Order.createOnlinePaymentController);

router.post("/api/v1/order/verify/:orderId" , verifyToken , Order.verifyPaymentController);

module.exports = router;