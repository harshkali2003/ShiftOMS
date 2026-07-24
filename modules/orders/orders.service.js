require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("./orders.model");
const Product = require("../products/products.model");
const razorpay = require("../../common/payment/razorpay");

exports.createOrderService = async (userId, items) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let totalPrice = 0;
    const processedItems = [];
    for (let item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new Error("Product is either unavailable or not found");
      }

      if (product.stock < item.quantity) {
        throw new Error("Not have much stock available");
      }

      const unitPrice = product.discountedPrice || product.actualPrice;
      totalPrice += item.quantity * unitPrice;

      product.stock -= item.quantity;

      product.stockMovementLog.push({
        type: "STOCK_DEDUCTED",
        description: `Purchased by user ${userId} in quantity of ${item.quantity}`,
      });

      await product.save({ session });

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: unitPrice,
      });
    }

    const [order] = await Order.create(
      [
        {
          userId,
          items: processedItems,
          totalPrice,
          orderStatus: "PENDING",
          paymentStatus: "PENDING",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

exports.getMyOrderService = async (userId) => {
  const orders = await Order.find({ userId });
  if (orders.length === 0) {
    throw new Error("No Order found");
  }

  return orders;
};

exports.getAllOrderService = async (filter, skip, limit) => {
  const orders = await Order.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (orders.length === 0) {
    throw new Error("No Order found");
  }

  const count = await Order.find(filter);

  return { count, orders };
};

exports.updateOrderStatusService = async (id, status) => {
  const allowedTransition = {
    PENDING: ["PROCESSED", "CANCELLED"],
    PROCESSED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  const order = await Order.findById(id);
  if (!order) {
    throw new Error("No Order found");
  }

  const currentStatus = order.orderStatus;

  if (currentStatus.toString() === status.toString()) {
    return order;
  }

  const validateStatus = allowedTransition[currentStatus] || [];
  if (!validateStatus.includes(status)) {
    throw new Error("Transition not allowed");
  }

  order.orderStatus = status;
  await order.save();

  return order;
};

exports.createOnlinePaymentService = async (totalPrice) => {
  const order = await razorpay.orders.create({
    amount: totalPrice * 100,
    currency: "INR",
    receipt: `RZP-${Date.now()}`,
  });

  return order;
};

exports.verifyPaymentService = async (
  orderId,
  RAZORPAY_ORDER_ID,
  RAZORPAY_PAYMENT_ID,
  RAZORPAY_SIGNATURE,
) => {
  const sign = `${RAZORPAY_ORDER_ID}|${RAZORPAY_PAYMENT_ID}`;
  const expectedSign = crypto
    .createHmac("sha-256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (expectedSign !== RAZORPAY_SIGNATURE) {
    throw new Error("Payment not verified");
  }

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new Error("No order found");
  }

  order.paymentStatus = "PAID";
  await order.save();

  return order;
};
