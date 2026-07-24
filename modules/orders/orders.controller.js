const mongoose = require("mongoose");
const {
  createOrderService,
  getMyOrderService,
  getAllOrderService,
  updateOrderStatusService,
  createOnlinePaymentService,
  verifyPaymentService,
} = require("./orders.service");

exports.createOrderController = async (req, resp, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new Error("Login first");
    }

    const { items } = req.body;
    if (items.length === 0) {
      throw new Error("No item found");
    }

    const order = await createOrderService(userId, items);

    return resp.status(201).json({
      success: true,
      message: "Order created",
      data: order,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getMyOrderController = async (req, resp, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new Error("Login first");
    }

    const orders = await getMyOrderService(userId);

    return resp.status(200).json({
      success: true,
      message: "Order fetched",
      data: orders,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAllOrderController = async (req, resp, next) => {
  try {
    const {
      userId,
      orderStatus,
      paymentStatus,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const pageNum = parseInt(page, Math.max(page, 1) || 1);
    const limitNum = parseInt(limit, Math.max(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const { count, orders } = await getAllOrderService(filter, skip, limitNum);

    return resp.status(200).json({
      success: true,
      message: "Orders fetched",
      count: count,
      page: pageNum,
      data: orders,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateOrderStatusController = async (req, resp, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID");
    }

    const { status } = req.body;
    if (!status) {
      throw new Error("status can't be blank");
    }

    const order = await updateOrderStatusService(id, status);

    return resp.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createOnlinePaymentController = async (req, resp, next) => {
  try {
    const { totalPrice } = req.body;
    if (
      !totalPrice ||
      typeof totalPrice !== "number" ||
      totalPrice === undefined
    ) {
      throw new Error("Please pass valid price");
    }

    const order = await createOnlinePaymentService(totalPrice);

    return resp.status(201).json({
      success: true,
      message: "Order created",
      data: order,
    });
  } catch (err) {
    return next(err);
  }
};

exports.verifyPaymentController = async (req, resp, next) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error("Not a valid ID");
    }

    const { RAZORPAY_ORDER_ID, RAZORPAY_PAYMENT_ID, RAZORPAY_SIGNATURE } =
      req.body;
    if (!RAZORPAY_ORDER_ID || !RAZORPAY_PAYMENT_ID || !RAZORPAY_SIGNATURE) {
      throw new Error("Please pass valid fields");
    }

    const order = await verifyPaymentService(
      orderId,
      RAZORPAY_ORDER_ID,
      RAZORPAY_PAYMENT_ID,
      RAZORPAY_SIGNATURE,
    );

    return resp.status(201).json({
      success: true,
      message: "Payment verified successfully",
      data: order,
    });
  } catch (err) {
    return next(err);
  }
};
